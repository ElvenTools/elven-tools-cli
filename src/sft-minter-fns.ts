import { exit } from 'process';
import ora from 'ora';
import { setupSftSc } from './setup';
import {
  getSftSCAddressFromOutputOrConfig,
  getSftIssueTransaction,
  commonTxOperations,
  areYouSureAnswer,
  getSftAssignRolesTransaction,
  getSftCreateTransaction,
  updateOutputFile,
  getBuySftTransaction,
  getClaimDevRewardsTransaction,
  getClaimScFundsTransaction,
  getSftTokenDisplayNameQuery,
  getSftPriceQuery,
  getSftMaxAmountPerAddress,
  commonScQuery,
  getTheCollectionIdAfterIssuing,
  getSftSetNewPriceTransaction,
  getIsPausedState,
  getSftStartSellingTransaction,
  getSftPauseSellingTransaction,
  getAmountPerAddressTotalQuery,
  getSftSetNewAmountLimitPerAddressTransaction,
} from './utils';
import prompts, { PromptObject } from 'prompts';
import {
  collectionTokenNameLabel,
  collectionTokenTickerLabel,
  issueSftMinterValue,
  issueSftMinterGasLimit,
  assignRolesSftMinterGasLimit,
  minterSellingPriceLabel,
  metadataIpfsCIDLabel,
  metadataIpfsFileNameLabel,
  initialSFTSupplyLabel,
  minterRoyaltiesLabel,
  minterTagsLabel,
  listOfSftUrisLabel,
  createSftMinterGasLimit,
  sftTokenDisplayName,
  maxTokensPerAddress,
  sftTokenNonceLabel,
  amountToBuyLabel,
  buySftMinterGasLimit,
  claimScFundsTxGasLimit,
  getSftCollectionTokenNameFunctionName,
  getSftCollectionTokenIdFunctionName,
  sftSetNewPriceGasLimit,
  sftStartSellingGasLimit,
  sftPauseSellingGasLimit,
  provideAnAddressLabel,
  newLimitPerAddressLabel,
  sftNewAmountLimitPerAddressGasLimit,
} from './config';

