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
} from './config';
import {
  getDeployTransaction,
  updateOutputFile,
  getFileContents,
  baseDir,
} from './utils';

const deployNftMinter = async () => {
  // Check if there is an old output file
  const outputFile = getFileContents(outputFileName, { noExitOnError: true });

  if (outputFile) {
    unlinkSync(`${baseDir}/${outputFileName}`);
  }

  const promptsQuestions: PromptObject[] = [
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
      deployNftMinterProvenanceHash
    );

    deployTransaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(deployTransaction);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await deployTransaction.send(provider);
    await deployTransaction.awaitExecuted(provider);
    const txStatus = deployTransaction.getStatus();
    const txhash = deployTransaction.getHash();

    spinner.stop();

    console.log(`Deployment transaction executed: ${txStatus}`);
    console.log(`Transaction hash: ${txhash}`);
    const scAddress = smartContract.getAddress();
    console.log(`Smart Contract address: ${scAddress}`);
    updateOutputFile({
      scAddress,
      sellingPrice: deployNftMinterSellingPrice,
    });
  } catch (e) {
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
