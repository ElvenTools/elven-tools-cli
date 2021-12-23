import { setup } from './setup';
import ora from 'ora';
import { getIssueTransaction, getFileContents, getIssuedToken } from './utils';
import {
  issueNftMinterGasLimit,
  outputFileName,
  nftMinterScAddress,
  issueNftMinterValue,
} from './config';
import { exit } from 'process';

// Issue a collection token + add required roles
export const issueCollectionToken = async () => {
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const smartContractAddress = output?.nftMinterScAddress || nftMinterScAddress;

  if (!smartContractAddress) {
    console.log(
      "Smart Contract address isn't provided. Please deploy it or add the address to the configuration if it is already deployed."
    );
    exit(9);
  }

  const { smartContract, userAccount, signer, provider } = await setup(
    smartContractAddress
  );

  const issueCollectionTokenTx = getIssueTransaction(
    smartContract,
    issueNftMinterGasLimit,
    issueNftMinterValue,
    // TODO
    'Test',
    'TSTN'
  );

  issueCollectionTokenTx.setNonce(userAccount.nonce);
  userAccount.incrementNonce();
  signer.sign(issueCollectionTokenTx);

  const spinner = ora('Processing transaction...');
  spinner.start();

  await issueCollectionTokenTx.send(provider);
  await issueCollectionTokenTx.awaitNotarized(provider);
  const txStatus = issueCollectionTokenTx.getStatus();
  const txHash = issueCollectionTokenTx.getHash();

  spinner.stop();

  console.log(`Issuance transaction executed: ${txStatus}`);
  console.log(`Transaction hash: ${txHash}`);

  spinner.start();

  console.log('Acquiring the token info...');

  const queryResponse = await getIssuedToken(provider, smartContract);

  spinner.stop();

  const tokenId = Buffer.from(
    queryResponse?.returnData?.[0],
    'base64'
  ).toString();

  console.log(tokenId);

  console.log('Also saved in the output.json file: ');

  // TODO: handle errors
  // TODO: save the token in the output.json file
};

export const nftMinter = async (subcommand?: string) => {
  const COMMANDS = {
    issueCollectionToken: 'collection-handle',
    setLocalRoles: 'roles',
  };

  if (!subcommand || !Object.values(COMMANDS).includes(subcommand)) {
    console.log(
      `Plaese provide a proper deploy command. Available commands: ${Object.values(
        COMMANDS
      ).join(', ')}`
    );
    exit(9);
  }

  if (subcommand === COMMANDS.issueCollectionToken) {
    issueCollectionToken();
  }
};
