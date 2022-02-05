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
  QueryResponse,
  TypedValue,
  CodeMetadata,
  BooleanValue,
} from '@elrondnetwork/erdjs';
import prompts, { PromptObject } from 'prompts';
import BigNumber from 'bignumber.js';
import ora from 'ora';
import { readFileSync, accessSync, constants, writeFileSync } from 'fs';
import { exit, cwd } from 'process';
import { Buffer } from 'buffer';
import {
  proxyGateways,
  chain,
  outputFileName,
  issueTokenFnName,
  setLocalRolesFnName,
  nftMinterScAddress,
  nftMinterTokenSellingPrice,
  mintFunctionName,
  giveawayFunctionName,
  setDropFunctionName,
  unsetDropFunctionName,
  pauseMintingFunctionName,
  unpauseMintingFunctionName,
  commonConfirmLabel,
  setNewPriceFunctionName,
  shuffleFunctionName,
  deployNftMinterSCabiRelativeFilePath,
  deployNftMinterSCabiFileUrl,
  getMintedPerAddressTotalFunctionName,
  elrondExplorer,
  changeBaseCidsFunctionName,
  setNewTokensLimitPerAddressFunctionName,
  claimScFundsFunctionName,
  getMintedPerAddressPerDropFunctionName,
  populateIndexesFunctionName,
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
  provenanceHash?: string,
  upgradable = true,
  readable = false,
  payable = false,
  metadataInAssets = false
) => {
  return contract.deploy({
    code,
    codeMetadata: new CodeMetadata(upgradable, readable, payable),
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
      new BooleanValue(metadataInAssets),
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
        baseGasLimit + (baseGasLimit / 1.4) * (tokensAmount - 1)
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

export const getSetDropTransaction = (
  contract: SmartContract,
  gasLimit: number,
  tokensAmount: number,
  tokensLimitPerAddressPerDrop?: number
) => {
  return contract.call({
    func: new ContractFunction(setDropFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [
      new U32Value(tokensAmount),
      ...(tokensLimitPerAddressPerDrop
        ? [new U32Value(tokensLimitPerAddressPerDrop)]
        : []),
    ],
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

  const spinner = ora('Processing the transaction...');
  spinner.start();

  await tx.send(provider);
  await tx.awaitExecuted(provider);
  const txHash = tx.getHash();

  spinner.stop();

  console.log(`Transaction: ${elrondExplorer[chain]}/transactions/${txHash}`);
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

export const getShuffleTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(shuffleFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [],
  });
};

export const scQuery = (
  functionName: string,
  contract: SmartContract,
  provider: IProvider,
  args: TypedValue[] = []
) => {
  return contract.runQuery(provider, {
    func: new ContractFunction(functionName),
    args,
  });
};

export const parseQueryResultInt = (queryResponse: QueryResponse) => {
  const resultBuff = Buffer.from(
    queryResponse?.returnData?.[0],
    'base64'
  ).toString('hex');
  return new BigNumber(resultBuff, 16).toString(10);
};

export const parseQueryResultString = (queryResponse: QueryResponse) => {
  const resultBuff = Buffer.from(
    queryResponse?.returnData?.[0],
    'base64'
  ).toString('utf8');
  return resultBuff;
};

export const commonScQuery = async ({
  functionName,
  resultLabel,
  resultType,
  args,
}: {
  functionName: string;
  resultLabel: string;
  resultType: 'number' | 'string';
  args?: TypedValue[];
}) => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  const spinner = ora('Processing query...');
  try {
    const provider = getProvider();
    await syncProviderConfig(provider);

    const abiFile = await getAbi(
      deployNftMinterSCabiRelativeFilePath,
      deployNftMinterSCabiFileUrl
    );

    const smartContract = createSmartContractInstance(
      abiFile,
      smartContractAddress
    );

    spinner.start();

    const response = await scQuery(functionName, smartContract, provider, args);

    spinner.stop();

    let result;

    if (resultType === 'string') {
      result = parseQueryResultString(response);
    } else {
      result = parseQueryResultInt(response);
    }

    console.log('Query results:');
    console.log(`${resultLabel}: `, result.trim());
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
  }
};

export const getMintedPerAddressQuery = (address: string) => {
  commonScQuery({
    functionName: getMintedPerAddressTotalFunctionName,
    resultLabel: 'Tokens already minted per address',
    resultType: 'number',
    args: [new AddressValue(new Address(address))],
  });
};

export const getMintedPerAddressPerDropQuery = (address: string) => {
  commonScQuery({
    functionName: getMintedPerAddressPerDropFunctionName,
    resultLabel: 'Tokens already minted per address per drop',
    resultType: 'number',
    args: [new AddressValue(new Address(address))],
  });
};

export const getChangeBaseCidsTransaction = (
  contract: SmartContract,
  gasLimit: number,
  imgBaseCid: string,
  metadataBaseCid: string
) => {
  return contract.call({
    func: new ContractFunction(changeBaseCidsFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [
      BytesValue.fromUTF8(imgBaseCid.trim()),
      BytesValue.fromUTF8(metadataBaseCid.trim()),
    ],
  });
};

export const getSetNewTokensLimitPerAddressTransaction = (
  contract: SmartContract,
  gasLimit: number,
  tokensLimitPerAddress: number
) => {
  return contract.call({
    func: new ContractFunction(setNewTokensLimitPerAddressFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [new U32Value(tokensLimitPerAddress)],
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

export const getPopulateIndexesTx = (
  contract: SmartContract,
  gasLimit: number,
  amount: number
) => {
  return contract.call({
    func: new ContractFunction(populateIndexesFunctionName),
    gasLimit: new GasLimit(gasLimit),
    args: [new U32Value(amount)],
  });
};
