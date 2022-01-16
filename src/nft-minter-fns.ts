import { setup } from './setup';
import ora from 'ora';
import prompts, { PromptObject } from 'prompts';
import {
  getIssueTransaction,
  getIssuedToken,
  saveCollectionTokenAfterIssuance,
  getTheSCAddressFromOutputOrConfig,
  getAssignRolesTransaction,
  getMintTransaction,
  getGiveawayTransaction,
  getSetDropTransaction,
  getClaimScFundsTransaction,
  getUnsetDropTransaction,
  getPauseMintingTransaction,
  getUnpauseMintingTransaction,
} from './utils';
import {
  issueNftMinterGasLimit,
  issueNftMinterValue,
  assignRolesNftMinterGasLimit,
  collectionTokenNameLabel,
  collectionTokenTickerLabel,
  amountOfTokensLabel,
  mintTxBaseGasLimit,
  mintFunctionConfirmLabel,
  giveawayAddressLabel,
  giveawayTokensAmount,
  giveawayFunctionConfirmLabel,
  giveawayTxBaseGasLimit,
  claimScFundsTxGasLimit,
  dropTokensAmountLabel,
  setUnsetDropTxGasLimit,
  pauseUnpauseTxGasLimit,
} from './config';
import { exit } from 'process';

// TODO: better UX overall, catch statuses from smart contract results
// TODO: add more data checks and console logs
// TODO: refactor/reuse code

// Issue a collection token + add required roles
const issueCollectionToken = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'tokenName',
      message: collectionTokenNameLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'tokenTicker',
      message: collectionTokenTickerLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { tokenName, tokenTicker } = await prompts(promptQuestions);

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
      tokenName,
      tokenTicker
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
const setLocalRoles = async () => {
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

const mint = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'tokensAmount',
      message: amountOfTokensLabel,
    },
  ];

  const confirmationQuestions: PromptObject[] = [
    {
      type: 'select',
      name: 'areYouSureAnswer',
      message: mintFunctionConfirmLabel,
      choices: [
        { title: 'Yes', value: 'yes' },
        { title: 'No', value: 'no' },
      ],
    },
  ];

  try {
    const { tokensAmount } = await prompts(promptQuestions);
    const { areYouSureAnswer } = await prompts(confirmationQuestions);

    if (areYouSureAnswer !== 'yes') {
      console.log('Minting aborted!');
      exit(9);
    }

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const mintTx = getMintTransaction(
      smartContract,
      mintTxBaseGasLimit,
      Number(tokensAmount)
    );

    mintTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(mintTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await mintTx.send(provider);
    await mintTx.awaitExecuted(provider);
    const txHash = mintTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

const giveaway = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'giveawayAddress',
      message: giveawayAddressLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'giveawayTokensAmount',
      message: giveawayTokensAmount,
    },
  ];

  const confirmationQuestions: PromptObject[] = [
    {
      type: 'select',
      name: 'areYouSureAnswer',
      message: giveawayFunctionConfirmLabel,
      choices: [
        { title: 'Yes', value: 'yes' },
        { title: 'No', value: 'no' },
      ],
    },
  ];

  try {
    const { giveawayAddress, giveawayTokensAmount } = await prompts(
      promptQuestions
    );

    if (!giveawayAddress) {
      console.log('You have to provide the give away address!');
      exit(9);
    }

    const { areYouSureAnswer } = await prompts(confirmationQuestions);

    if (areYouSureAnswer !== 'yes') {
      console.log('Giveaway borted!');
      exit(9);
    }

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const giveawayTx = getGiveawayTransaction(
      smartContract,
      giveawayTxBaseGasLimit,
      giveawayAddress,
      Number(giveawayTokensAmount)
    );

    giveawayTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(giveawayTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await giveawayTx.send(provider);
    await giveawayTx.awaitExecuted(provider);
    const txHash = giveawayTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

const claimScFunds = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const claimScFundsTx = getClaimScFundsTransaction(
      smartContract,
      claimScFundsTxGasLimit
    );

    claimScFundsTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(claimScFundsTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await claimScFundsTx.send(provider);
    await claimScFundsTx.awaitExecuted(provider);
    const txHash = claimScFundsTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

const setDrop = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'number',
      name: 'dropTokensAmount',
      message: dropTokensAmountLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { dropTokensAmount } = await prompts(promptQuestions);

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const setDropTx = getSetDropTransaction(
      smartContract,
      setUnsetDropTxGasLimit,
      dropTokensAmount
    );

    setDropTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(setDropTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await setDropTx.send(provider);
    await setDropTx.awaitExecuted(provider);
    const txHash = setDropTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

const unsetDrop = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const unsetDropTx = getUnsetDropTransaction(
      smartContract,
      setUnsetDropTxGasLimit
    );

    unsetDropTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(unsetDropTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await unsetDropTx.send(provider);
    await unsetDropTx.awaitExecuted(provider);
    const txHash = unsetDropTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

const pauseMinting = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const pauseMintingTx = getPauseMintingTransaction(
      smartContract,
      pauseUnpauseTxGasLimit
    );

    pauseMintingTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(pauseMintingTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await pauseMintingTx.send(provider);
    await pauseMintingTx.awaitExecuted(provider);
    const txHash = pauseMintingTx.getHash();

    spinner.stop();

    console.log(`Transaction hash: ${txHash}`);
  } catch (e) {
    console.log(e);
  }
};

const startMinting = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const pauseMintingTx = getUnpauseMintingTransaction(
      smartContract,
      pauseUnpauseTxGasLimit
    );

    pauseMintingTx.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(pauseMintingTx);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await pauseMintingTx.send(provider);
    await pauseMintingTx.awaitExecuted(provider);
    const txHash = pauseMintingTx.getHash();

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
    mint: 'mint',
    giveaway: 'giveaway',
    claimScFunds: 'claim-sc-funds',
    setDrop: 'set-drop',
    unsetDrop: 'unset-drop',
    pauseMinting: 'pause-minting',
    startMinting: 'start-minting',
  };

  if (subcommand === '-h' || subcommand === '--help') {
    console.log(`Available commands: ${Object.values(COMMANDS).join(', ')}`);
    exit(9);
  }

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
  if (subcommand === COMMANDS.mint) {
    mint();
  }
  if (subcommand === COMMANDS.giveaway) {
    giveaway();
  }
  if (subcommand === COMMANDS.claimScFunds) {
    claimScFunds();
  }
  if (subcommand === COMMANDS.setDrop) {
    setDrop();
  }
  if (subcommand === COMMANDS.unsetDrop) {
    unsetDrop();
  }
  if (subcommand === COMMANDS.pauseMinting) {
    pauseMinting();
  }
  if (subcommand === COMMANDS.startMinting) {
    startMinting();
  }
};
