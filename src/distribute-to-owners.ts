import axios from 'axios';
import { writeFile } from 'fs';
import { exit } from 'process';
import prompts, { PromptObject } from 'prompts';
import ora from 'ora';
import pThrottle from 'p-throttle';

import {
  areYouSureAnswer,
  getFileContents,
  distributeEgldSingleAddress,
  distributeEsdtSingleAddress,
  distributeMetaEsdtSingleAddress,
  distributeSftSingleAddress,
} from './utils';
import { publicEndpointSetup } from './setup';
import { apiProvider, chain, distributeToOwnersCallsPerSecond } from './config';

type Owner = {
  owner: string;
  tokensCount: number;
};

enum TokenType {
  EGLD = 'EGLD',
  ESDT = 'ESDT',
  SFT = 'SFT',
  MetaESDT = 'Meta ESDT',
}

const spinner = ora('Processing, please wait...');

const throttle = pThrottle({
  limit: distributeToOwnersCallsPerSecond,
  interval: 1000,
});

const validAddresses = (owners: Owner[]) => {
  const addresses = owners.map((item) => item.owner);
  return addresses.every(
    (address) => Boolean(address) && address.length === 62
  );
};

const promptQuestions: PromptObject[] = [
  {
    type: 'select',
    name: 'tokenType',
    message: 'What do you want to distribute? Choose the token type.\n',
    choices: [
      {
        title: 'EGLD',
        value: TokenType.EGLD,
      },
      {
        title: 'ESDT',
        value: TokenType.ESDT,
      },
      {
        title: 'SFT',
        value: TokenType.SFT,
      },
      {
        title: 'Meta ESDT',
        value: TokenType.MetaESDT,
      },
    ],
  },
  {
    type: (prev) => (prev !== TokenType.EGLD ? 'text' : null),
    name: 'token',
    message: (_, values) =>
      `Please provide the ${values.tokenType} token ticker/id (ex. ABCD-ds323d${
        values.tokenType === TokenType.MetaESDT ||
        values.tokenType === TokenType.SFT
          ? '-0d'
          : ''
      })\n`,
    validate: (value) => (!value ? 'Required!' : true),
  },
  {
    type: 'text',
    name: 'amount',
    message: (_, values) =>
      `Please provide the amount of the ${values.tokenType} to send per one address (ex. 1 is 1 ${values.tokenType})\n`,
    validate: (value) =>
      value && !Number.isNaN(value) && Number(value) > 0
        ? true
        : `Please provide a number, should be a proper EGLD amount, bigger than 0`,
  },
  {
    type: 'select',
    name: 'multiply',
    message:
      'You can multiply the amount to distribute by the number of NFTs tokens owned. Do you want to do that?',
    choices: [
      { title: 'No', value: false },
      { title: 'Yes', value: true },
    ],
  },
];

