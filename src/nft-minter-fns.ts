import { setup } from './setup';
import ora from 'ora';
import prompts, { PromptObject } from 'prompts';
import {
  getIssueTransaction,
  getIssuedToken,
  updateOutputFile,
  getTheSCAddressFromOutputOrConfig,
  getAssignRolesTransaction,
  getMintTransaction,
  getGiveawayTransaction,
  getSetDropTransaction,
  getClaimScFundsTransaction,
  getUnsetDropTransaction,
  getPauseMintingTransaction,
  getUnpauseMintingTransaction,
  commonTxOperations,
  getSetNewPriceTransaction,
  areYouSureAnswer,
} from './utils';
import {
  issueNftMinterGasLimit,
  issueNftMinterValue,
  assignRolesNftMinterGasLimit,
  collectionTokenNameLabel,
  collectionTokenTickerLabel,
  amountOfTokensLabel,
  mintTxBaseGasLimit,
  giveawayAddressLabel,
  giveawayTokensAmount,
  giveawayTxBaseGasLimit,
  claimScFundsTxGasLimit,
  dropTokensAmountLabel,
  setUnsetDropTxGasLimit,
  pauseUnpauseTxGasLimit,
  setNewPriceGasLimit,
  deployNftMinterSellingPriceLabel,
} from './config';
import { exit } from 'process';

// TODO: better UX overall, catch statuses from smart contract results
// TODO: add more data checks and console logs

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

    updateOutputFile({ tokenId });
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

    await commonTxOperations(assignRolesTx, userAccount, signer, provider);
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

  try {
    const { tokensAmount } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const mintTx = getMintTransaction(
      smartContract,
      mintTxBaseGasLimit,
      Number(tokensAmount)
    );

    await commonTxOperations(mintTx, userAccount, signer, provider);
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

  try {
    const { giveawayAddress, giveawayTokensAmount } = await prompts(
      promptQuestions
    );

    if (!giveawayAddress) {
      console.log('You have to provide the give away address!');
      exit(9);
    }

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const giveawayTx = getGiveawayTransaction(
      smartContract,
      giveawayTxBaseGasLimit,
      giveawayAddress,
      Number(giveawayTokensAmount)
    );

    await commonTxOperations(giveawayTx, userAccount, signer, provider);
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

    await commonTxOperations(claimScFundsTx, userAccount, signer, provider);
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

    await commonTxOperations(setDropTx, userAccount, signer, provider);
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

    await commonTxOperations(unsetDropTx, userAccount, signer, provider);
  } catch (e) {
    console.log(e);
  }
};

const pauseMinting = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const pauseMintingTx = getPauseMintingTransaction(
      smartContract,
      pauseUnpauseTxGasLimit
    );

    await commonTxOperations(pauseMintingTx, userAccount, signer, provider);
  } catch (e) {
    console.log(e);
  }
};

const startMinting = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const startMintingTx = getUnpauseMintingTransaction(
      smartContract,
      pauseUnpauseTxGasLimit
    );

    await commonTxOperations(startMintingTx, userAccount, signer, provider);
  } catch (e) {
    console.log(e);
  }
};

const setNewPrice = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'newPrice',
      message: deployNftMinterSellingPriceLabel,
      validate: (value) =>
        !Number(value) || Number(value) <= 0 ? 'Required and min 0!' : true,
    },
  ];

  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { newPrice } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const changePriceTx = getSetNewPriceTransaction(
      smartContract,
      setNewPriceGasLimit,
      newPrice
    );

    await commonTxOperations(changePriceTx, userAccount, signer, provider);

    updateOutputFile({ sellingPrice: newPrice });
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
    setNewPrice: 'set-new-price',
  };

  if (subcommand === '-h' || subcommand === '--help') {
    console.log(`Available commands:\n${Object.values(COMMANDS).join('\n')}`);
    exit(9);
  }

  if (!subcommand || !Object.values(COMMANDS).includes(subcommand)) {
    console.log(
      `Plaese provide a proper command. Available commands:\n${Object.values(
        COMMANDS
      ).join('\n')}`
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
  if (subcommand === COMMANDS.setNewPrice) {
    setNewPrice();
  }
};
