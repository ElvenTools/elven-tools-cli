import { exit } from 'process';
import ora from 'ora';
import { setup } from './setup';
import { deployNftMinterGasLimit } from './config';
import { getDeployTransaction, saveSCAddressAfterDeploy } from './utils';

const deployNftMinter = async () => {
  try {
    const { scWasmCode, smartContract, userAccount, signer, provider } =
      await setup();

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
    const scAddress = smartContract.getAddress();
    console.log(`Smart Contract address: ${scAddress}`);
    saveSCAddressAfterDeploy(scAddress);
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
