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

    const assignRolesTx = getSftCreateTransaction(
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

    await commonTxOperations(assignRolesTx, userAccount, signer, provider);

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

    const claimDevRewardsTx = getClaimDevRewardsTransaction(
      smartContract,
      userAccount
    );

    await commonTxOperations(claimDevRewardsTx, userAccount, signer, provider);
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

    const claimScFundsTx = getClaimScFundsTransaction(
      smartContract,
      claimScFundsTxGasLimit
    );

    await commonTxOperations(claimScFundsTx, userAccount, signer, provider);
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

    const assignRolesTx = getBuySftTransaction(
      smartContract,
      buySftMinterGasLimit,
      tokenNonce,
      amountToBuy
    );

    await commonTxOperations(assignRolesTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getTokenDisplayName = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'nonce',
      message:
        'Provide the nonce (for example in TTSFT-d1d695-01 the 01 has to be provided):\n',
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { nonce } = await prompts(promptQuestions);
    getSftTokenDisplayNameQuery(nonce);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getPrice = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'nonce',
      message:
        'Provide the nonce (for example in TTSFT-d1d695-01 the 01 has to be provided):\n',
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { nonce } = await prompts(promptQuestions);
    getSftPriceQuery(nonce);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const getMaxAmountPerAddress = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'nonce',
      message:
        'Provide the nonce (for example in TTSFT-d1d695-01 the 01 has to be provided):\n',
      validate: (value) => (!value ? 'Required!' : true),
    },
  ];

  try {
    const { nonce } = await prompts(promptQuestions);
    getSftMaxAmountPerAddress(nonce);
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
    getCollectionTokenName: 'get-collection-token-name',
    getCollectionTokenId: 'get-collection-token-id',
    getTokenDisplayName: 'get-token-display-name',
    getPrice: 'get-price',
    getMaxAmountPerAddress: 'get-max-amount-per-address',
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
  }
};
