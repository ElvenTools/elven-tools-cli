import { setup } from './setup';
import ora from 'ora';
import prompts, { PromptObject } from 'prompts';
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
  commonTxOperations,
  getSetNewPriceTransaction,
  areYouSureAnswer,
  getClaimDevRewardsTransaction,
  getShuffleTransaction,
  commonScQuery,
  getTokensMintedPerAddressQuery,
  getChangeBaseCidsTransaction,
  getSetNewTokensLimitPerAddressTransaction,
  getClaimScFundsTransaction,
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
  getTokensLimitPerAddressFunctionName,
  chain,
  elrondExplorer,
  deployNftMinterImgCidLabel,
  deployNftMinterMetaCidLabel,
  changeBaseCidsGasLimit,
  deployNftMinterTokensLimitPerAddressLabel,
  setNewTokensLimitPerAddressGasLimit,
  claimScFundsTxGasLimit,
} from './config';
import { exit } from 'process';

// TODO: better UX overall, catch statuses from smart contract results

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
    await issueCollectionTokenTx.awaitExecuted(provider);
    const txHash = issueCollectionTokenTx.getHash();

    const scResults = (await issueCollectionTokenTx.getAsOnNetwork(provider))
      .getSmartContractResults()
      .getResultingCalls()
      .filter((item) => item.callType === 2)?.[0]?.data;

    const tokenSection = scResults.split('@')?.[2];
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
    console.log(e);
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
    console.log(e);
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
    console.log(e);
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
    console.log(e);
  }
};

const getTokensMintedPerAddress = async () => {
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
    getTokensMintedPerAddressQuery(address);
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
    changeBaseCids: 'change-base-cids',
    setNewTokensLimitPerAddress: 'set-new-tokens-limit-per-address',
    getTotalTokensLeft: 'get-total-tokens-left',
    getProvenanceHash: 'get-provenance-hash',
    getDropTokensLeft: 'get-drop-tokens-left',
    getNftPrice: 'get-nft-price',
    getNftTokenId: 'get-nft-token-id',
    getNftTokenName: 'get-nft-token-name',
    getTokensLimitPerAddress: 'get-tokens-limit-per-address',
    getTokensMintedPerAddress: 'get-tokens-minted-per-address',
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
    case COMMANDS.getTokensLimitPerAddress:
      commonScQuery({
        functionName: getTokensLimitPerAddressFunctionName,
        resultLabel: 'Tokens limit per address',
        resultType: 'number',
      });
      break;
    case COMMANDS.getTokensMintedPerAddress:
      getTokensMintedPerAddress();
      break;
  }
};
