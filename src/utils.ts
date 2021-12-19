import {
  ProxyProvider,
  IProvider,
  NetworkConfig,
  SmartContract,
  Address,
  Account,
  parseUserKey,
  UserSigner,
  SmartContractAbi,
  Code,
  GasLimit,
  AbiRegistry,
} from '@elrondnetwork/erdjs';
import { readFileSync, accessSync, constants } from 'fs';
import { exit, cwd } from 'process';
import { proxyGateways, chain } from './config';

export const baseDir = cwd();

export const getFileContents = (
  relativeFilePath: string,
  options = { isJSON: true }
) => {
  const filePath = `${baseDir}/${relativeFilePath}`;

  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
  } catch (err) {
    console.error(`There is no ${relativeFilePath}!`);
    exit();
  }

  const rawFile = readFileSync(filePath);
  const fileString = rawFile.toString('utf8');

  if (options.isJSON) {
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

export const getSmartContract = (scAddress: string, abi?: AbiRegistry) => {
  if (!SmartContract) {
    console.log(
      'Please provide your Smart Contract address in the configuration file!'
    );
    exit();
  } else {
    const contract = new SmartContract({
      address: new Address(scAddress),
      abi:
        abi &&
        new SmartContractAbi(
          abi,
          abi.interfaces.map((iface) => iface.name)
        ),
    });
    return contract;
  }
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
