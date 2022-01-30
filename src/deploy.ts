import { exit } from 'process';
import { unlinkSync } from 'fs';
import ora from 'ora';
import prompts, { PromptObject } from 'prompts';
import { setup } from './setup';
import {
  deployNftMinterGasLimit,
  outputFileName,
  deployNftMinterImgCidLabel,
  deployNftMinterMetaCidLabel,
  deployNftMinterAmountOfTokensLabel,
  deployNftMinterSellingPriceLabel,
  deployNftMinterRoyaltiesLabel,
  deployNftMinterTagsLabel,
  deployNftMinterProvenanceHashLabel,
  deployNftMinterTokensLimitPerAddressLabel,
  deployNftMinterImgExtLabel,
  elrondExplorer,
  chain,
  nftSCupgradableLabel,
  nftSCreadableLabel,
  nftSCpayableLabel,
  populateIndexesBaseTxGasLimit,
  populateIndexesMaxBatchSize,
} from './config';
import {
  getDeployTransaction,
  updateOutputFile,
  getFileContents,
  baseDir,
  getPopulateIndexesTx,
} from './utils';

const deployNftMinter = async () => {
  // Check if there is an old output file
  const outputFile = getFileContents(outputFileName, { noExitOnError: true });

  if (outputFile) {
    unlinkSync(`${baseDir}/${outputFileName}`);
  }

  const promptsQuestions: PromptObject[] = [
    {
      type: 'select',
      name: 'nftSCupgradable',
      message: nftSCupgradableLabel,
      choices: [
        { title: 'Yes', value: true },
        { title: 'No', value: false },
      ],
    },
    {
      type: 'select',
      name: 'nftSCreadable',
      message: nftSCreadableLabel,
      choices: [
        { title: 'No', value: false },
        { title: 'Yes', value: true },
      ],
    },
    {
      type: 'select',
      name: 'nftSCpayable',
      message: nftSCpayableLabel,
      choices: [
        { title: 'Yes', value: true },
        { title: 'No', value: false },
      ],
    },
    {
      type: 'text',
      name: 'deployNftMinterImgCid',
      message: deployNftMinterImgCidLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'text',
      name: 'deployNftMinterMetaCid',
      message: deployNftMinterMetaCidLabel,
      validate: (value) => (!value ? 'Required!' : true),
    },
    {
      type: 'select',
      name: 'deployNftMinterImgExt',
      message: deployNftMinterImgExtLabel,
      choices: [
        { title: '.png', value: '.png' },
        { title: '.jpg', value: '.jpg' },
        { title: '.gif', value: '.gif' },
        { title: '.mp3', value: '.mp3' },
        { title: '.mp4', value: '.mp4' },
      ],
    },
    {
      type: 'number',
      name: 'deployNftMinterAmountOfTokens',
      message: deployNftMinterAmountOfTokensLabel,
      min: 1,
      validate: (value) => (!value || value < 1 ? 'Required and min 1!' : true),
    },
    {
      type: 'text',
      name: 'deployNftMinterSellingPrice',
      message: deployNftMinterSellingPriceLabel,
      validate: (value) =>
        !Number(value) || Number(value) <= 0 ? 'Required and min 0!' : true,
    },
    {
      type: 'number',
      name: 'deployNftMinterTokensLimitPerAddress',
      message: deployNftMinterTokensLimitPerAddressLabel,
      validate: (value) => (value && value >= 1 ? true : 'Minimum 1!'),
    },
    {
      type: 'number',
      name: 'deployNftMinterRoyalties',
      message: deployNftMinterRoyaltiesLabel,
      min: 0,
      max: 100,
      validate: (value) =>
        (value >= 0 && value <= 100) || !value
          ? true
          : 'Should be a number in range 0-100',
    },
    {
      type: 'text',
      name: 'deployNftMinterTags',
      message: deployNftMinterTagsLabel,
    },
    {
      type: 'text',
      name: 'deployNftMinterProvenanceHash',
      message: deployNftMinterProvenanceHashLabel,
    },
  ];

  const spinner = ora('Processing transaction...');

  try {
    const { scWasmCode, smartContract, userAccount, signer, provider } =
      await setup();

    const {
      deployNftMinterImgCid,
      deployNftMinterImgExt,
      deployNftMinterMetaCid,
      deployNftMinterAmountOfTokens,
      deployNftMinterTokensLimitPerAddress,
      deployNftMinterSellingPrice,
      deployNftMinterRoyalties,
      deployNftMinterTags,
      deployNftMinterProvenanceHash,
      nftSCupgradable,
      nftSCreadable,
      nftSCpayable,
    } = await prompts(promptsQuestions);

    if (
      !deployNftMinterImgCid ||
      !deployNftMinterMetaCid ||
      !deployNftMinterAmountOfTokens ||
      !deployNftMinterSellingPrice
    ) {
      console.log(
        'You have to provide CIDs, amount of tokens and selling price!'
      );
      exit(9);
    }

    const deployTransaction = getDeployTransaction(
      scWasmCode,
      smartContract,
      deployNftMinterGasLimit,
      deployNftMinterImgCid,
      deployNftMinterImgExt,
      deployNftMinterMetaCid,
      deployNftMinterAmountOfTokens,
      deployNftMinterTokensLimitPerAddress,
      deployNftMinterSellingPrice,
      deployNftMinterRoyalties,
      deployNftMinterTags,
      deployNftMinterProvenanceHash,
      nftSCupgradable,
      nftSCreadable,
      nftSCpayable
    );

    deployTransaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(deployTransaction);

    spinner.start();

    await deployTransaction.send(provider);
    await deployTransaction.awaitExecuted(provider);
    const txStatus = deployTransaction.getStatus();
    const txHash = deployTransaction.getHash();

    // This is done to populate VecMapper of token indexes,
    // with big amounts it had to be split into more transactions
    const populateTxOperations = async (numberOfbatches: number, i: number) => {
      const amountOfTokens =
        numberOfbatches === i
          ? deployNftMinterAmountOfTokens -
            (numberOfbatches - 1) * populateIndexesMaxBatchSize
          : populateIndexesMaxBatchSize;

      const populateIndexesTx = getPopulateIndexesTx(
        smartContract,
        populateIndexesBaseTxGasLimit * amountOfTokens,
        amountOfTokens
      );

      populateIndexesTx.setNonce(userAccount.nonce);
      userAccount.incrementNonce();
      signer.sign(populateIndexesTx);
      await populateIndexesTx.send(provider);
      await populateIndexesTx.awaitExecuted(provider);
    };

    if (deployNftMinterAmountOfTokens > populateIndexesMaxBatchSize) {
      const numberOfbatches = Math.ceil(
        deployNftMinterAmountOfTokens / populateIndexesMaxBatchSize
      );
      for (let i = 1; i <= numberOfbatches; i++) {
        await populateTxOperations(numberOfbatches, i);
      }
    } else {
      await populateTxOperations(1, 1);
    }

    spinner.stop();

    console.log(`Deployment transaction executed: ${txStatus}`);
    console.log(`Transaction: ${elrondExplorer[chain]}/transactions/${txHash}`);
    const scAddress = smartContract.getAddress();
    console.log(`Smart Contract address: ${scAddress}`);
    updateOutputFile({
      scAddress,
      sellingPrice: deployNftMinterSellingPrice,
    });
  } catch (e) {
    spinner.stop();
    console.log(e);
  }
};

export const deploy = async (subcommand?: string) => {
  const COMMANDS = {
    nftMinter: 'nft-minter',
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
      `===========================================================\nPlaese provide a proper deploy command. Available commands:\n===========================================================\n${Object.values(
        COMMANDS
      ).join('\n')}`
    );
    exit(9);
  }

  if (subcommand === COMMANDS.nftMinter) {
    deployNftMinter();
  }
};
