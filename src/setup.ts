import {
  deployNftMinterSCabiRelativeFilePath,
  deployNftMinterSCabiFileUrl,
  deployNftMinterSCwasmRelativeFilePath,
  deployNftMinterSCwasmFileUrl,
  pemKeyFileName,
} from './config';
import {
  getFileContents,
  getAbi,
  getScWasmCode,
  createSmartContractInstance,
  getProvider,
  syncProviderConfig,
  prepareUserAccount,
  prepareUserSigner,
} from './utils';

export const setup = async () => {
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
  const smartContract = createSmartContractInstance(abiFile);

  // Provider type based on initial configuration
  const provider = getProvider();
  await syncProviderConfig(provider);

  const userAccount = await prepareUserAccount(walletPemKey);
  await userAccount.sync(provider);

  const signer = prepareUserSigner(walletPemKey);

  return {
    scWasmCode,
    smartContract,
    signer,
    userAccount,
    provider,
  };
};