const nonceOnlyPromptQuestion: PromptObject[] = [
  {
    type: 'text',
    name: 'nonce',
    message:
      'Provide the nonce (for example in TTSFT-d1d695-01 the 01 has to be provided):\n',
    validate: (value) => (!value ? 'Required!' : true),
  },
];

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

    const tx = getSftIssueTransaction(
      signer.getAddress(),
      smartContract,
      issueSftMinterGasLimit,
      issueSftMinterValue,
      tokenName,
      tokenTicker
    );

    const transactionOnNetwork = await commonTxOperations(
      tx,
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
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getSftAssignRolesTransaction(
      signer.getAddress(),
      smartContract,
      assignRolesSftMinterGasLimit
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const create = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'tokenDisaplayName',
      message: sftTokenDisplayName,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'tokenSellingPrice',
      message: minterSellingPriceLabel,
      validate: (value) =>
        !Number(value) || Number(value) <= 0 ? 'Required and min 0!' : true,
    },
    {
      type: 'text',
      name: 'metadataIpfsCID',
      message: metadataIpfsCIDLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'metadataIpfsFileName',
      message: metadataIpfsFileNameLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'number',
      name: 'initialAmountOfTokens',
      message: initialSFTSupplyLabel,
      min: 1,
      validate: (value) => (!value || value < 1 ? 'Required and min 1!' : true),
    },
    {
      type: 'number',
      name: 'maxTokensPerAddress',
      message: maxTokensPerAddress,
      min: 1,
      validate: (value) => (!value || value < 1 ? 'Required and min 1!' : true),
    },
    {
      type: 'number',
      name: 'royalties',
      message: minterRoyaltiesLabel,
      min: 0,
      max: 100,
      float: true,
      round: 2,
      validate: (value) =>
        (value >= 0 && value <= 100) || !value
          ? true
          : 'Should be a number in range 0-100',
    },
    {
      type: 'text',
      name: 'tags',
      message: minterTagsLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'list',
      name: 'uris',
      message: listOfSftUrisLabel,
      validate: (value) =>
        value && value.length > 0 ? true : `Requires at least one address!`,
    },
  ];

  try {
    const {
      tokenDisaplayName,
      tokenSellingPrice,
      metadataIpfsCID,
      metadataIpfsFileName,
      initialAmountOfTokens,
      royalties,
      tags,
      uris,
      maxTokensPerAddress,
    } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getSftCreateTransaction(
      signer.getAddress(),
      smartContract,
      createSftMinterGasLimit,
      tokenDisaplayName,
      tokenSellingPrice,
      metadataIpfsCID,
      metadataIpfsFileName,
      initialAmountOfTokens,
      maxTokensPerAddress,
      royalties,
      tags,
      uris
    );

    await commonTxOperations(tx, userAccount, signer, provider);

    updateOutputFile({ sftSellingPrice: tokenSellingPrice });
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const claimDevRewards = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getClaimDevRewardsTransaction(smartContract, userAccount);

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const claimScFunds = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getClaimScFundsTransaction(
      signer.getAddress(),
      smartContract,
      claimScFundsTxGasLimit
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

export const buy = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'tokenNonce',
      message: sftTokenNonceLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'number',
      name: 'amountToBuy',
      message: amountToBuyLabel,
      min: 1,
      validate: (value) => (!value || value < 1 ? 'Required and min 1!' : true),
    },
  ];

  try {
    const { tokenNonce, amountToBuy } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getBuySftTransaction(
      signer.getAddress(),
      smartContract,
      buySftMinterGasLimit,
      tokenNonce,
      amountToBuy
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

export const setNewPrice = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'tokenNonce',
      message: sftTokenNonceLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'newPrice',
      message: minterSellingPriceLabel,
      validate: (value) =>
        !Number(value) || Number(value) <= 0 ? 'Required and min 0!' : true,
    },
  ];

  try {
    const { tokenNonce, newPrice } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getSftSetNewPriceTransaction(
      signer.getAddress(),
      smartContract,
      sftSetNewPriceGasLimit,
      tokenNonce,
      newPrice
    );

    await commonTxOperations(tx, userAccount, signer, provider);

    updateOutputFile({ sftSellingPrice: newPrice });
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const startSelling = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  try {
    const { nonce } = await prompts(nonceOnlyPromptQuestion);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getSftStartSellingTransaction(
      signer.getAddress(),
      smartContract,
      sftStartSellingGasLimit,
      nonce
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const pauseSelling = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  try {
    const { nonce } = await prompts(nonceOnlyPromptQuestion);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getSftPauseSellingTransaction(
      signer.getAddress(),
      smartContract,
      sftPauseSellingGasLimit,
      nonce
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const setNewAmountLimitPerAddress = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  try {
    const promptQuestions: PromptObject[] = [
      ...nonceOnlyPromptQuestion,
      {
        type: 'text',
        name: 'limit',
        message: newLimitPerAddressLabel,
        validate: (value) =>
          !Number(value) || Number(value) <= 0 ? 'Required and min 0!' : true,
      },
    ];

    const { nonce, limit } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setupSftSc(
      smartContractAddress
    );

    const tx = getSftSetNewAmountLimitPerAddressTransaction(
      signer.getAddress(),
      smartContract,
      sftNewAmountLimitPerAddressGasLimit,
      nonce,
      limit
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getTokenDisplayName = async () => {
  try {
    const { nonce } = await prompts(nonceOnlyPromptQuestion);
    getSftTokenDisplayNameQuery(nonce);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getPrice = async () => {
  try {
    const { nonce } = await prompts(nonceOnlyPromptQuestion);
    getSftPriceQuery(nonce);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getMaxAmountPerAddress = async () => {
  try {
    const { nonce } = await prompts(nonceOnlyPromptQuestion);
    getSftMaxAmountPerAddress(nonce);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const isPaused = async () => {
  try {
    const { nonce } = await prompts(nonceOnlyPromptQuestion);
    getIsPausedState(nonce);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getAmountPerAddressTotal = async () => {
  try {
    const promptQuestions: PromptObject[] = [
      ...nonceOnlyPromptQuestion,
      {
        type: 'text',
        name: 'address',
        message: provideAnAddressLabel,
        validate: (value) => (!value ? 'Required!' : true),
      },
    ];

    const { nonce, address } = await prompts(promptQuestions);
    getAmountPerAddressTotalQuery(nonce, address);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

export const sftMinter = async (subcommand?: string) => {
  const COMMANDS = {
    issueCollectionToken: 'issue-collection-token',
    setLocalRoles: 'set-roles',
    create: 'create',
    clainDevRewards: 'claim-dev-rewards',
    claimScFunds: 'claim-sc-funds',
    buy: 'buy',
    setNewPrice: 'set-new-price',
    startSelling: 'start-selling',
    pauseSelling: 'pause-selling',
    setNewAmountLimitPerAddress: 'set-new-amount-limit-per-address',
    getCollectionTokenName: 'get-collection-token-name',
    getCollectionTokenId: 'get-collection-token-id',
    getTokenDisplayName: 'get-token-display-name',
    getPrice: 'get-price',
    getMaxAmountPerAddress: 'get-max-amount-per-address',
    isPaused: 'is-paused',
    getAmountPerAddressTotal: 'get-amount-per-address-total',
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
    case COMMANDS.create:
      create();
      break;
    case COMMANDS.clainDevRewards:
      claimDevRewards();
      break;
    case COMMANDS.claimScFunds:
      claimScFunds();
      break;
    case COMMANDS.buy:
      buy();
      break;
    case COMMANDS.setNewPrice:
      setNewPrice();
      break;
    case COMMANDS.startSelling:
      startSelling();
      break;
    case COMMANDS.pauseSelling:
      pauseSelling();
      break;
    case COMMANDS.setNewAmountLimitPerAddress:
      setNewAmountLimitPerAddress();
      break;
    case COMMANDS.getCollectionTokenName:
      commonScQuery({
        functionName: getSftCollectionTokenNameFunctionName,
        resultLabel: 'Collection token name:',
        resultType: 'string',
        isNft: false,
      });
      break;
    case COMMANDS.getCollectionTokenId:
      commonScQuery({
        functionName: getSftCollectionTokenIdFunctionName,
        resultLabel: 'Collection token id:',
        resultType: 'string',
        isNft: false,
      });
      break;
    case COMMANDS.getTokenDisplayName:
      getTokenDisplayName();
      break;
    case COMMANDS.getPrice:
      getPrice();
      break;
    case COMMANDS.getMaxAmountPerAddress:
      getMaxAmountPerAddress();
      break;
    case COMMANDS.getAmountPerAddressTotal:
      getAmountPerAddressTotal();
      break;
    case COMMANDS.isPaused:
      isPaused();
      break;
  }
};
