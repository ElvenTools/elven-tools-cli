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

export const publicEndpointSetup = async () => {
  const walletPemKey = getFileContents(pemKeyFileName, { isJSON: false });
  // Provider type based on initial configuration
  const provider = getProvider();
  await syncProviderConfig(provider);

  const userAccount = await prepareUserAccount(walletPemKey);
  await userAccount.sync(provider);

  const signer = prepareUserSigner(walletPemKey);

  return {
    signer,
    userAccount,
    provider,
  };
};

export const setup = async (smartContractAddress?: string) => {
  // PEM wallet key file
  const abiFile = await getAbi(
    deployNftMinterSCabiRelativeFilePath,
    deployNftMinterSCabiFileUrl
  );
  const scWasmCode = await getScWasmCode(
    deployNftMinterSCwasmRelativeFilePath,
    deployNftMinterSCwasmFileUrl
  );

  // Smart contract instance - SC responsible for minting
  const smartContract = createSmartContractInstance(
    abiFile,
    smartContractAddress
  );

  const publicSetup = await publicEndpointSetup();

  return {
    scWasmCode,
    smartContract,
    ...publicSetup,
  };
};
