import { setupNftSc, publicEndpointSetup } from './setup';
import ora from 'ora';
import prompts, { PromptObject } from 'prompts';
import {
  getNftIssueTransaction,
  updateOutputFile,
  getNftSCAddressFromOutputOrConfig,
  getNftAssignRolesTransaction,
  getMintTransaction,
  getGiveawayTransaction,
  getSetDropTransaction,
  getUnsetDropTransaction,
  getPauseMintingTransaction,
  getUnpauseMintingTransaction,
  commonTxOperations,
  getSetNewPriceTransaction,
  areYouSureAnswer,
  getClaimDevRewardsTransaction,
  getShuffleTransaction,
  commonScQuery,
  getMintedPerAddressQuery,
  getChangeBaseCidsTransaction,
  getSetNewTokensLimitPerAddressTransaction,
  getClaimScFundsTransaction,
  getMintedPerAddressPerDropQuery,
  getPopulateAllowlistTx,
  getAllowlistAddressCheckQuery,
  getEnableAllowlistTransaction,
  getDisableAllowlistTransaction,
  getFileContents,
  getClearAllowlistTx,
  scQuery,
  parseQueryResultInt,
  getRemoveAllowlistAddressTx,
  getTheCollectionIdAfterIssuing,
} from './utils';
import {
  issueNftMinterGasLimit,
  issueNftMinterValue,
  assignRolesNftMinterGasLimit,
  collectionTokenNameLabel,
  collectionTokenTickerLabel,
  nftTokenNameLabel,
  amountOfTokensLabel,
  mintTxBaseGasLimit,
  giveawayAddressLabel,
  giveawayTokensAmount,
  giveawayTxBaseGasLimit,
  dropTokensAmountLabel,
  setUnsetDropTxGasLimit,
  pauseUnpauseTxGasLimit,
  setNewPriceGasLimit,
  minterSellingPriceLabel,
  shuffleGasLimit,
  getTotalTokensLeftFunctionName,
  getProvenanceHashFunctionName,
  getDropTokensLeftFunctionName,
  getNftPriceFunctionName,
  getNftTokenIdFunctionName,
  getNftTokenNameFunctionName,
  getCollectionTokenNameFunctionName,
  getTokensLimitPerAddressTotalFunctionName,
  deployNftMinterImgCidLabel,
  deployNftMinterMetaCidLabel,
  changeBaseCidsGasLimit,
  deployNftMinterTokensLimitPerAddressLabel,
  setNewTokensLimitPerAddressGasLimit,
  claimScFundsTxGasLimit,
  dropTokensLimitPerAddressPerDropLabel,
  getTokensLimitPerAddressPerDropFunctionName,
  populateAllowlistBaseGasLimit,
  getAllowlistFunctionName,
  isAllowlistEnabledFunctionName,
  enableDisableAllowlistGasLimit,
  allowlistFileRelativePath,
  addressesListLabel,
  allowlistBatchSize,
  isDropActiveFunctionName,
  tokensPerOneTx,
  clearAllowlistBaseGasLimit,
  removeAllowlistAddressLabel,
  removeAllowlistAddressLimit,
  isMintingPausedFunctionName,
  getTotalSupplyFunctionName,
  getTotalSupplyOfCurrentDropFunctionName,
  giveawayFileRelativePath,
  tokensPerOneGiveawayTx,
  nftTokenNameNumberLabel,
} from './config';
import { exit } from 'process';

// Issue a collection token + add required roles
const issueCollectionToken = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();

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
    {
      type: 'select',
      name: 'noNftTokenNameNumber',
      message: nftTokenNameNumberLabel,
      choices: [
        { title: 'No', value: false },
        { title: 'Yes', value: true },
      ],
    },
    {
      type: 'text',
      name: 'nftTokenName',
      message: nftTokenNameLabel,
    },
  ];

  const spinner = ora('Processing the transaction...');

  try {
    const { tokenName, tokenTicker, nftTokenName, noNftTokenNameNumber } =
      await prompts(promptQuestions);

    await areYouSureAnswer();

    if (!tokenName || !tokenTicker) {
      console.log('You have to provide a token name and ticker value!');
      exit(9);
    }

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const issueCollectionTokenTx = getNftIssueTransaction(
      signer.getAddress(),
      smartContract,
      issueNftMinterGasLimit,
      issueNftMinterValue,
      tokenName,
      tokenTicker,
      noNftTokenNameNumber,
      nftTokenName
    );

    const transactionOnNetwork = await commonTxOperations(
      issueCollectionTokenTx,
      userAccount,
      signer,
      provider
    );

    console.log(
      `Issued collection token id: ${getTheCollectionIdAfterIssuing(
        transactionOnNetwork
      )}\n`
    );
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
  }
};

