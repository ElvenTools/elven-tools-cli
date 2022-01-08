import { exit } from 'process';
import { unlinkSync } from 'fs';
import ora from 'ora';
import prompt from 'prompt';
import { setup } from './setup';
import {
  deployNftMinterGasLimit,
  outputFileName,
  deployNftMinterImgCidLabel,
  deployNftMinterMetaCidLabel,
  deployNftMinterAmountOfTokensLabel,
  deployNftMinterSellingPriceLabel,
  deployNftMinterRoyaltiesLabel,
  deployNftMinterMintingStartTimeLabel,
  deployNftMinterMintingEndTimeLabel,
  deployNftMinterTagsLabel,
  deployNftMinterProvenanceHashLabel,
} from './config';
import {
  getDeployTransaction,
  saveOutputAfterDeploy,
  getFileContents,
  baseDir,
} from './utils';

prompt.colors = false;

const deployNftMinter = async () => {
  // Check if there is an old output file
  const outputFile = getFileContents(outputFileName, { noExitOnError: true });

  if (outputFile) {
    unlinkSync(`${baseDir}/${outputFileName}`);
  }

  const promptSchema = {
    properties: {
      deployNftMinterImgCid: {
        description: deployNftMinterImgCidLabel,
        required: true,
      },
      deployNftMinterMetaCid: {
        description: deployNftMinterMetaCidLabel,
        required: true,
      },
      deployNftMinterAmountOfTokens: {
        description: deployNftMinterAmountOfTokensLabel,
        required: true,
      },
      deployNftMinterSellingPrice: {
        description: deployNftMinterSellingPriceLabel,
        required: true,
      },
      deployNftMinterRoyalties: {
        description: deployNftMinterRoyaltiesLabel,
        required: true,
        min: 0,
        max: 100,
      },
      deployNftMinterMintingStartTime: {
        description: deployNftMinterMintingStartTimeLabel,
        required: false,
      },
      deployNftMinterMintingEndTime: {
        description: deployNftMinterMintingEndTimeLabel,
        required: false,
      },
      deployNftMinterTags: {
        description: deployNftMinterTagsLabel,
        required: false,
      },
      deployNftMinterProvenanceHash: {
        description: deployNftMinterProvenanceHashLabel,
        required: false,
      },
    },
  };

  prompt.start();

  try {
    const { scWasmCode, smartContract, userAccount, signer, provider } =
      await setup();

    const {
      deployNftMinterImgCid,
      deployNftMinterMetaCid,
      deployNftMinterAmountOfTokens,
      deployNftMinterSellingPrice,
      deployNftMinterRoyalties,
      deployNftMinterMintingStartTime,
      deployNftMinterMintingEndTime,
      deployNftMinterTags,
      deployNftMinterProvenanceHash,
    } = await prompt.get(promptSchema);

    if (
      !deployNftMinterImgCid ||
      !deployNftMinterMetaCid ||
      !deployNftMinterAmountOfTokens ||
      !deployNftMinterSellingPrice
    ) {
      console.log('You have to provide the token name and ticker value!');
      exit(9);
    }

    const deployTransaction = getDeployTransaction(
      scWasmCode,
      smartContract,
      deployNftMinterGasLimit,
      deployNftMinterImgCid as string,
      deployNftMinterMetaCid as string,
      Number(deployNftMinterAmountOfTokens),
      deployNftMinterSellingPrice as string,
      deployNftMinterRoyalties as string,
      Number(deployNftMinterMintingStartTime),
      Number(deployNftMinterMintingEndTime),
      deployNftMinterTags as string,
      deployNftMinterProvenanceHash as string
    );

    deployTransaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(deployTransaction);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await deployTransaction.send(provider);
    await deployTransaction.awaitExecuted(provider);
    const txStatus = deployTransaction.getStatus();

    spinner.stop();

    console.log(`Deployment transaction executed: ${txStatus}`);
    const scAddress = smartContract.getAddress();
    console.log(`Smart Contract address: ${scAddress}`);
    saveOutputAfterDeploy({
      scAddress,
      sellingPrice: deployNftMinterSellingPrice as string,
    });
  } catch (e) {
    console.log(e);
  }
};

export const deploy = async (subcommand?: string) => {
  const COMMANDS = {
    nftMinter: 'nft-minter',
  };

  if (!subcommand || !Object.values(COMMANDS).includes(subcommand)) {
    console.log(
      `Plaese provide a proper deploy command. Available commands: ${Object.values(
        COMMANDS
      ).join(', ')}`
    );
    exit(9);
  }

  if (subcommand === COMMANDS.nftMinter) {
    deployNftMinter();
  }
};
