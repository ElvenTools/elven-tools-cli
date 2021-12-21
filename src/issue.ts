import { setup } from './setup';
import ora from 'ora';
import { getIssueTransaction } from './utils';
import { issueNftMinterGasLimit } from './config';

// Issue a collection token + add required roles
export const issueCollectionToken = async () => {
  const { smartContract, userAccount, signer, provider } = await setup();

  const issueCollectionTokenTx = getIssueTransaction(
    smartContract,
    issueNftMinterGasLimit
  );

  issueCollectionTokenTx.setNonce(userAccount.nonce);
  userAccount.incrementNonce();
  signer.sign(issueCollectionTokenTx);

  const spinner = ora('Processing transaction...');
  spinner.start();

  await issueCollectionTokenTx.send(provider);
  await issueCollectionTokenTx.awaitExecuted(provider);
  const txStatus = issueCollectionTokenTx.getStatus();

  spinner.stop();

  console.log(`Deployment transaction executed: ${txStatus}`);

  // TODO: retrieve the collection token id here, console log it and save in the temp file
};
