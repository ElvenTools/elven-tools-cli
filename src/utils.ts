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
} from '@elrondnetwork/erdjs';
import { readFileSync, accessSync, constants, writeFileSync } from 'fs';
import { exit, cwd } from 'process';
import {
  proxyGateways,
  chain,
  templFileName,
  issueTokenFnName,
} from './config';

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

export const createSmartContractInstance = (abi?: AbiRegistry) => {
  const contract = new SmartContract({
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
  const templFilePath = `${baseDir}/${templFileName}`;
  try {
    accessSync(templFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(templFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      nftMinterScAddress: scAddress.bech32(),
    };
    return writeFileSync(templFilePath, JSON.stringify(newConfigFile));
  } catch {
    return writeFileSync(
      templFilePath,
      JSON.stringify({ nftMinterScAddress: scAddress.bech32() })
    );
  }
};

export const getIssueTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  // TODO: get these values from prompt
  const tokenName = '';
  const tokenTicker = '';
  return contract.call({
    func: new ContractFunction(issueTokenFnName),
    args: [BytesValue.fromUTF8(tokenName), BytesValue.fromUTF8(tokenTicker)],
    gasLimit: new GasLimit(gasLimit),
  });
};
