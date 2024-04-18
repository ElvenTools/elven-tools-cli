import {
  deployNftMinterSCabiRelativeFilePath,
  deployNftMinterSCabiFileUrl,
  deployNftMinterSCwasmRelativeFilePath,
  deployNftMinterSCwasmFileUrl,
  deploySftMinterSCabiRelativeFilePath,
  deploySftMinterSCabiFileUrl,
  deploySftMinterSCwasmRelativeFilePath,
  deploySftMinterSCwasmFileUrl,
  pemKeyFileName,
} from './config';
import {
  getFileContents,
  getAbi,
  getScWasmCode,
  createSmartContractInstance,
  getNetworkProvider,
  prepareUserAccount,
  prepareUserSigner,
} from './utils';

export const publicEndpointSetup = async () => {
  // PEM wallet key file
  const walletPemKey = getFileContents(pemKeyFileName, { isJSON: false });
  // Provider type based on initial configuration
  const provider = getNetworkProvider();

  const userAccount = await prepareUserAccount(walletPemKey);
  const userAccountOnNetwork = await provider.getAccount(userAccount.address);
  userAccount.update(userAccountOnNetwork);

  const signer = prepareUserSigner(walletPemKey);

  return {
    signer,
    userAccount,
    provider,
  };
};

export const setupNftSc = async (smartContractAddress?: string) => {
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

export const setupSftSc = async (smartContractAddress?: string) => {
  // PEM wallet key file
  const abiFile = await getAbi(
    deploySftMinterSCabiRelativeFilePath,
    deploySftMinterSCabiFileUrl
  );

  const scWasmCode = await getScWasmCode(
    deploySftMinterSCwasmRelativeFilePath,
    deploySftMinterSCwasmFileUrl
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
