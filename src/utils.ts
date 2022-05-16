import {
  SmartContract,
  Account,
  SmartContractAbi,
  Code,
  AbiRegistry,
  Address,
  ContractFunction,
  BytesValue,
  TokenPayment,
  U32Value,
  BigUIntValue,
  AddressValue,
  Transaction,
  TransactionPayload,
  IContractQueryResponse,
  TypedValue,
  CodeMetadata,
  BooleanValue,
  List,
  ListType,
  AddressType,
  IAddress,
  TransactionWatcher,
} from '@elrondnetwork/erdjs';
import axios, { AxiosResponse } from 'axios';
import { parseUserKey, UserSigner } from '@elrondnetwork/erdjs-walletcore';
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers';
import prompts, { PromptObject } from 'prompts';
import BigNumber from 'bignumber.js';
import ora from 'ora';
import {
  readFileSync,
  accessSync,
  constants,
  writeFileSync,
  promises,
} from 'fs';
import { exit, cwd } from 'process';
import {
  proxyGateways,
  chain,
  shortChainId,
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
  getMintedPerAddressTotalFunctionName,
  elrondExplorer,
  changeBaseCidsFunctionName,
  setNewTokensLimitPerAddressFunctionName,
  claimScFundsFunctionName,
  getMintedPerAddressPerDropFunctionName,
  populateIndexesFunctionName,
  populateAllowlistFunctionName,
  getAllowlistAddressCheckFunctionName,
  enableAllowlistFunctionName,
  disableAllowlistFunctionName,
  clearAllowlistFunctionName,
  removeAllowlistFunctionName,
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
  return new ApiNetworkProvider(proxyGateways[chain], {
    timeout: 10000,
  });
};

export const createSmartContractInstance = (
  abi?: SmartContractAbi,
  address?: string
) => {
  const contract = new SmartContract({
    address: address ? new Address(address) : undefined,
    abi,
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

export const getAbi = async (filePath: string, url: string) => {
  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
    const jsonContent: string = await promises.readFile(filePath, {
      encoding: 'utf8',
    });
    const json = JSON.parse(jsonContent);
    const abiRegistry = AbiRegistry.create(json);
    return new SmartContractAbi(abiRegistry);
  } catch {
    const response: AxiosResponse = await axios.get(url);
    const abiRegistry = AbiRegistry.create(response.data);
    return new SmartContractAbi(abiRegistry);
  }
};

export const getScWasmCode = async (filePath: string, url: string) => {
  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
    const buffer: Buffer = await promises.readFile(filePath);
    return Code.fromBuffer(buffer);
  } catch {
    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      responseType: 'arraybuffer',
      transformResponse: [],
      headers: {
        Accept: 'application/wasm',
      },
    });
    const buffer = Buffer.from(response.data);
    return Code.fromBuffer(buffer);
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
    gasLimit: gasLimit,
    initArguments: [
      BytesValue.fromUTF8(imgBaseCid.trim()),
      BytesValue.fromUTF8(metadataBaseCid.trim()),
      new U32Value(numberOfTokens),
      new U32Value(tokensLimitPerAddress),
      new BigUIntValue(new BigNumber(Number(royalties) * 100 || 0)),
      new BigUIntValue(
        TokenPayment.egldFromAmount(sellingPrice.trim()).valueOf()
      ),
      BytesValue.fromUTF8(fileExtension.trim()),
      BytesValue.fromUTF8(tags?.trim() || ''),
      BytesValue.fromUTF8(provenanceHash?.trim() || ''),
      new BooleanValue(metadataInAssets),
    ],
    chainID: shortChainId[chain],
  });
};

