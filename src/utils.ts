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
  U32Value,
  BigUIntValue,
  AddressValue,
  Transaction,
  TransactionPayload,
} from '@elrondnetwork/erdjs';
import prompts, { PromptObject } from 'prompts';
import BigNumber from 'bignumber.js';
import ora from 'ora';
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
  nftMinterTokenSellingPrice,
  mintFunctionName,
  giveawayFunctionName,
  claimScFundsFunctionName,
  setDropFunctionName,
  unsetDropFunctionName,
  pauseMintingFunctionName,
  unpauseMintingFunctionName,
  commonConfirmLabel,
  setNewPriceFunctionName,
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
  return new ProxyProvider(proxyGateways[chain], { timeout: 10000 });
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
  gasLimit: number,
  imgBaseCid: string,
  fileExtension: string,
  metadataBaseCid: string,
  numberOfTokens: number,
  tokensLimitPerAddress: number,
  sellingPrice: string,
  royalties?: string,
  tags?: string,
  provenanceHash?: string
) => {
  return contract.deploy({
    code,
    gasLimit: new GasLimit(gasLimit),
    initArguments: [
      BytesValue.fromUTF8(imgBaseCid.trim()),
      BytesValue.fromUTF8(metadataBaseCid.trim()),
      new U32Value(numberOfTokens),
      new U32Value(tokensLimitPerAddress),
      new BigUIntValue(new BigNumber(Number(royalties) * 100 || 0)),
      new BigUIntValue(Balance.egld(sellingPrice.trim()).valueOf()),
      BytesValue.fromUTF8(fileExtension.trim()),
      BytesValue.fromUTF8(tags?.trim() || ''),
      BytesValue.fromUTF8(provenanceHash?.trim() || ''),
    ],
  });
};

export const updateOutputFile = ({
  scAddress,
  sellingPrice,
  tokenId,
}: {
  scAddress?: Address;
  sellingPrice?: string;
  tokenId?: string;
}) => {
  const outputFilePath = `${baseDir}/${outputFileName}`;
  try {
    accessSync(outputFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(outputFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      ...(scAddress ? { nftMinterScAddress: scAddress.bech32() } : {}),
      ...(sellingPrice
        ? {
            nftMinterScCollectionSellingPrice:
              Balance.egld(sellingPrice).toString(),
          }
        : {}),
      ...(tokenId ? { nftMinterCollectionToken: tokenId } : {}),
    };
    return writeFileSync(
      outputFilePath,
      JSON.stringify(newConfigFile, null, 2)
    );
  } catch {
    return writeFileSync(
      outputFilePath,
      JSON.stringify(
        {
          ...(scAddress ? { nftMinterScAddress: scAddress.bech32() } : {}),
          ...(sellingPrice
            ? {
                nftMinterScCollectionSellingPrice:
                  Balance.egld(sellingPrice).toString(),
              }
            : {}),
          ...(tokenId ? { nftMinterCollectionToken: tokenId } : {}),
        },
        null,
        2
      )
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
    args: [
      BytesValue.fromUTF8(tokenName.trim()),
      BytesValue.fromUTF8(tokenTicker.trim()),
    ],
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

export const getMintTransaction = (
  contract: SmartContract,
  baseGasLimit: number,
  tokensAmount: number
) => {
  const tokens = tokensAmount || 1;
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const tokenSellingPrice =
    output?.nftMinterScCollectionSellingPrice || nftMinterTokenSellingPrice;

  if (!tokenSellingPrice) {
    console.log(
      "Price per token isn't provided. Please add it to the config file."
    );
    exit(9);
  } else {
    return contract.call({
      func: new ContractFunction(mintFunctionName),
      gasLimit: new GasLimit(
        baseGasLimit + (baseGasLimit / 1.6) * tokensAmount
      ),
      args: [new U32Value(tokens)],
      value: Balance.fromString(tokenSellingPrice).times(tokens),
    });
  }
};

export const getGiveawayTransaction = (
  contract: SmartContract,
  baseGasLimit: number,
  address: string,
  tokensAmount: number
) => {
  const tokens = tokensAmount || 1;
  return contract.call({
    func: new ContractFunction(giveawayFunctionName),
    gasLimit: new GasLimit(baseGasLimit + (baseGasLimit / 1.6) * tokensAmount),
    args: [new AddressValue(new Address(address.trim())), new U32Value(tokens)],
  });
};

export const getClaimScFundsTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(claimScFundsFunctionName),
    gasLimit: new GasLimit(gasLimit),
  });
};

export const getSetDropTransaction = (
  contract: SmartContract,
  gasLimit: number,
  tokensAmount: number
) => {
  return contract.call({
    func: new ContractFunction(setDropFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [new U32Value(tokensAmount)],
  });
};

export const getUnsetDropTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(unsetDropFunctionName),
    gasLimit: new GasLimit(gasLimit),
  });
};

export const getPauseMintingTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(pauseMintingFunctionName),
    gasLimit: new GasLimit(gasLimit),
  });
};

export const getUnpauseMintingTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(unpauseMintingFunctionName),
    gasLimit: new GasLimit(gasLimit),
  });
};

export const commonTxOperations = async (
  tx: Transaction,
  account: Account,
  signer: UserSigner,
  provider: ProxyProvider
) => {
  tx.setNonce(account.nonce);
  account.incrementNonce();
  signer.sign(tx);

  const spinner = ora('Processing transaction...');
  spinner.start();

  await tx.send(provider);
  await tx.awaitExecuted(provider);
  const txHash = tx.getHash();

  spinner.stop();

  console.log(`Transaction hash: ${txHash}`);
};

export const getSetNewPriceTransaction = (
  contract: SmartContract,
  gasLimit: number,
  newPrice: string
) => {
  return contract.call({
    func: new ContractFunction(setNewPriceFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [new BigUIntValue(Balance.egld(newPrice.trim()).valueOf())],
  });
};

export const commonConfirmationPrompt: PromptObject[] = [
  {
    type: 'select',
    name: 'areYouSureAnswer',
    message: commonConfirmLabel,
    choices: [
      { title: 'Yes', value: 'yes' },
      { title: 'No', value: 'no' },
    ],
  },
];

export const areYouSureAnswer = async () => {
  const { areYouSureAnswer } = await prompts(commonConfirmationPrompt);

  if (areYouSureAnswer !== 'yes') {
    console.log('Aborted!');
    exit(9);
  }
};

// Built-in into the protocol
export const getClaimDevRewardsTransaction = (
  contract: SmartContract,
  userAccount: Account
) => {
  return new Transaction({
    data: new TransactionPayload('ClaimDeveloperRewards'),
    gasLimit: new GasLimit(6000000),
    sender: userAccount.address,
    receiver: contract.getAddress(),
    value: Balance.egld(0),
  });
};
