import { exit } from 'process';
import fs from 'fs';
import ora from 'ora';
import prompts, { PromptObject } from 'prompts';
import { setupNftSc, setupSftSc } from './setup';
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
  deploySftMinterGasLimit,
  multiversxExplorer,
  chain,
  nftSCupgradableLabel,
  nftSCreadableLabel,
  nftSCpayableLabel,
  nftSCpayableByScLabel,
  deployMetadataInAssetsLabel,
} from './config';
import {
  getDeployNftTransaction,
  getDeploySftTransaction,
  updateOutputFile,
  getFileContents,
  baseDir,
  areYouSureAnswer,
} from './utils';
import { TransactionWatcher, SmartContract } from '@multiversx/sdk-core';

const deployNftMinter = async () => {
  // Check if there is an old output file
  const outputFile = getFileContents(outputFileName, { noExitOnError: true });

  if (outputFile) {
    outputFile.nftMinterScAddress = '';
    outputFile.nftMinterScCollectionSellingPrice = '';
    outputFile.nftMinterCollectionToken = '';
    fs.writeFileSync(
      `${baseDir}/${outputFileName}`,
      JSON.stringify(outputFile),
      'utf8'
    );
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
        { title: 'No', value: false },
        { title: 'Yes', value: true },
      ],
    },
    {
      type: 'select',
      name: 'nftSCpayableBySc',
      message: nftSCpayableByScLabel,
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
      name: 'metadataInAssets',
      message: deployMetadataInAssetsLabel,
      choices: [
        { title: 'No', value: false },
        { title: 'Yes', value: true },
      ],
    },
    {
      type: 'select',
      name: 'deployNftMinterImgExt',
      message: deployNftMinterImgExtLabel,
      choices: [
        { title: '.png', value: '.png' },
        { title: '.jpg', value: '.jpg' },
        { title: '.jpeg', value: '.jpeg' },
        { title: '.gif', value: '.gif' },
        { title: '.mp3', value: '.mp3' },
        { title: '.mp4', value: '.mp4' },
        { title: '.acc', value: '.acc' },
        { title: '.flac', value: '.flac' },
        { title: '.m4a', value: '.m4a' },
        { title: '.wav', value: '.wav' },
        { title: '.mov', value: '.mov' },
        { title: '.quicktime', value: '.quicktime' },
        { title: '.webm', value: '.webm' },
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
      validate: (value) => (value && value >= 1 ? true : 'Min 1!'),
    },
    {
      type: 'number',
      name: 'deployNftMinterRoyalties',
      message: deployNftMinterRoyaltiesLabel,
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
      name: 'deployNftMinterTags',
      message: deployNftMinterTagsLabel,
    },
    {
      type: 'text',
      name: 'deployNftMinterProvenanceHash',
      message: deployNftMinterProvenanceHashLabel,
    },
  ];

  const spinner = ora('Processing the transaction...');

  try {
    const { scWasmCode, smartContract, userAccount, signer, provider } =
      await setupNftSc();

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
      nftSCpayableBySc,
      metadataInAssets,
    } = await prompts(promptsQuestions);

    await areYouSureAnswer();

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

    const deployTransaction = getDeployNftTransaction(
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
      nftSCpayable,
      nftSCpayableBySc,
      metadataInAssets
    );

    deployTransaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(deployTransaction);

    spinner.start();

    const smartContractAddress = SmartContract.computeAddress(
      deployTransaction.getSender(),
      deployTransaction.getNonce()
    );

    smartContract.setAddress(smartContractAddress);

    await provider.sendTransaction(deployTransaction);

    const watcher = new TransactionWatcher(provider);
    const transactionOnNetwork = await watcher.awaitCompleted(
      deployTransaction
    );

    const txStatus = transactionOnNetwork.status;
    const txHash = transactionOnNetwork.hash;

    spinner.stop();

    console.log(`\nDeployment transaction executed: ${txStatus}`);
    console.log(
      `Deployment tx: ${multiversxExplorer[chain]}/transactions/${txHash}\n`
    );

    console.log(`Smart Contract address: ${smartContractAddress}\n`);
    updateOutputFile({
      nftScAddress: smartContractAddress,
      nftSellingPrice: deployNftMinterSellingPrice,
    });
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
  }
};

export const deploySftMinter = async () => {
  // Check if there is an old output file
  const outputFile = getFileContents(outputFileName, { noExitOnError: true });

  if (outputFile) {
    outputFile.sftMinterScAddress = '';
    outputFile.sftMinterScCollectionSellingPrice = '';
    outputFile.sftMinterCollectionToken = '';
    fs.writeFileSync(
      `${baseDir}/${outputFileName}`,
      JSON.stringify(outputFile),
      'utf8'
    );
  }

  const spinner = ora('Processing the transaction...');

  try {
    const { scWasmCode, smartContract, userAccount, signer, provider } =
      await setupSftSc();

    await areYouSureAnswer();

    const deployTransaction = getDeploySftTransaction(
      scWasmCode,
      smartContract,
      deploySftMinterGasLimit
    );

    deployTransaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(deployTransaction);

    spinner.start();

    const smartContractAddress = SmartContract.computeAddress(
      deployTransaction.getSender(),
      deployTransaction.getNonce()
    );

    smartContract.setAddress(smartContractAddress);

    await provider.sendTransaction(deployTransaction);

    const watcher = new TransactionWatcher(provider);
    const transactionOnNetwork = await watcher.awaitCompleted(
      deployTransaction
    );

    const txStatus = transactionOnNetwork.status;
    const txHash = transactionOnNetwork.hash;

    spinner.stop();

    console.log(`\nDeployment transaction executed: ${txStatus}`);
    console.log(
      `Deployment tx: ${multiversxExplorer[chain]}/transactions/${txHash}\n`
    );

    console.log(`Smart Contract address: ${smartContractAddress}\n`);
    updateOutputFile({
      sftScAddress: smartContractAddress,
    });
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
  }
};

export const deploy = async (subcommand?: string) => {
  const COMMANDS = {
    nftMinter: 'nft-minter',
    sftMinter: 'sft-minter',
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
  if (subcommand === COMMANDS.sftMinter) {
    deploySftMinter();
  }
};
