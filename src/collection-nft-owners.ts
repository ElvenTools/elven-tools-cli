import { Address } from '@elrondnetwork/erdjs';
import fetch from 'cross-fetch';
import { Buffer } from 'buffer';
import fs from 'fs';
import { exit, cwd } from 'process';
import ora from 'ora';
import pThrottle from 'p-throttle';
import prompts, { PromptObject } from 'prompts';
import {
  proxyGateways,
  chain,
  collectionNftOwnersTickerLabel,
  collectionNftOwnersOnlyUniqLabel,
  collectionNftOwnersNoSmartContractsLabel,
  collectionNftOwnersCallsPerSecond,
  collectionNftOwnersMetadataFileName,
  collectionNftOwnersAggregateLabel,
} from './config';

interface NftToken {
  owner: string;
  attributes: string;
}

const MAX_SIZE = 100;

const spinner = ora('Processing, please wait...');

const getMetadataFileName = (str: string) => {
  return str
    .split(';')
    .filter((item) => item.includes('metadata'))?.[0]
    .split('/')?.[1]
    .split('.')?.[0];
};

export const collectionNftOwners = async () => {
  let tokensNumber = '';

  const promptsQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'collectionTicker',
      message: collectionNftOwnersTickerLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'select',
      name: 'onlyUniq',
      message: collectionNftOwnersOnlyUniqLabel,
      choices: [
        { title: 'No', value: false },
        { title: 'Yes', value: true },
      ],
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
      type: (_, values) => (!values.onlyUniq ? 'select' : null),
      name: 'aggregate',
      message: collectionNftOwnersAggregateLabel,
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
    const {
      collectionTicker,
      onlyUniq,
      noSmartContracts,
      fileNamesList,
      aggregate,
    } = await prompts(promptsQuestions);

    if (!collectionTicker) {
      console.log(
        'You have to provide CIDs, amount of tokens and selling price!'
      );
      exit(9);
    }

    const addressesArr: string[][] = [];

    const response = await fetch(
      `${proxyGateways[chain]}/collections/${collectionTicker}/nfts/count`
    );

    tokensNumber = await response.text();

    console.log(`There is ${tokensNumber} tokens in that collection.`);

    if (Number(tokensNumber) === 0) {
      console.log(
        '\nThere are no tokens. Please check if you configured the proper chain. By default, it will be the devnet. You can change it using the .elventoolsrc configuration file.\n'
      );
      exit(9);
    }

    spinner.start();

    const makeCalls = () =>
      new Promise<string[]>((resolve) => {
        const repeats = Math.ceil(Number(tokensNumber) / MAX_SIZE);

        const throttle = pThrottle({
          limit: collectionNftOwnersCallsPerSecond,
          interval: 1000,
        });

        let madeRequests = 0;

        const throttled = throttle(async (index: number) => {
          const response = await fetch(
            `${
              proxyGateways[chain]
            }/collections/${collectionTicker}/nfts?withOwner=true&from=${
              index * MAX_SIZE
            }&size=${MAX_SIZE}`
          );
          const data = await response.json();

          let filteredData: NftToken[] = data;

          // Filtering by metadata json file name
          if (fileNamesList?.[0]) {
            filteredData = data.filter((item: NftToken) => {
              const attrsDecoded = item.attributes
                ? Buffer.from(item.attributes, 'base64').toString()
                : undefined;
              if (attrsDecoded) {
                return fileNamesList.some((item: string) => {
                  return item === getMetadataFileName(attrsDecoded);
                });
              }
              return false;
            });
          }

          const addrs = filteredData.map((token: NftToken) => token.owner);
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

    let addresses: string[] = await makeCalls();

    if (onlyUniq) {
      addresses = [...new Set(addresses)];
    }

    if (noSmartContracts) {
      addresses = addresses.filter(
        (address) =>
          typeof address === 'string' &&
          !Address.fromString(address).isContractAddress()
      );
    }

    const addressesLength = addresses.length;

    let additionalInfo = '';

    if (addressesLength > 0) {
      fs.writeFileSync(
        `${cwd()}/nft-collection-owners.json`,
        JSON.stringify(addresses, null, 2),
        'utf8'
      );
    }

    if (aggregate) {
      const countPerAddresses = addresses.reduce(
        (accumulator: { [key: string]: number }, value) => {
          const c: number = accumulator[value] || 0;
          return {
            ...accumulator,
            [value]: c + 1,
          };
        },
        {}
      );

      const countPerAddressesSorted = Object.fromEntries(
        Object.entries(countPerAddresses).sort(([, a], [, b]) => b - a)
      );

      fs.writeFileSync(
        `${cwd()}/nft-collection-owners-count.json`,
        JSON.stringify(countPerAddressesSorted, null, 2),
        'utf8'
      );
    }

    if (onlyUniq || noSmartContracts) {
      additionalInfo = `${onlyUniq ? ' Only uniq addresses.' : ''}${
        noSmartContracts ? ' Without smart contract addresses.' : ''
      }`;
    }

    console.log(`Done, ${addressesLength} addresses saved.${additionalInfo}`);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};
