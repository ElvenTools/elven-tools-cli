import { setup } from './setup';
import ora from 'ora';
import prompt from 'prompt';
import {
  getIssueTransaction,
  getIssuedToken,
  saveCollectionTokenAfterIssuance,
  getTheSCAddressFromOutputOrConfig,
  getAssignRolesTransaction,
} from './utils';
import {
  issueNftMinterGasLimit,
  issueNftMinterValue,
  assignRolesNftMinterGasLimit,
  collectionTokenNameLabel,
  collectionTokenTickerLabel,
} from './config';
import { exit } from 'process';

// Issue a collection token + add required roles
export const issueCollectionToken = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();

  const promptSchema = {
    properties: {
      tokenName: {
        description: collectionTokenNameLabel,
        required: true,
      },
      tokenTicker: {
        description: collectionTokenTickerLabel,
        required: true,
      },
    },
  };

  prompt.start();

  try {
    const { tokenName, tokenTicker } = await prompt.get(promptSchema);

    if (!tokenName || !tokenTicker) {
      console.log('You have to provide the token name and ticker value!');
      exit(9);
    }

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const issueCollectionTokenTx = getIssueTransaction(
      smartContract,
      issueNftMinterGasLimit,
      issueNftMinterValue,
      tokenName as string,
      tokenTicker as string
    );

    issueCollectionTokenTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(issueCollectionTokenTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await issueCollectionTokenTx.send(provider);
    await issueCollectionTokenTx.awaitNotarized(provider);
    const txHash = issueCollectionTokenTx.getHash();

    // TODO: catch sc errors when erdjs bug is resolved
    // const scResults = (
    //   await issueCollectionTokenTx.getAsOnNetwork(provider)
    // ).getSmartContractResults();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);

    spinner.start();

    console.log('Acquiring the token info...');

    const queryResponse = await getIssuedToken(provider, smartContract);

    spinner.stop();

    const tokenId = Buffer.from(
      queryResponse?.returnData?.[0],
      'base64'
    ).toString();

    console.log('Your collection token id: ', tokenId);
    console.log('Also saved in the output.json file.');

    saveCollectionTokenAfterIssuance(tokenId);
  } catch (e) {
    console.log(e);
  }
};

// For now only nft create role, it will be improvement after SC improvements
export const setLocalRoles = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const assignRolesTx = getAssignRolesTransaction(
      smartContract,
      assignRolesNftMinterGasLimit
    );

    assignRolesTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(assignRolesTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await assignRolesTx.send(provider);
    await assignRolesTx.awaitExecuted(provider);
    const txHash = assignRolesTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

export const nftMinter = async (subcommand?: string) => {
  const COMMANDS = {
    issueCollectionToken: 'issue-collection-token',
    setLocalRoles: 'set-roles',
  };

  if (!subcommand || !Object.values(COMMANDS).includes(subcommand)) {
    console.log(
      `Plaese provide a proper command. Available commands: ${Object.values(
        COMMANDS
      ).join(', ')}`
    );
    exit(9);
  }

  if (subcommand === COMMANDS.issueCollectionToken) {
    issueCollectionToken();
  }

  if (subcommand === COMMANDS.setLocalRoles) {
    setLocalRoles();
  }
};