export const updateOutputFile = ({
  scAddress,
  sellingPrice,
  tokenId,
}: {
  scAddress?: IAddress;
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
              TokenPayment.egldFromAmount(sellingPrice).toString(),
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
                  TokenPayment.egldFromAmount(sellingPrice).toString(),
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
  tokenTicker: string,
  nftTokenName?: string
) => {
  return contract.call({
    func: new ContractFunction(issueTokenFnName),
    args: [
      BytesValue.fromUTF8(tokenName.trim()),
      BytesValue.fromUTF8(tokenTicker.trim()),
      ...(nftTokenName ? [BytesValue.fromUTF8(nftTokenName.trim())] : []),
    ],
    value: TokenPayment.egldFromAmount(value),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
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
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const getMintTransaction = (
  contractAddress: string,
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
    const contract = new SmartContract({
      address: new Address(contractAddress),
    });
    const totalPayment = new BigNumber(tokenSellingPrice).times(tokens);
    return contract.call({
      func: new ContractFunction(mintFunctionName),
      gasLimit: baseGasLimit + (baseGasLimit / 2) * (tokensAmount - 1),
      chainID: shortChainId[chain],
      args: [new U32Value(tokens)],
      value: TokenPayment.egldFromBigInteger(totalPayment),
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
    gasLimit: baseGasLimit + (baseGasLimit / 2) * (tokensAmount - 1),
    chainID: shortChainId[chain],
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
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
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
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const getPauseMintingTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(pauseMintingFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const getUnpauseMintingTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(unpauseMintingFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const getEnableAllowlistTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(enableAllowlistFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const getDisableAllowlistTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(disableAllowlistFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const commonTxOperations = async (
  tx: Transaction,
  account: Account,
  signer: UserSigner,
  provider: ApiNetworkProvider
) => {
  tx.setNonce(account.nonce);
  account.incrementNonce();
  signer.sign(tx);

  const spinner = ora('Processing the transaction...');
  spinner.start();

  await provider.sendTransaction(tx);

  const watcher = new TransactionWatcher(provider);
  const transactionOnNetwork = await watcher.awaitCompleted(tx);

  const txHash = transactionOnNetwork.hash;
  const txStatus = transactionOnNetwork.status;

  spinner.stop();

  console.log(`\nTransaction status: ${txStatus}`);
  console.log(
    `Transaction link: ${elrondExplorer[chain]}/transactions/${txHash}\n`
  );
};

export const getSetNewPriceTransaction = (
  contract: SmartContract,
  gasLimit: number,
  newPrice: string
) => {
  return contract.call({
    func: new ContractFunction(setNewPriceFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [
      new BigUIntValue(TokenPayment.egldFromAmount(newPrice.trim()).valueOf()),
    ],
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
    gasLimit: 6000000,
    chainID: shortChainId[chain],
    sender: userAccount.address,
    receiver: contract.getAddress(),
    value: TokenPayment.egldFromAmount(0),
  });
};

export const getShuffleTransaction = (
  contractAddress: string,
  gasLimit: number
) => {
  const contract = new SmartContract({ address: new Address(contractAddress) });
  return contract.call({
    func: new ContractFunction(shuffleFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [],
  });
};

export const scQuery = (
  functionName: string,
  contractAddress: string,
  provider: ApiNetworkProvider,
  args: TypedValue[] = []
) => {
  const contract = new SmartContract({ address: new Address(contractAddress) });
  const scQuery = contract.createQuery({
    func: new ContractFunction(functionName),
    args,
  });
  return provider.queryContract(scQuery);
};

export const parseQueryResultBoolean = (
  queryResponse: IContractQueryResponse
) => {
  const resultBuff = queryResponse.getReturnDataParts()?.[0]?.toString('hex');
  return resultBuff === '01' ? 'true' : 'false';
};

export const parseQueryResultInt = (queryResponse: IContractQueryResponse) => {
  const resultBuff = queryResponse.getReturnDataParts()?.[0]?.toString('hex');
  return new BigNumber(resultBuff, 16).toString(10);
};

export const parseQueryResultString = (
  queryResponse: IContractQueryResponse
) => {
  const resultBuff = queryResponse.getReturnDataParts()?.[0]?.toString('utf8');
  return resultBuff;
};

export const commonScQuery = async ({
  functionName,
  resultLabel,
  resultType,
  resultModifier,
  args,
}: {
  functionName: string;
  resultType: 'number' | 'string' | 'boolean';
  resultLabel?: string;
  resultModifier?: (result: boolean | string | number) => string;
  args?: TypedValue[];
}) => {
  const smartContractAddress = getTheSCAddressFromOutputOrConfig();
  const spinner = ora('Processing query...');
  try {
    const provider = getProvider();

    spinner.start();

    const response = await scQuery(
      functionName,
      smartContractAddress,
      provider,
      args
    );

    spinner.stop();

    let result;

    if (resultType === 'string') {
      result = parseQueryResultString(response);
    } else if (resultType === 'boolean') {
      result = parseQueryResultBoolean(response);
    } else {
      result = parseQueryResultInt(response);
    }

    resultModifier?.(result.trim());

    console.log(
      `${resultLabel ? resultLabel : 'Query results:'} `,
      resultModifier ? resultModifier(result.trim()) : result.trim()
    );
  } catch (e) {
    spinner.stop();
    console.log((e as Error)?.message);
  }
};

export const getMintedPerAddressQuery = (address: string) => {
  commonScQuery({
    functionName: getMintedPerAddressTotalFunctionName,
    resultLabel: 'Tokens already minted per address:',
    resultType: 'number',
    args: [new AddressValue(new Address(address))],
  });
};

export const getMintedPerAddressPerDropQuery = (address: string) => {
  commonScQuery({
    functionName: getMintedPerAddressPerDropFunctionName,
    resultLabel: 'Tokens already minted per address per drop:',
    resultType: 'number',
    args: [new AddressValue(new Address(address))],
  });
};

export const getAllowlistAddressCheckQuery = (address: string) => {
  commonScQuery({
    functionName: getAllowlistAddressCheckFunctionName,
    resultType: 'boolean',
    resultLabel: 'Result:',
    resultModifier: (result) =>
      result === 'true'
        ? 'Provided address is included!'
        : "Provided address isn't included!",
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
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
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
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new U32Value(tokensLimitPerAddress)],
  });
};

export const getClaimScFundsTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(claimScFundsFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
  });
};

export const getPopulateIndexesTx = (
  contract: SmartContract,
  gasLimit: number,
  amount: number
) => {
  return contract.call({
    func: new ContractFunction(populateIndexesFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new U32Value(amount)],
  });
};

export const getPopulateAllowlistTx = (
  contract: SmartContract,
  baseGasLimit: number,
  addresses: string[]
) => {
  const getList = () => {
    return new List(
      new ListType(new AddressType()),
      addresses.map((a) => new AddressValue(new Address(a)))
    );
  };

  return contract.call({
    func: new ContractFunction(populateAllowlistFunctionName),
    gasLimit: baseGasLimit + 1850000 * (addresses.length - 1),
    chainID: shortChainId[chain],
    args: [getList()],
  });
};

export const getClearAllowlistTx = (
  contract: SmartContract,
  baseGasLimit: number,
  itemsInAllowlist: number
) => {
  return contract.call({
    func: new ContractFunction(clearAllowlistFunctionName),
    gasLimit: baseGasLimit + 445000 * (itemsInAllowlist - 1),
    chainID: shortChainId[chain],
  });
};

export const getRemoveAllowlistAddressTx = (
  contract: SmartContract,
  gasLimit: number,
  address: string
) => {
  return contract.call({
    func: new ContractFunction(removeAllowlistFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new AddressValue(new Address(address))],
  });
};