export const distributeToOwners = async () => {
  try {
    const { amount, tokenType, token, multiply } =
      await prompts(promptQuestions);

    if (!amount) {
      console.log('You have to provide the amount per address!');
      exit(9);
    }

    if (tokenType !== TokenType.EGLD && !token) {
      console.log('You have to provide the token ticker/id!');
      exit(9);
    }

    await areYouSureAnswer();

    const { signer, userAccount, provider } = await publicEndpointSetup();

    const owners: Owner[] = getFileContents('nft-collection-owners.json', {
      noExitOnError: true,
    });

    if (owners) {
      if (!validAddresses(owners)) {
        console.log(
          'One or more addresses are not valid! Check if they are valid MultiversX bech32 addresses.'
        );
        exit(9);
      }

      const promises: Promise<{
        receiverAddress: string;
        txHash: string;
        txStatus: string;
      }>[] = [];

      spinner.text = `Distributing ${tokenType} ${token ? token + ' ' : ''}to ${
        owners.length
      } addresses, please wait...`;

      spinner.start();

      let numDecimals: number | undefined;
      let nonce: number | undefined;
      let collectionTicker: string | undefined;

      if (tokenType === TokenType.ESDT) {
        const esdtOnNetwork = await axios.get<{ decimals: number }>(
          `${apiProvider[chain]}/tokens/${encodeURIComponent(token.trim())}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        numDecimals = esdtOnNetwork?.data?.decimals;

        if (!numDecimals) {
          console.log(
            "Can't get the information about the number of decimals for the token. Try again."
          );
          exit(9);
        }
      }

      if (tokenType === TokenType.MetaESDT || tokenType === TokenType.SFT) {
        const metaEsdtOnNetwork = await axios.get<{
          decimals: number;
          nonce: number;
          ticker: string;
        }>(`${apiProvider[chain]}/nfts/${encodeURIComponent(token.trim())}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        numDecimals = metaEsdtOnNetwork?.data?.decimals;
        nonce = metaEsdtOnNetwork?.data?.nonce;
        collectionTicker = metaEsdtOnNetwork?.data?.ticker;

        if (tokenType === TokenType.MetaESDT && !numDecimals) {
          console.log(
            "Can't get the information about the decimals for the token. Try again."
          );
          exit(9);
        }

        if (!nonce || !collectionTicker) {
          console.log(
            "Can't get the token information (decimals, nonce, collection ticker). Try again."
          );
          exit(9);
        }
      }

      let multipliedAmount: string = amount;

      const throttled = throttle((ownerObj: Owner) => {
        if (!ownerObj) return;

        if (multiply) {
          multipliedAmount = (
            Number(amount) * Number(ownerObj.tokensCount)
          ).toString();
        }

        if (tokenType === TokenType.EGLD) {
          const statusPromise = distributeEgldSingleAddress(
            multipliedAmount,
            ownerObj.owner,
            userAccount,
            signer,
            provider
          );

          promises.push(statusPromise);
        }

        if (tokenType === TokenType.ESDT && numDecimals) {
          const statusPromise = distributeEsdtSingleAddress(
            multipliedAmount,
            ownerObj.owner,
            userAccount,
            signer,
            provider,
            token,
            numDecimals
          );

          promises.push(statusPromise);
        }

        if (
          tokenType === TokenType.MetaESDT &&
          numDecimals &&
          collectionTicker &&
          nonce
        ) {
          const statusPromise = distributeMetaEsdtSingleAddress(
            multipliedAmount,
            ownerObj.owner,
            userAccount,
            signer,
            provider,
            numDecimals,
            collectionTicker,
            nonce
          );

          promises.push(statusPromise);
        }

        if (tokenType === TokenType.SFT && collectionTicker && nonce) {
          const statusPromise = distributeSftSingleAddress(
            multipliedAmount,
            ownerObj.owner,
            userAccount,
            signer,
            provider,
            collectionTicker,
            nonce
          );

          promises.push(statusPromise);
        }
      });

      for (const owner of owners) {
        await throttled(owner);
      }

      const statuses = await Promise.all(promises);

      spinner.stop();

      console.log(
        "Distribution complete! Check the 'distribiution-log.json' file for more details."
      );

      writeFile(
        'distribiution-log.json',
        JSON.stringify(statuses, null, 2),
        (err: any) => {
          if (err) throw err;
        }
      );
    } else {
      console.log(
        'There were problems when reading the nft-collection-owners.json file.'
      );
      console.log(
        "Make sure you've generated the file using the 'elven-tools collection-nft-owners' command. Or you created the file with the structure: [{ 'owner': 'erd1...' }, { 'owner': 'erd1...' }]"
      );
      exit(9);
    }
  } catch (e) {
    console.log(`\n${JSON.stringify((e as Error)?.message)}`);
    console.log(
      'Check if you use the correct chain (mainnet, devnet, testnet) and if the chosen token is on your wallet. Sometimes it can also be a temporary network outage.'
    );
  } finally {
    spinner.stop();
  }
};
