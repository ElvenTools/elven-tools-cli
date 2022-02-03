import ora from 'ora';

import prompts, { PromptObject } from 'prompts';

import { exit } from 'process';

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
  dropTokensAmountLabel,
  setUnsetDropTxGasLimit,
  pauseUnpauseTxGasLimit,
  setNewPriceGasLimit,
  deployNftMinterSellingPriceLabel,
  shuffleGasLimit,
  getTotalTokensLeftFunctionName,
  getProvenanceHashFunctionName,
  getDropTokensLeftFunctionName,
  getNftPriceFunctionName,
  getNftTokenIdFunctionName,
  getNftTokenNameFunctionName,
  getTokensLimitPerAddressTotalFunctionName,
  chain,
  elrondExplorer,
  deployNftMinterImgCidLabel,
  deployNftMinterMetaCidLabel,
  changeBaseCidsGasLimit,
  deployNftMinterTokensLimitPerAddressLabel,
  setNewTokensLimitPerAddressGasLimit,
  claimScFundsTxGasLimit,
  dropTokensLimitPerAddressPerDropLabel,
  getTokensLimitPerAddressPerDropFunctionName,
  populateIndexesMaxBatchSize,
  populateIndexesLabel,
  populateIndexesBaseTxGasLimit,
  
} from './config';
import { setup } from './setup';
import {
  getIssueTransaction,
  updateOutputFile,
  getTheSCAddressFromOutputOrConfig,
  getAssignRolesTransaction,
  getMintTransaction,
  getGiveawayTransaction,
  getSetDropTransaction,
  getUnsetDropTransaction,
  getPauseMintingTransaction,
  getUnpauseMintingTransaction,
  getEnableMintByOwnerOnlyTransaction,
  getDisableMintByOwnerOnlyTransaction,
  commonTxOperations,
  getSetNewPriceTransaction,
  areYouSureAnswer,
  getClaimDevRewardsTransaction,
  getShuffleTransaction,
  commonScQuery,
  getChangeBaseCidsTransaction,
  getSetNewTokensLimitPerAddressTransaction,
  getClaimScFundsTransaction,
  getPopulateIndexesTx
} from './utils';

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

  const spinner = ora('Processing the transaction...');

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

    spinner.start();

    await issueCollectionTokenTx.send(provider);
    await issueCollectionTokenTx.awaitExecuted(provider);
    const txHash = issueCollectionTokenTx.getHash();

    const scResults = (await issueCollectionTokenTx.getAsOnNetwork(provider))
      .getSmartContractResults()
      .getResultingCalls()
      .filter((item) => item.callType === 2)?.[0]?.data;

    const tokenSection = scResults?.split('@')?.[2];
    const tokenId = tokenSection
      ? Buffer.from(tokenSection, 'hex').toString('utf8')
      : '';

    spinner.stop();

    console.log(`Transaction: ${elrondExplorer[chain]}/transactions/${txHash}`);
    if (tokenId) {
      console.log('Your collection token id: ', tokenId);
      console.log('Also saved in the output.json file.');
      updateOutputFile({ tokenId });
    } else {
      console.log(
        'Something went wrong on the Smart Contract. Check the explorer!'
      );
    }
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
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
    console.log((e as Error)?.message);
  }
};

const mint = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'number',
      name: 'tokensAmount',
      message: amountOfTokensLabel,
      validate: (value) =>
        value && value > 0 ? true : 'Required a number greater than 0!',
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
    console.log((e as Error)?.message);
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

  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { dropTokensAmount, dropTokensLimitPerAddressPerDrop } =
      await prompts(promptQuestions);

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const setDropTx = getSetDropTransaction(
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
    console.log((e as Error)?.message);
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
    console.log((e as Error)?.message);
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
    console.log((e as Error)?.message);
  }
};

const enableMintByOwnerOnly = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const enableMintByOwner = getEnableMintByOwnerOnlyTransaction(
      smartContract,
      pauseUnpauseTxGasLimit
    );

    await commonTxOperations(enableMintByOwner, userAccount, signer, provider);
  } catch (e) {
    console.log(e);
  }
};
const disableMintByOwnerOnly = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const disableMintByOwner = getDisableMintByOwnerOnlyTransaction(
      smartContract,
      pauseUnpauseTxGasLimit
    );

    await commonTxOperations(disableMintByOwner, userAccount, signer, provider);
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
    console.log((e as Error)?.message);
  }
};

const claimDevRewards = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
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

const shuffle = async () => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const shuffleTx = getShuffleTransaction(smartContract, shuffleGasLimit);

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

  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { nftMinterImgCid, nftMinterMetaCid } = await prompts(
      promptQuestions
    );

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const changeBaseCidsTx = getChangeBaseCidsTransaction(
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

  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { nftMinterTokensLimitPerAddress } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const setNewTokensLimitPerAddressTx =
      getSetNewTokensLimitPerAddressTransaction(
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
    console.log((e as Error)?.message);
  }
};

