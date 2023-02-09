import { Address } from '@multiversx/sdk-core';
import fetch from 'cross-fetch';
import { Buffer } from 'buffer';
import fs from 'fs';
import { exit, cwd } from 'process';
import ora from 'ora';
import pThrottle from 'p-throttle';
import prompts, { PromptObject } from 'prompts';
import {
  chain,
  apiProvider,
  collectionNftOwnersTickerLabel,
  collectionNftOwnersNoSmartContractsLabel,
  collectionNftOwnersCallsPerSecond,
  collectionNftOwnersMetadataFileName,
} from './config';

interface NftToken {
  owner: string;
  attributes: string;
  identifier: string;
}

interface OutputItemToken {
  identifier: string;
  metadataFileName: string;
}

interface OutputItem {
  owner: string;
  tokens: OutputItemToken[];
  tokensCount: number;
}

interface SingleApiResponseItem extends OutputItemToken {
  owner: string;
}

const MAX_SIZE = 100;

const spinner = ora('Processing, please wait...');

const getMetadataFileName = (attributes: string) => {
  const attrsDecoded = attributes
    ? Buffer.from(attributes, 'base64').toString()
    : undefined;
  if (!attrsDecoded) return '';

  const metadataKey = attrsDecoded
    .split(';')
    .filter((item) => item.includes('metadata'))?.[0];

  if (!metadataKey) return '';

  return metadataKey.split('/')?.[1].split('.')?.[0];
};

export const collectionNftOwners = async () => {
  let tokensNumber = '0';

  const promptsQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'collectionTicker',
      message: collectionNftOwnersTickerLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'select',
      name: 'noSmartContracts',
      message: collectionNftOwnersNoSmartContractsLabel,
      choices: [
        { title: 'Yes', value: true },
        { title: 'No', value: false },
      ],
    },
    {
      type: 'list',
      name: 'fileNamesList',
      message: collectionNftOwnersMetadataFileName,
    },
  ];

  try {
    const { collectionTicker, noSmartContracts, fileNamesList } = await prompts(
      promptsQuestions
    );

    if (!collectionTicker) {
      console.log('You have to provide a collection ticker!');
      exit(9);
    }

    const addressesArr: SingleApiResponseItem[][] = [];

    try {
      // It must be the api, not gateway
      const response = await fetch(
        `${apiProvider[chain]}/collections/${collectionTicker}/nfts/count`
      );

      tokensNumber = await response.text();
    } catch (e) {
      const err = e as Error;
      console.log(
        `Something went wrong. Can't fetch the tokens count: ${err?.message}`
      );
    }

    if (!Number(tokensNumber)) {
      console.log(
        '\nThere are no tokens in that collection. Please check if you configured the proper chain. By default, it will be the devnet. You can change it using the .elventoolsrc configuration file.\n'
      );
      exit(9);
    } else {
      console.log(`There are ${tokensNumber} tokens in that collection.`);
    }

    spinner.start();

    const makeCalls = () =>
      new Promise<SingleApiResponseItem[]>((resolve) => {
        const repeats = Math.ceil(Number(tokensNumber) / MAX_SIZE);

        const throttle = pThrottle({
          limit: collectionNftOwnersCallsPerSecond,
          interval: 1000,
        });

        let madeRequests = 0;

        const throttled = throttle(async (index: number) => {
          const response = await fetch(
            `${
              apiProvider[chain]
            }/collections/${collectionTicker}/nfts?withOwner=true&from=${
              index * MAX_SIZE
            }&size=${MAX_SIZE}`
          );
          const data = await response.json();

          const addrs = data.map((token: NftToken) => {
            return {
              owner: token.owner,
              identifier: token.identifier,
              metadataFileName: getMetadataFileName(token.attributes),
            };
          });
          if (index >= Math.ceil(repeats / 2)) {
            spinner.text = 'Almost there...';
          }
          addressesArr.push(addrs);
          if (madeRequests >= repeats - 1) {
            spinner.stop();
            const flatten = addressesArr.flat();
            return resolve(flatten);
          }
          if (madeRequests < repeats) madeRequests++;
        });

        for (let step = 0; step < repeats; step++) {
          (async () => throttled(step))();
        }
      });

    let addresses: SingleApiResponseItem[] = await makeCalls();

    if (noSmartContracts) {
      addresses = addresses.filter(
        (addrObj) =>
          typeof addrObj.owner === 'string' &&
          !Address.fromString(addrObj.owner).isContractAddress()
      );
    }

    const addressesLength = addresses.length;

    let additionalInfo = '';

    if (addressesLength === 0) {
      console.log('No addresses found!');
      exit(9);
    }

    const onlyUnique = (
      value: SingleApiResponseItem,
      index: number,
      self: SingleApiResponseItem[]
    ) => {
      return (
        self.findIndex(
          (v: SingleApiResponseItem) => v.owner === value.owner
        ) === index
      );
    };

    const uniqAddresses = addresses.filter(onlyUnique);

    const getTokensForTheSameAddress = (uniqAddr: SingleApiResponseItem) => {
      return addresses
        .filter((addr) => addr.owner === uniqAddr.owner)
        .map((addr) => {
          return {
            identifier: addr.identifier,
            metadataFileName: addr.metadataFileName,
          };
        });
    };

    const notSortedOutput: OutputItem[] = uniqAddresses.map(
      (uniqAddr: SingleApiResponseItem) => {
        const tokensForTheSameAddress = getTokensForTheSameAddress(uniqAddr);
        return {
          owner: uniqAddr.owner,
          tokens: tokensForTheSameAddress,
          tokensCount: tokensForTheSameAddress.length,
        };
      }
    );

    const sortedOutput = notSortedOutput.sort(
      (a: OutputItem, b: OutputItem) => b.tokensCount - a.tokensCount
    );

    let output = sortedOutput;

    // Filtering by metadata json file name
    if (fileNamesList?.[0]) {
      output = sortedOutput.filter((item: OutputItem) => {
        return fileNamesList.some((fileName: string) => {
          return (
            item.tokens.findIndex(
              (item: OutputItemToken) => item.metadataFileName === fileName
            ) > -1
          );
        });
      });
    }

    if (output) {
      fs.writeFileSync(
        `${cwd()}/nft-collection-owners.json`,
        JSON.stringify(output, null, 2),
        'utf8'
      );
    }

    if (noSmartContracts) {
      additionalInfo = `${
        noSmartContracts ? ' Without smart contract addresses.' : ''
      }`;
    }

    console.log(`Done, ${output.length} addresses saved.${additionalInfo}`);
    console.log('Check the nft-collection-owners.json file');
    console.log(
      'You can also export them to CSV using:\nhttps://github.com/ElvenTools/elven-tools-collection-owners-csv'
    );
  } catch (e) {
    console.log((e as Error)?.message);
  }
};
