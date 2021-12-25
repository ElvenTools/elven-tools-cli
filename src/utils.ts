import {
  ProxyProvider,
  IProvider,
  NetworkConfig,
  SmartContract,
  Account,
  parseUserKey,
  UserSigner,
  SmartContractAbi,
  Code,
  GasLimit,
  AbiRegistry,
  Address,
  ContractFunction,
  BytesValue,
  Balance,
} from '@elrondnetwork/erdjs';
import { readFileSync, accessSync, constants, writeFileSync } from 'fs';
import { exit, cwd } from 'process';
import {
  proxyGateways,
  chain,
  outputFileName,
  issueTokenFnName,
  setLocalRolesFnName,
  getNftTokenIdFnName,
  nftMinterScAddress,
} from './config';

export const baseDir = cwd();

export const getFileContents = (
  relativeFilePath: string,
  options: { isJSON?: boolean; noExitOnError?: boolean }
) => {
  const isJSON = options.isJSON === undefined ? true : options.isJSON;
  const noExitOnError =
    options.noExitOnError === undefined ? false : options.noExitOnError;

  const filePath = `${baseDir}/${relativeFilePath}`;

  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
  } catch (err) {
    if (!noExitOnError) {
      console.error(`There is no ${relativeFilePath}!`);
      exit(9);
    } else {
      return undefined;
    }
  }

  const rawFile = readFileSync(filePath);
  const fileString = rawFile.toString('utf8');

  if (isJSON) {
    return JSON.parse(fileString);
  }
  return fileString;
};

export const getProvider = () => {
  return new ProxyProvider(proxyGateways[chain], { timeout: 5000 });
};

// Sync proper chain, for example, the devnet
export const syncProviderConfig = async (provider: IProvider) => {
  return NetworkConfig.getDefault().sync(provider);
};

export const createSmartContractInstance = (
  abi?: AbiRegistry,
  address?: string
) => {
  const contract = new SmartContract({
    address: address ? new Address(address) : undefined,
    abi:
      abi &&
      new SmartContractAbi(
        abi,
        abi.interfaces.map((iface) => iface.name)
      ),
  });
  return contract;
};

// Prepare main user account from the wallet PEM file
export const prepareUserAccount = async (walletPemKey: string) => {
  const userKey = parseUserKey(walletPemKey);
  const address = userKey.generatePublicKey().toAddress();
  return new Account(address);
};

export const prepareUserSigner = (walletPemKey: string) => {
  return UserSigner.fromPem(walletPemKey);
};

export const getAbi = (filePath: string, url: string) => {
  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
    return AbiRegistry.load({ files: [filePath] });
  } catch {
    return AbiRegistry.load({ urls: [url] });
  }
};

export const getScWasmCode = (filePath: string, url: string) => {
  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
    return Code.fromFile(filePath);
  } catch {
    return Code.fromUrl(url);
  }
};

export const getDeployTransaction = (
  code: Code,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.deploy({
    code,
    gasLimit: new GasLimit(gasLimit),
    initArguments: [],
  });
};

export const saveSCAddressAfterDeploy = (scAddress: Address) => {
  const templFilePath = `${baseDir}/${outputFileName}`;
  try {
    accessSync(templFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(templFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      nftMinterScAddress: scAddress.bech32(),
    };
    return writeFileSync(templFilePath, JSON.stringify(newConfigFile, null, 2));
  } catch {
    return writeFileSync(
      templFilePath,
      JSON.stringify({ nftMinterScAddress: scAddress.bech32() }, null, 2)
    );
  }
};

export const saveCollectionTokenAfterIssuance = (tokenId: string) => {
  const templFilePath = `${baseDir}/${outputFileName}`;
  try {
    accessSync(templFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(templFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      nftMinterCollectionToken: tokenId,
    };
    return writeFileSync(templFilePath, JSON.stringify(newConfigFile, null, 2));
  } catch {
    return writeFileSync(
      templFilePath,
      JSON.stringify({ nftMinterCollectionToken: tokenId }, null, 2)
    );
  }
};

export const getIssueTransaction = (
  contract: SmartContract,
  gasLimit: number,
  value: number, // mandatory 0.05 EGLD
  tokenName: string,
  tokenTicker: string
) => {
  return contract.call({
    func: new ContractFunction(issueTokenFnName),
    args: [BytesValue.fromUTF8(tokenName), BytesValue.fromUTF8(tokenTicker)],
    value: Balance.egld(value),
    gasLimit: new GasLimit(gasLimit),
  });
};

export const getIssuedToken = (
  provider: ProxyProvider,
  smartContract: SmartContract
) => {
  return smartContract.runQuery(provider, {
    func: new ContractFunction(getNftTokenIdFnName),
  });
};

export const getTheSCAddressFromOutputOrConfig = () => {
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const smartContractAddress = output?.nftMinterScAddress || nftMinterScAddress;

  if (!smartContractAddress) {
    console.log(
      "Smart Contract address isn't provided. Please deploy it or add the address to the configuration if it is already deployed."
    );
    exit(9);
  }
  return smartContractAddress;
};

export const getAssignRolesTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(setLocalRolesFnName),
    gasLimit: new GasLimit(gasLimit),
  });
};