// For now only nft create role, it will be improvement after SC improvements
const setLocalRoles = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const assignRolesTx = getNftAssignRolesTransaction(
      signer.getAddress(),
      smartContract,
      assignRolesNftMinterGasLimit
    );

    await commonTxOperations(assignRolesTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const mint = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'number',
      name: 'tokensAmount',
      message: amountOfTokensLabel,
      validate: (value) =>
        value && value > 0 && value <= tokensPerOneTx
          ? true
          : `Requires a number greater than 0 and lower than ${tokensPerOneTx} because of the maximum gas limits!`,
    },
  ];

  try {
    const { tokensAmount } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { userAccount, signer, provider } = await publicEndpointSetup();

    const mintTx = getMintTransaction(
      signer.getAddress(),
      smartContractAddress,
      mintTxBaseGasLimit,
      Number(tokensAmount)
    );

    await commonTxOperations(mintTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const giveaway = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();

  const amountPrompt: PromptObject[] = [
    {
      type: 'number',
      name: 'giveawayTokensAmount',
      message: giveawayTokensAmount,
      validate: (value) =>
        value && value > 0 && value <= tokensPerOneGiveawayTx
          ? true
          : `Requires a number greater than 0 and lower than ${tokensPerOneGiveawayTx} because of the maximum gas limits!`,
    },
  ];

  const promptQuestions: PromptObject[] = [
    {
      type: 'list',
      name: 'giveawayAddressList',
      message: giveawayAddressLabel,
      validate: (value) =>
        value && value.length > 0 ? true : `Reguires at least one address!`,
    },
    ...amountPrompt,
  ];

  try {
    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const giveawayFile = getFileContents(giveawayFileRelativePath, {
      noExitOnError: true,
    });

    let addresses = [];
    let amount = 1;

    if (giveawayFile) {
      console.log(' ');
      console.log(`Populating addresses from the file: giveaway.json.`);
      console.log(' ');
      await areYouSureAnswer();
      const { giveawayTokensAmount } = await prompts(amountPrompt);
      addresses = giveawayFile;
      amount = giveawayTokensAmount;
    } else {
      console.log(' ');
      console.log('There is no giveaway.json file with the addresses.');
      console.log('You will be providing addresses by hand.');
      console.log(' ');
      await areYouSureAnswer();
      const { giveawayAddressList, giveawayTokensAmount } =
        await prompts(promptQuestions);
      addresses = giveawayAddressList;
      amount = giveawayTokensAmount;
    }

    if (amount * addresses.length > tokensPerOneGiveawayTx) {
      console.log(
        `Total number of tokens to mint is too big (addresses x amountPerAddress). The maximum is: ${tokensPerOneTx}`
      );
      exit(9);
    }

    const giveawayTx = getGiveawayTransaction(
      signer.getAddress(),
      smartContract,
      giveawayTxBaseGasLimit,
      addresses,
      Number(amount)
    );

    await commonTxOperations(giveawayTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
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
    {
      type: 'number',
      name: 'dropTokensLimitPerAddressPerDrop',
      message: dropTokensLimitPerAddressPerDropLabel,
    },
  ];

  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { dropTokensAmount, dropTokensLimitPerAddressPerDrop } =
      await prompts(promptQuestions);

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const setDropTx = getSetDropTransaction(
      signer.getAddress(),
      smartContract,
      setUnsetDropTxGasLimit,
      dropTokensAmount,
      dropTokensLimitPerAddressPerDrop
    );

    await commonTxOperations(setDropTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const unsetDrop = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const unsetDropTx = getUnsetDropTransaction(
      signer.getAddress(),
      smartContract,
      setUnsetDropTxGasLimit
    );

    await commonTxOperations(unsetDropTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const pauseMinting = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const pauseMintingTx = getPauseMintingTransaction(
      signer.getAddress(),
      smartContract,
      pauseUnpauseTxGasLimit
    );

    await commonTxOperations(pauseMintingTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const startMinting = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const startMintingTx = getUnpauseMintingTransaction(
      signer.getAddress(),
      smartContract,
      pauseUnpauseTxGasLimit
    );

    await commonTxOperations(startMintingTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const setNewPrice = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'newPrice',
      message: minterSellingPriceLabel,
      validate: (value) =>
        !Number(value) || Number(value) <= 0
          ? 'Requires a minimum of 0!'
          : true,
    },
  ];

  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { newPrice } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const changePriceTx = getSetNewPriceTransaction(
      signer.getAddress(),
      smartContract,
      setNewPriceGasLimit,
      newPrice
    );

    await commonTxOperations(changePriceTx, userAccount, signer, provider);

    updateOutputFile({ nftSellingPrice: newPrice });
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const claimDevRewards = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const claimDevRewardsTx = getClaimDevRewardsTransaction(
      smartContract,
      userAccount
    );

    await commonTxOperations(claimDevRewardsTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const shuffle = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { userAccount, signer, provider } = await publicEndpointSetup();

    const shuffleTx = getShuffleTransaction(
      signer.getAddress(),
      smartContractAddress,
      shuffleGasLimit
    );

    await commonTxOperations(shuffleTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const changeBaseCids = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'nftMinterImgCid',
      message: deployNftMinterImgCidLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'nftMinterMetaCid',
      message: deployNftMinterMetaCidLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { nftMinterImgCid, nftMinterMetaCid } =
      await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const changeBaseCidsTx = getChangeBaseCidsTransaction(
      signer.getAddress(),
      smartContract,
      changeBaseCidsGasLimit,
      nftMinterImgCid,
      nftMinterMetaCid
    );

    await commonTxOperations(changeBaseCidsTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const setNewTokensLimitPerAddress = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'number',
      name: 'nftMinterTokensLimitPerAddress',
      message: deployNftMinterTokensLimitPerAddressLabel,
      validate: (value) => (value && value >= 1 ? true : 'Minimum 1!'),
    },
  ];

  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { nftMinterTokensLimitPerAddress } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const setNewTokensLimitPerAddressTx =
      getSetNewTokensLimitPerAddressTransaction(
        signer.getAddress(),
        smartContract,
        setNewTokensLimitPerAddressGasLimit,
        nftMinterTokensLimitPerAddress
      );

    await commonTxOperations(
      setNewTokensLimitPerAddressTx,
      userAccount,
      signer,
      provider
    );
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const enableAllowlist = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const enableAllowlistTx = getEnableAllowlistTransaction(
      signer.getAddress(),
      smartContract,
      enableDisableAllowlistGasLimit
    );

    await commonTxOperations(enableAllowlistTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const disableAllowlist = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const disableAllowlistTx = getDisableAllowlistTransaction(
      signer.getAddress(),
      smartContract,
      enableDisableAllowlistGasLimit
    );

    await commonTxOperations(disableAllowlistTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getMintedPerAddressTotal = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'address',
      message: 'Provide the address:\n',
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { address } = await prompts(promptQuestions);
    getMintedPerAddressQuery(address);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getMintedPerAddressPerDrop = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'address',
      message: 'Provide the address:\n',
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { address } = await prompts(promptQuestions);
    getMintedPerAddressPerDropQuery(address);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const claimScFunds = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const claimScFundsTx = getClaimScFundsTransaction(
      signer.getAddress(),
      smartContract,
      claimScFundsTxGasLimit
    );

    await commonTxOperations(claimScFundsTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

// Calls the allowlist endpoint on the smart contract
// Can be called multiple times
const populateAllowlist = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'list',
      name: 'addressesList',
      message: addressesListLabel,
      validate: (value) =>
        value && value.length > 0 ? true : `Reguires at least one address!`,
    },
  ];

  try {
    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const allowlistFile = getFileContents(allowlistFileRelativePath, {
      noExitOnError: true,
    });

    let addresses = [];

    if (allowlistFile) {
      console.log(' ');
      console.log(
        `Populating addresses from the file: allowlist.json (maximum ${allowlistBatchSize} addresses per file/transaction).`
      );
      console.log(' ');
      await areYouSureAnswer();
      addresses = allowlistFile;
    } else {
      console.log(' ');
      console.log('There is no allowlist.json file with the addresses.');
      console.log('You will be providing addresses by hand.');
      console.log(' ');
      await areYouSureAnswer();
      const { addressesList } = await prompts(promptQuestions);
      addresses = addressesList;
    }

    if (Array.isArray(addresses) && addresses.length > allowlistBatchSize) {
      console.log(
        `The amount of addresses is more than ${allowlistBatchSize}. Please split it into batches with a maximum of ${allowlistBatchSize} addresses per transaction.`
      );
      exit(9);
    }

    const claimScFundsTx = getPopulateAllowlistTx(
      signer.getAddress(),
      smartContract,
      populateAllowlistBaseGasLimit,
      addresses
    );

    await commonTxOperations(claimScFundsTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const clearAllowlist = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();

  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const itemsInAllowlistResponse = await scQuery(
      getAllowlistFunctionName,
      smartContractAddress,
      provider
    );

    const clearAllowlistTx = getClearAllowlistTx(
      signer.getAddress(),
      smartContract,
      clearAllowlistBaseGasLimit,
      Number(parseQueryResultInt(itemsInAllowlistResponse))
    );

    await commonTxOperations(clearAllowlistTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const removeAllowlistAddress = async () => {
  const smartContractAddress = getNftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'address',
      message: removeAllowlistAddressLabel,
      validate: (value) => (value ? true : `Required!`),
    },
  ];

  try {
    const { address } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupNftSc(smartContractAddress);

    const removeAllowlistAddressTx = getRemoveAllowlistAddressTx(
      signer.getAddress(),
      smartContract,
      removeAllowlistAddressLimit,
      address
    );

    await commonTxOperations(
      removeAllowlistAddressTx,
      userAccount,
      signer,
      provider
    );
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getAllowlistAddressCheck = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'address',
      message:
        'Provide the address to check if it is included in the allowlist:\n',
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { address } = await prompts(promptQuestions);
    getAllowlistAddressCheckQuery(address);
  } catch (e) {
    console.log((e as Error)?.message);
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
    claimDevRewards: 'claim-dev-rewards',
    shuffle: 'shuffle',
    populateAllowlist: 'populate-allowlist',
    clearAllowlist: 'clear-allowlist',
    removeAllowlistAddress: 'remove-allowlist-address',
    enableAllowlist: 'enable-allowlist',
    disableAllowlist: 'disable-allowlist',
    changeBaseCids: 'change-base-cids',
    setNewTokensLimitPerAddress: 'set-new-tokens-limit-per-address',
    getTotalTokensLeft: 'get-total-tokens-left',
    getProvenanceHash: 'get-provenance-hash',
    getDropTokensLeft: 'get-drop-tokens-left',
    getNftPrice: 'get-nft-price',
    getNftTokenId: 'get-nft-token-id',
    getNftTokenName: 'get-nft-token-name',
    getCollectionTokenName: 'get-collection-token-name',
    getTokensLimitPerAddressTotal: 'get-tokens-limit-per-address-total',
    getMintedPerAddressTotal: 'get-minted-per-address-total',
    getMintedPerAddressPerDrop: 'get-minted-per-address-per-drop',
    getTokensLimitPerAddressPerDrop: 'get-tokens-limit-per-address-per-drop',
    getAllowlistSize: 'get-allowlist-size',
    isAllowlistEnabled: 'is-allowlist-enabled',
    getAllowlistAddressCheck: 'get-allowlist-address-check',
    isDropActive: 'is-drop-active',
    isMintingPaused: 'is-minting-paused',
    getTotalSupply: 'get-total-supply',
    getTotalSupplyOfCurrentDrop: 'get-total-supply-of-current-drop',
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
    case COMMANDS.mint:
      mint();
      break;
    case COMMANDS.giveaway:
      giveaway();
      break;
    case COMMANDS.setDrop:
      setDrop();
      break;
    case COMMANDS.unsetDrop:
      unsetDrop();
      break;
    case COMMANDS.pauseMinting:
      pauseMinting();
      break;
    case COMMANDS.startMinting:
      startMinting();
      break;
    case COMMANDS.setNewPrice:
      setNewPrice();
      break;
    case COMMANDS.claimDevRewards:
      claimDevRewards();
      break;
    case COMMANDS.shuffle:
      shuffle();
      break;
    case COMMANDS.populateAllowlist:
      populateAllowlist();
      break;
    case COMMANDS.clearAllowlist:
      clearAllowlist();
      break;
    case COMMANDS.removeAllowlistAddress:
      removeAllowlistAddress();
      break;
    case COMMANDS.enableAllowlist:
      enableAllowlist();
      break;
    case COMMANDS.disableAllowlist:
      disableAllowlist();
      break;
    case COMMANDS.changeBaseCids:
      changeBaseCids();
      break;
    case COMMANDS.setNewTokensLimitPerAddress:
      setNewTokensLimitPerAddress();
      break;
    case COMMANDS.claimScFunds:
      claimScFunds();
      break;
    case COMMANDS.getTotalTokensLeft:
      commonScQuery({
        functionName: getTotalTokensLeftFunctionName,
        resultLabel: 'Total tokens left:',
        resultType: 'number',
      });
      break;
    case COMMANDS.getProvenanceHash:
      commonScQuery({
        functionName: getProvenanceHashFunctionName,
        resultLabel: 'Provenance hash of the collection:',
        resultType: 'string',
      });
      break;
    case COMMANDS.getDropTokensLeft:
      commonScQuery({
        functionName: getDropTokensLeftFunctionName,
        resultLabel: 'Tokens left for the current drop:',
        resultType: 'number',
      });
      break;
    case COMMANDS.getNftPrice:
      commonScQuery({
        functionName: getNftPriceFunctionName,
        resultLabel: 'Current NFT price is:',
        resultType: 'number',
      });
      break;
    case COMMANDS.getNftTokenId:
      commonScQuery({
        functionName: getNftTokenIdFunctionName,
        resultLabel: 'NFT token id:',
        resultType: 'string',
      });
      break;
    case COMMANDS.getNftTokenName:
      commonScQuery({
        functionName: getNftTokenNameFunctionName,
        resultLabel: 'NFT token name:',
        resultType: 'string',
      });
      break;
    case COMMANDS.getCollectionTokenName:
      commonScQuery({
        functionName: getCollectionTokenNameFunctionName,
        resultLabel: 'Collection token name:',
        resultType: 'string',
      });
      break;
    case COMMANDS.getTokensLimitPerAddressTotal:
      commonScQuery({
        functionName: getTokensLimitPerAddressTotalFunctionName,
        resultLabel: 'Tokens limit per address:',
        resultType: 'number',
      });
      break;
    case COMMANDS.getMintedPerAddressPerDrop:
      getMintedPerAddressPerDrop();
      break;
    case COMMANDS.getTokensLimitPerAddressPerDrop:
      commonScQuery({
        functionName: getTokensLimitPerAddressPerDropFunctionName,
        resultLabel: 'Tokens limit per address per current drop:',
        resultType: 'number',
      });
      break;
    case COMMANDS.getMintedPerAddressTotal:
      getMintedPerAddressTotal();
      break;
    case COMMANDS.getAllowlistSize:
      commonScQuery({
        functionName: getAllowlistFunctionName,
        resultLabel: 'Total size of the Allowlist:',
        resultType: 'number',
      });
      break;
    case COMMANDS.isAllowlistEnabled:
      commonScQuery({
        functionName: isAllowlistEnabledFunctionName,
        resultLabel: 'Result:',
        resultModifier: (result) =>
          result === 'true'
            ? 'The allowlist is enabled!'
            : 'The allowlist is disabled!',
        resultType: 'boolean',
      });
      break;
    case COMMANDS.getAllowlistAddressCheck:
      getAllowlistAddressCheck();
      break;
    case COMMANDS.isDropActive:
      commonScQuery({
        functionName: isDropActiveFunctionName,
        resultLabel: 'Result:',
        resultModifier: (result) =>
          result === 'true' ? 'The drop is active!' : 'The drop is not active!',
        resultType: 'boolean',
      });
      break;
    case COMMANDS.isMintingPaused:
      commonScQuery({
        functionName: isMintingPausedFunctionName,
        resultLabel: 'Result:',
        resultModifier: (result) =>
          result === 'true'
            ? 'The minting is paused!'
            : 'The minting is not paused!',
        resultType: 'boolean',
      });
      break;
    case COMMANDS.getTotalSupply:
      commonScQuery({
        functionName: getTotalSupplyFunctionName,
        resultLabel: 'Total supply of the collection:',
        resultType: 'number',
      });
      break;
    case COMMANDS.getTotalSupplyOfCurrentDrop:
      commonScQuery({
        functionName: getTotalSupplyOfCurrentDropFunctionName,
        resultLabel: 'Total supply of current drop:',
        resultType: 'number',
      });
      break;
  }
};