// The function is here as a fallback if something fails during the deployment
// Population of the VecMapper indexes will be triggered with the deploy function
// But if some of the transactions will fail, then there will be a possibility to use 'populate-indexes'
// Only for the owner. SC will throw an error if the endpoint is called too many times. It should always be in sync.
// The minting won't start without correctly populated indexes.
// Read more about it in the docs: https://www.elven.tools
const populateIndexes = async () => {
  const promptQuestions: PromptObject[] = [
    {
      type: 'number',
      name: 'nftMinterAmount',
      message: populateIndexesLabel,
      validate: (value) =>
        value > 1 && value <= populateIndexesMaxBatchSize
          ? true
          : `Required number between 1 and ${populateIndexesMaxBatchSize}`,
    },
  ];

  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  try {
    const { nftMinterAmount } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } = await setup(
      smartContractAddress
    );

    const populateIndexesTx = getPopulateIndexesTx(
      smartContract,
      Math.ceil(
        (populateIndexesBaseTxGasLimit * nftMinterAmount) / 43 +
          populateIndexesBaseTxGasLimit
      ),
      nftMinterAmount
    );

    await commonTxOperations(populateIndexesTx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

export const nftMinter = async (subcommand?: string) => {
  const COMMANDS = {
    issueCollectionToken: 'issue-collection-token',
    setLocalRoles: 'set-roles',
    populateIndexes: 'populate-indexes',
    mint: 'mint',
    giveaway: 'giveaway',
    claimScFunds: 'claim-sc-funds',
    setDrop: 'set-drop',
    unsetDrop: 'unset-drop',
    pauseMinting: 'pause-minting',
    startMinting: 'start-minting',
    enableMintByOwnerOnly: 'enable-mint-by-owner-only',
    disableMintByOwnerOnly: 'disable-mint-by-owner-only',
    setNewPrice: 'set-new-price',
    claimDevRewards: 'claim-dev-rewards',
    shuffle: 'shuffle',
    changeBaseCids: 'change-base-cids',
    setNewTokensLimitPerAddress: 'set-new-tokens-limit-per-address',
    getTotalTokensLeft: 'get-total-tokens-left',
    getProvenanceHash: 'get-provenance-hash',
    getDropTokensLeft: 'get-drop-tokens-left',
    getNftPrice: 'get-nft-price',
    getNftTokenId: 'get-nft-token-id',
    getNftTokenName: 'get-nft-token-name',
    getTokensLimitPerAddressTotal: 'get-tokens-limit-per-address-total',
    getMintedPerAddressTotal: 'get-minted-per-address-total',
    getMintedPerAddressPerDrop: 'get-minted-per-address-per-drop',
    getTokensLimitPerAddressPerDrop: 'get-tokens-limit-per-address-per-drop',
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
    case COMMANDS.populateIndexes:
      populateIndexes();
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
    case COMMANDS.enableMintByOwnerOnly:
      enableMintByOwnerOnly();
      break;
    case COMMANDS.disableMintByOwnerOnly:
      disableMintByOwnerOnly();
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
        resultLabel: 'Total tokens left',
        resultType: 'number',
      });
      break;
    case COMMANDS.getProvenanceHash:
      commonScQuery({
        functionName: getProvenanceHashFunctionName,
        resultLabel: 'Provenance hash of the collection',
        resultType: 'string',
      });
      break;
    case COMMANDS.getDropTokensLeft:
      commonScQuery({
        functionName: getDropTokensLeftFunctionName,
        resultLabel: 'Tokens left for the current drop',
        resultType: 'number',
      });
      break;
    case COMMANDS.getNftPrice:
      commonScQuery({
        functionName: getNftPriceFunctionName,
        resultLabel: 'Current NFT price is',
        resultType: 'number',
      });
      break;
    case COMMANDS.getNftTokenId:
      commonScQuery({
        functionName: getNftTokenIdFunctionName,
        resultLabel: 'NFT token id',
        resultType: 'string',
      });
      break;
    case COMMANDS.getNftTokenName:
      commonScQuery({
        functionName: getNftTokenNameFunctionName,
        resultLabel: 'NFT token name',
        resultType: 'string',
      });
      break;
    case COMMANDS.getTokensLimitPerAddressTotal:
      commonScQuery({
        functionName: getTokensLimitPerAddressTotalFunctionName,
        resultLabel: 'Tokens limit per address',
        resultType: 'number',
      });
      break;
    case COMMANDS.getTokensLimitPerAddressPerDrop:
      commonScQuery({
        functionName: getTokensLimitPerAddressPerDropFunctionName,
        resultLabel: 'Tokens limit per address per current drop',
        resultType: 'number',
      });
      break;
  }
};
