import { exit } from 'process';
import ora from 'ora';
import { setupSftSc } from './setup';
import {
  getSftSCAddressFromOutputOrConfig,
  getSftIssueTransaction,
  commonTxOperations,
  areYouSureAnswer,
  getSftAssignRolesTransaction,
} from './utils';
import prompts, { PromptObject } from 'prompts';
import {
  collectionTokenNameLabel,
  collectionTokenTickerLabel,
  issueSftMinterValue,
  issueSftMinterGasLimit,
  assignRolesSftMinterGasLimit,
} from './config';

// Issue a collection token + add required roles
const issueCollectionToken = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'tokenName',
      message: collectionTokenNameLabel,
      validate: (value) => {
        if (!value) return 'Required!';
        if (value.length > 20 || value.length < 3) {
          return 'Length between 3 and 20 characters!';
        }
        if (!new RegExp(/^[a-zA-Z0-9]+$/).test(value)) {
          return 'Alphanumeric characters only!';
        }
        return true;
      },
    },
    {
      type: 'text',
      name: 'tokenTicker',
      message: collectionTokenTickerLabel,
      validate: (value) => {
        if (!value) return 'Required!';
        if (value.length > 10 || value.length < 3) {
          return 'Length between 3 and 10 characters!';
        }
        if (!new RegExp(/^[A-Z0-9]+$/).test(value)) {
          return 'Alphanumeric UPPERCASE only!';
        }
        return true;
      },
    },
  ];

  const spinner = ora('Processing the transaction...');

  try {
    const { tokenName, tokenTicker } = await prompts(promptQuestions);

    await areYouSureAnswer();

    if (!tokenName || !tokenTicker) {
      console.log('You have to provide a token name and ticker value!');
      exit(9);
    }

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const issueCollectionTokenTx = getSftIssueTransaction(
      smartContract,
      issueSftMinterGasLimit,
      issueSftMinterValue,
      tokenName,
      tokenTicker
    );

    await commonTxOperations(
      issueCollectionTokenTx,
      userAccount,
      signer,
      provider
    );
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
  }
};

// For now only nft create role, it will be improvement after SC improvements
const setLocalRoles = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const assignRolesTx = getSftAssignRolesTransaction(
      smartContract,
      assignRolesSftMinterGasLimit
    );

    await commonTxOperations(assignRolesTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

export const sftMinter = async (subcommand?: string) => {
  const COMMANDS = {
    issueCollectionToken: 'issue-collection-token',
    setLocalRoles: 'set-roles',
    create: 'create',
  };

  if (subcommand === '-h' || subcommand === '--help') {
    console.log(
      `========================\nAvailable commands:\n========================\n${Object.values(
        COMMANDS
      ).join('\n')}`
    );
    exit(9);
  }

  if (!subcommand || !Object.values(COMMANDS).includes(subcommand)) {
    console.log(
      `====================================================\nPlaese provide a proper command. Available commands:\n====================================================\n${Object.values(
        COMMANDS
      ).join('\n')}`
    );
    exit(9);
  }

  switch (subcommand) {
    case COMMANDS.issueCollectionToken:
      issueCollectionToken();
      break;
    case COMMANDS.setLocalRoles:
      setLocalRoles();
      break;
    // case COMMANDS.create:
    //   create();
    //   break;
  }
};
