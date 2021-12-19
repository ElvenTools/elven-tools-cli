import { exit } from 'process';
import ora from 'ora';
import {
  pemKeyFileName,
  deployNftMinterSC,
  deployNftMinterSCabiRelativeFilePath,
  deployNftMinterSCwasmRelativeFilePath,
  deployNftMinterGasLimit,
  deployNftMinterSCabiFileUrl,
  deployNftMinterSCwasmFileUrl,
} from './config';
import {
  getFileContents,
  getProvider,
  syncProviderConfig,
  getSmartContract,
  prepareUserAccount,
  getAbi,
  prepareUserSigner,
  getScWasmCode,
  getDeployTransaction,
} from './utils';

const deployNftMinter = async () => {
  try {
    // PEM wallet key file
    const walletPemKey = getFileContents(pemKeyFileName, { isJSON: false });
    const abiFile = await getAbi(
      deployNftMinterSCabiRelativeFilePath,
      deployNftMinterSCabiFileUrl
    );
    const scWasmCode = await getScWasmCode(
      deployNftMinterSCwasmRelativeFilePath,
      deployNftMinterSCwasmFileUrl
    );

    // Smart contract instance - SC responsible for minting
    const smartContract = getSmartContract(deployNftMinterSC, abiFile);

    // Provider type based on initial configuration
    const provider = getProvider();
    await syncProviderConfig(provider);

    const userAccount = await prepareUserAccount(walletPemKey);
    await userAccount.sync(provider);

    const signer = prepareUserSigner(walletPemKey);

    const deployTransaction = getDeployTransaction(
      scWasmCode,
      smartContract,
      deployNftMinterGasLimit
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
    console.log(`Smart Contract address: ${smartContract.getAddress()}`);
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
