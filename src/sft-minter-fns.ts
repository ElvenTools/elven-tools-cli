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
  getSftMintTransaction,
  getSftBurnTransaction,
  getFileContents,
  getSftGiveawayTransaction,
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
  newAmountOfTokensLabel,
  sftMintGasLimit,
  sftBurnGasLimit,
  amountOfTokensToBurnLabel,
  sftCollectionProperties,
  sftSpecialRoles,
  giveawayFileRelativePath,
  sftGiveawayReceiversLabel,
  sftGiveawayTxBaseGasLimit,
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
    {
      type: 'multiselect',
      name: 'tokenProperties',
      message: 'Please choose token properties.\n',
      choices: [
        {
          title: 'CanAddSpecialRoles',
          value: 'CanAddSpecialRoles',
          description: 'It is mandatory to proceed',
          selected: true,
        },
        ...sftCollectionProperties.variants
          .map((property) => ({
            title: property.name,
            value: property.name,
          }))
          .filter((property) => property.value !== 'CanAddSpecialRoles'),
      ],
    },
  ];

  const spinner = ora('Processing the transaction...');

  try {
    const { tokenName, tokenTicker, tokenProperties } =
      await prompts(promptQuestions);

    await areYouSureAnswer();

    if (!tokenName || !tokenTicker) {
      console.log('You have to provide a token name and ticker value!');
      exit(9);
    }

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

    const tx = getSftIssueTransaction(
      signer.getAddress(),
      smartContract,
      issueSftMinterGasLimit,
      issueSftMinterValue,
      tokenName,
      tokenTicker,
      tokenProperties
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

const setLocalRoles = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'multiselect',
      name: 'roles',
      message: 'Please choose special roles.\n',
      choices: [
        {
          title: 'ESDTRoleNFTCreate',
          value: 'ESDTRoleNFTCreate',
          description: 'It is mandatory to proceed',
          selected: true,
        },
        {
          title: 'ESDTRoleNFTAddQuantity',
          value: 'ESDTRoleNFTAddQuantity',
          description: 'It is mandatory to proceed',
          selected: true,
        },
        ...sftSpecialRoles.variants
          .map((role) => ({
            title: role.name,
            value: role.name,
          }))
          .filter(
            (role) =>
              role.value !== 'ESDTRoleNFTCreate' &&
              role.value !== 'ESDTRoleNFTAddQuantity'
          ),
      ],
    },
  ];

  try {
    const { roles } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

    const tx = getSftAssignRolesTransaction(
      signer.getAddress(),
      smartContract,
      assignRolesSftMinterGasLimit,
      roles
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

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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
    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

    const tx = getClaimDevRewardsTransaction(smartContract, userAccount);

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const claimScFunds = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();
  try {
    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

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

const mint = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    ...nonceOnlyPromptQuestion,
    {
      type: 'number',
      name: 'newAmountOfTokens',
      message: newAmountOfTokensLabel,
      min: 1,
      validate: (value) => (!value || value < 1 ? 'Required and min 1!' : true),
    },
  ];

  try {
    const { nonce, newAmountOfTokens } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

    const tx = getSftMintTransaction(
      signer.getAddress(),
      smartContract,
      sftMintGasLimit,
      nonce,
      newAmountOfTokens
    );

    await commonTxOperations(tx, userAccount, signer, provider);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};

const burn = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    ...nonceOnlyPromptQuestion,
    {
      type: 'number',
      name: 'amountOfTokensToBurn',
      message: amountOfTokensToBurnLabel,
      min: 1,
      validate: (value) => (!value || value < 1 ? 'Required and min 1!' : true),
    },
  ];

  try {
    const { nonce, amountOfTokensToBurn } = await prompts(promptQuestions);

    await areYouSureAnswer();

    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

    const tx = getSftBurnTransaction(
      signer.getAddress(),
      smartContract,
      sftBurnGasLimit,
      nonce,
      amountOfTokensToBurn
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

const giveaway = async () => {
  const smartContractAddress = getSftSCAddressFromOutputOrConfig();

  const promptQuestions: PromptObject[] = [
    {
      type: 'list',
      name: 'giveawayReceiversList',
      message: sftGiveawayReceiversLabel,
      validate: (value) =>
        value && value.length > 0 ? true : `Reguires at least one receiver!`,
    },
  ];

  try {
    const { smartContract, userAccount, signer, provider } =
      await setupSftSc(smartContractAddress);

    const giveawayFile = getFileContents(giveawayFileRelativePath, {
      noExitOnError: true,
    });

    let receivers = [];

    if (giveawayFile) {
      console.log(' ');
      console.log(`Populating receivers from the file: giveaway.json.`);
      console.log(' ');
      await areYouSureAnswer();
      receivers = giveawayFile;
    } else {
      console.log(' ');
      console.log('There is no giveaway.json file with receivers.');
      console.log('You will be providing receivers by hand...');
      console.log(' ');
      await areYouSureAnswer();
      const { giveawayReceiversList } = await prompts(promptQuestions);
      const standarized = giveawayReceiversList.map((receiver: string) => {
        const split = receiver.split('|');
        return {
          address: split[0],
          nonce: split[1],
          amount: split[2],
        };
      });
      receivers = standarized;
    }

    const giveawayTx = getSftGiveawayTransaction(
      signer.getAddress(),
      smartContract,
      sftGiveawayTxBaseGasLimit,
      receivers
    );

    await commonTxOperations(giveawayTx, userAccount, signer, provider);
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
    mint: 'mint',
    burn: 'burn',
    giveaway: 'giveaway',
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
    case COMMANDS.mint:
      mint();
      break;
    case COMMANDS.burn:
      burn();
      break;
    case COMMANDS.giveaway:
      giveaway();
      break;
  }
};
