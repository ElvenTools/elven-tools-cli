import {
  SmartContract,
  Account,
  Code,
  AbiRegistry,
  Address,
  ContractFunction,
  BytesValue,
  TokenTransfer,
  U32Value,
  U64Value,
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
  TransferTransactionsFactory,
  GasEstimator,
  ITransactionOnNetwork,
  EnumType,
  EnumValue,
} from '@multiversx/sdk-core';
import axios, { AxiosResponse } from 'axios';
import { parseUserKey, UserSigner } from '@multiversx/sdk-wallet';
import {
  ApiNetworkProvider,
  ProxyNetworkProvider,
} from '@multiversx/sdk-network-providers';
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
  apiProvider,
  gatewayProvider,
  gatewayProviderEndpoint,
  chain,
  shortChainId,
  outputFileName,
  issueNftTokenFnName,
  issueSftTokenFnName,
  setNftLocalRolesFnName,
  setSftLocalRolesFnName,
  nftMinterScAddress,
  sftMinterScAddress,
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
  multiversxExplorer,
  changeBaseCidsFunctionName,
  setNewTokensLimitPerAddressFunctionName,
  claimScFundsFunctionName,
  getMintedPerAddressPerDropFunctionName,
  populateAllowlistFunctionName,
  getAllowlistAddressCheckFunctionName,
  enableAllowlistFunctionName,
  disableAllowlistFunctionName,
  clearAllowlistFunctionName,
  removeAllowlistFunctionName,
  createSftTokenFnName,
  buySftTokenFnName,
  sftMinterTokenSellingPrice,
  getTokenDisplayNameFunctionName,
  getPriceFunctionName,
  getMaxAmountPerAddressFunctionName,
  setSftNewPriceFunctionName,
  getIsPausedFunctionName,
  sftStartSellingFunctionName,
  sftPauseSellingFunctionName,
  getSftAmountPerAddressTotalFunctionName,
  sftSetNewAmountLimitPerAddressFunctionName,
  getSftMintFunctionName,
  getSftBurnFunctionName,
  sftCollectionProperties,
} from './config';
import { UserAddress } from '@multiversx/sdk-wallet/out/userAddress';

export const baseDir = cwd();

export const getFileContents = (
  relativeFilePath: string,
  options: { isJSON?: boolean; noExitOnError?: boolean }
) => {
  const isJSON = options?.isJSON === undefined ? true : options.isJSON;
  const noExitOnError =
    options?.noExitOnError === undefined ? false : options.noExitOnError;

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

export const getNetworkProviderEndpoint = () => {
  if (gatewayProviderEndpoint) {
    return gatewayProvider[chain];
  }
  return apiProvider[chain];
};

export const getNetworkProvider = () => {
  if (gatewayProviderEndpoint) {
    return new ProxyNetworkProvider(gatewayProvider[chain], {
      timeout: 10000,
    });
  }
  return new ApiNetworkProvider(apiProvider[chain], {
    timeout: 10000,
  });
};

export const createSmartContractInstance = (
  abi?: AbiRegistry,
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
    return AbiRegistry.create(JSON.parse(jsonContent));
  } catch {
    const response: AxiosResponse = await axios.get(url);
    return AbiRegistry.create(response.data);
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

export const getDeployNftTransaction = (
  deployer: UserAddress,
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
  payableBySc = true,
  metadataInAssets = false
) => {
  return contract.deploy({
    code,
    codeMetadata: new CodeMetadata(upgradable, readable, payable, payableBySc),
    gasLimit: gasLimit,
    initArguments: [
      BytesValue.fromUTF8(imgBaseCid.trim()),
      BytesValue.fromUTF8(metadataBaseCid.trim()),
      new U32Value(numberOfTokens),
      new U32Value(tokensLimitPerAddress),
      new BigUIntValue(new BigNumber(Number(royalties) * 100 || 0)),
      new BigUIntValue(
        TokenTransfer.egldFromAmount(sellingPrice.trim()).valueOf()
      ),
      BytesValue.fromUTF8(fileExtension.trim()),
      BytesValue.fromUTF8(tags?.trim() || ''),
      BytesValue.fromUTF8(provenanceHash?.trim() || ''),
      new BooleanValue(metadataInAssets),
    ],
    deployer,
    chainID: shortChainId[chain],
  });
};

export const getDeploySftTransaction = (
  deployer: UserAddress,
  code: Code,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.deploy({
    code,
    codeMetadata: new CodeMetadata(true, false, false, true),
    gasLimit: gasLimit,
    initArguments: [],
    chainID: shortChainId[chain],
    deployer,
  });
};

// TODO: this should be unified and the best integrated with config file
export const updateOutputFile = ({
  nftScAddress,
  sftScAddress,
  nftSellingPrice,
  sftSellingPrice,
}: {
  nftScAddress?: IAddress;
  sftScAddress?: IAddress;
  nftSellingPrice?: string;
  sftSellingPrice?: string;
}) => {
  const outputFilePath = `${baseDir}/${outputFileName}`;
  try {
    accessSync(outputFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(outputFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      ...(nftScAddress ? { nftMinterScAddress: nftScAddress.bech32() } : {}),
      ...(nftSellingPrice
        ? {
            nftMinterScCollectionSellingPrice:
              TokenTransfer.egldFromAmount(nftSellingPrice).toString(),
          }
        : {}),
      ...(sftScAddress ? { sftMinterScAddress: sftScAddress.bech32() } : {}),
      ...(sftSellingPrice
        ? {
            sftMinterScCollectionSellingPrice:
              TokenTransfer.egldFromAmount(sftSellingPrice).toString(),
          }
        : {}),
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
          ...(nftScAddress
            ? { nftMinterScAddress: nftScAddress.bech32() }
            : {}),
          ...(nftSellingPrice
            ? {
                nftMinterScCollectionSellingPrice:
                  TokenTransfer.egldFromAmount(nftSellingPrice).toString(),
              }
            : {}),
          ...(sftScAddress
            ? { sftMinterScAddress: sftScAddress.bech32() }
            : {}),
          ...(sftSellingPrice
            ? {
                sftMinterScCollectionSellingPrice:
                  TokenTransfer.egldFromAmount(sftSellingPrice).toString(),
              }
            : {}),
        },
        null,
        2
      )
    );
  }
};

export const getNftIssueTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  value: number, // mandatory 0.05 EGLD
  tokenName: string,
  tokenTicker: string,
  noNftTokenNameNumber: boolean,
  nftTokenName?: string
) => {
  return contract.call({
    func: new ContractFunction(issueNftTokenFnName),
    args: [
      BytesValue.fromUTF8(tokenName.trim()),
      BytesValue.fromUTF8(tokenTicker.trim()),
      new BooleanValue(noNftTokenNameNumber),
      ...(nftTokenName ? [BytesValue.fromUTF8(nftTokenName.trim())] : []),
    ],
    value: TokenTransfer.egldFromAmount(value),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getSftIssueTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  value: number, // mandatory 0.05 EGLD
  tokenName: string,
  tokenTicker: string,
  tokenProperties: string[]
) => {
  return contract.call({
    func: new ContractFunction(issueSftTokenFnName),
    args: [
      BytesValue.fromUTF8(tokenName.trim()),
      BytesValue.fromUTF8(tokenTicker.trim()),
      ...tokenProperties.map((tokenProperty) =>
        EnumValue.fromName(
          EnumType.fromJSON(sftCollectionProperties),
          tokenProperty
        )
      ),
    ],
    value: TokenTransfer.egldFromAmount(value),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getNftSCAddressFromOutputOrConfig = () => {
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const smartContractAddress = nftMinterScAddress || output?.nftMinterScAddress;

  if (!smartContractAddress) {
    console.log(
      "Smart Contract address isn't provided. Please deploy it or add the address to the configuration if it is already deployed."
    );
    exit(9);
  }
  return smartContractAddress;
};

export const getSftSCAddressFromOutputOrConfig = () => {
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const smartContractAddress = sftMinterScAddress || output?.sftMinterScAddress;

  if (!smartContractAddress) {
    console.log(
      "Smart Contract address isn't provided. Please deploy it or add the address to the configuration if it is already deployed."
    );
    exit(9);
  }
  return smartContractAddress;
};

export const getNftAssignRolesTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(setNftLocalRolesFnName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getSftAssignRolesTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(setSftLocalRolesFnName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getMintTransaction = (
  caller: UserAddress,
  contractAddress: string,
  baseGasLimit: number,
  tokensAmount: number
) => {
  const tokens = tokensAmount || 1;
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const tokenSellingPrice =
    nftMinterTokenSellingPrice || output?.nftMinterScCollectionSellingPrice;

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
      value: TokenTransfer.egldFromBigInteger(totalPayment),
      caller,
    });
  }
};

export const getGiveawayTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  baseGasLimit: number,
  addresses: string[],
  tokensAmount: number
) => {
  const getList = () => {
    return new List(
      new ListType(new AddressType()),
      addresses.map((a) => new AddressValue(new Address(a)))
    );
  };

  const tokens = tokensAmount || 1;
  const mintsCount = addresses.length * tokens;
  return contract.call({
    func: new ContractFunction(giveawayFunctionName),
    gasLimit: baseGasLimit + (baseGasLimit / 2) * (mintsCount - 1),
    chainID: shortChainId[chain],
    args: [getList(), new U32Value(tokens)],
    caller,
  });
};

export const getSetDropTransaction = (
  caller: UserAddress,
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
    caller,
  });
};

export const getUnsetDropTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(unsetDropFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getPauseMintingTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(pauseMintingFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getUnpauseMintingTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(unpauseMintingFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getEnableAllowlistTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(enableAllowlistFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getDisableAllowlistTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(disableAllowlistFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const commonTxOperations = async (
  tx: Transaction,
  account: Account,
  signer: UserSigner,
  provider: ApiNetworkProvider | ProxyNetworkProvider
) => {
  tx.setNonce(account.nonce);
  account.incrementNonce();

  const serialized = tx.serializeForSigning();
  const signature = await signer.sign(serialized);
  tx.applySignature(signature);

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
    `Transaction link: ${multiversxExplorer[chain]}/transactions/${txHash}\n`
  );

  return transactionOnNetwork;
};

export const getSetNewPriceTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  newPrice: string
) => {
  return contract.call({
    func: new ContractFunction(setNewPriceFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [
      new BigUIntValue(TokenTransfer.egldFromAmount(newPrice.trim()).valueOf()),
    ],
    caller,
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
    value: TokenTransfer.egldFromAmount(0),
  });
};

export const getShuffleTransaction = (
  caller: UserAddress,
  contractAddress: string,
  gasLimit: number
) => {
  const contract = new SmartContract({ address: new Address(contractAddress) });
  return contract.call({
    func: new ContractFunction(shuffleFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [],
    caller,
  });
};

export const scQuery = (
  functionName: string,
  contractAddress: string,
  provider: ApiNetworkProvider | ProxyNetworkProvider,
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
  isNft = true,
}: {
  functionName: string;
  resultType: 'number' | 'string' | 'boolean';
  resultLabel?: string;
  resultModifier?: (result: boolean | string | number) => string;
  args?: TypedValue[];
  isNft?: boolean;
}) => {
  const smartContractAddress = isNft
    ? getNftSCAddressFromOutputOrConfig()
    : getSftSCAddressFromOutputOrConfig();
  const spinner = ora('Processing query...');
  try {
    const provider = getNetworkProvider();

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
  caller: UserAddress,
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
    caller,
  });
};

export const getSetNewTokensLimitPerAddressTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  tokensLimitPerAddress: number
) => {
  return contract.call({
    func: new ContractFunction(setNewTokensLimitPerAddressFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new U32Value(tokensLimitPerAddress)],
    caller,
  });
};

export const getClaimScFundsTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(claimScFundsFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getPopulateAllowlistTx = (
  caller: UserAddress,
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
    caller,
  });
};

export const getClearAllowlistTx = (
  caller: UserAddress,
  contract: SmartContract,
  baseGasLimit: number,
  itemsInAllowlist: number
) => {
  return contract.call({
    func: new ContractFunction(clearAllowlistFunctionName),
    gasLimit: baseGasLimit + 445000 * (itemsInAllowlist - 1),
    chainID: shortChainId[chain],
    caller,
  });
};

export const getRemoveAllowlistAddressTx = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  address: string
) => {
  return contract.call({
    func: new ContractFunction(removeAllowlistFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new AddressValue(new Address(address))],
    caller,
  });
};

// Distribute functions, used in loop
export const distributeEgldSingleAddress = async (
  amount: string,
  address: string,
  account: Account,
  signer: UserSigner,
  provider: ApiNetworkProvider | ProxyNetworkProvider
) => {
  const payment = TokenTransfer.egldFromAmount(amount);

  const senderAddress = signer.getAddress();

  // TODO: add custom message
  const data = new TransactionPayload(
    'EGLD distribution made by Elven Tools CLI'
  );

  const tx = new Transaction({
    data,
    gasLimit: 50000 + 1500 * data.length(),
    sender: senderAddress,
    receiver: new Address(address.trim()),
    value: payment,
    chainID: shortChainId[chain],
  });

  tx.setNonce(account.nonce);
  account.incrementNonce();

  const serialized = tx.serializeForSigning();
  const signature = await signer.sign(serialized);
  tx.applySignature(signature);

  try {
    await provider.sendTransaction(tx);

    const watcher = new TransactionWatcher(provider);
    const transactionOnNetwork = await watcher.awaitCompleted(tx);

    const txHash = transactionOnNetwork.hash;
    const txStatus = await provider.getTransactionStatus(txHash);

    return {
      receiverAddress: address,
      txHash,
      txStatus: txStatus.status,
    };
  } catch (e) {
    console.log(JSON.stringify(e));
    return {
      receiverAddress: address,
      txHash: '',
      txStatus: 'failed',
    };
  }
};

export const distributeEsdtSingleAddress = async (
  amount: string,
  address: string,
  account: Account,
  signer: UserSigner,
  provider: ApiNetworkProvider | ProxyNetworkProvider,
  token: string,
  numDecimals: number
) => {
  const transfer = TokenTransfer.fungibleFromAmount(token, amount, numDecimals);

  const senderAddress = signer.getAddress();

  const factory = new TransferTransactionsFactory(new GasEstimator());

  const tx = factory.createESDTTransfer({
    tokenTransfer: transfer,
    sender: senderAddress,
    receiver: new Address(address.trim()),
    chainID: shortChainId[chain],
  });

  tx.setNonce(account.nonce);
  account.incrementNonce();

  const serialized = tx.serializeForSigning();
  const signature = await signer.sign(serialized);
  tx.applySignature(signature);

  try {
    await provider.sendTransaction(tx);

    const watcher = new TransactionWatcher(provider);
    const transactionOnNetwork = await watcher.awaitCompleted(tx);

    const txHash = transactionOnNetwork.hash;
    const txStatus = await provider.getTransactionStatus(txHash);

    return {
      receiverAddress: address,
      txHash,
      txStatus: txStatus.status,
    };
  } catch (e) {
    console.log(JSON.stringify(e));
    return {
      receiverAddress: address,
      txHash: '',
      txStatus: 'failed',
    };
  }
};

export const distributeMetaEsdtSingleAddress = async (
  amount: string,
  address: string,
  account: Account,
  signer: UserSigner,
  provider: ApiNetworkProvider | ProxyNetworkProvider,
  numDecimals: number,
  collectionTicker: string,
  nonce: number
) => {
  const transfer = TokenTransfer.metaEsdtFromAmount(
    collectionTicker,
    nonce,
    amount,
    numDecimals
  );

  const senderAddress = signer.getAddress();

  const factory = new TransferTransactionsFactory(new GasEstimator());

  const tx = factory.createESDTNFTTransfer({
    tokenTransfer: transfer,
    nonce,
    sender: senderAddress,
    destination: new Address(address.trim()),
    chainID: shortChainId[chain],
  });

  tx.setNonce(account.nonce);
  account.incrementNonce();

  const serialized = tx.serializeForSigning();
  const signature = await signer.sign(serialized);
  tx.applySignature(signature);

  try {
    await provider.sendTransaction(tx);

    const watcher = new TransactionWatcher(provider);
    const transactionOnNetwork = await watcher.awaitCompleted(tx);

    const txHash = transactionOnNetwork.hash;
    const txStatus = await provider.getTransactionStatus(txHash);

    return {
      receiverAddress: address,
      txHash,
      txStatus: txStatus.status,
    };
  } catch (e) {
    console.log(JSON.stringify(e));
    return {
      receiverAddress: address,
      txHash: '',
      txStatus: 'failed',
    };
  }
};

export const distributeSftSingleAddress = async (
  amount: string,
  address: string,
  account: Account,
  signer: UserSigner,
  provider: ApiNetworkProvider | ProxyNetworkProvider,
  collectionTicker: string,
  nonce: number
) => {
  const transfer = TokenTransfer.semiFungible(
    collectionTicker,
    nonce,
    Number(amount)
  );

  const senderAddress = signer.getAddress();

  const factory = new TransferTransactionsFactory(new GasEstimator());

  const tx = factory.createESDTNFTTransfer({
    tokenTransfer: transfer,
    nonce,
    sender: senderAddress,
    destination: new Address(address.trim()),
    chainID: shortChainId[chain],
  });

  tx.setNonce(account.nonce);
  account.incrementNonce();

  const serialized = tx.serializeForSigning();
  const signature = await signer.sign(serialized);
  tx.applySignature(signature);

  try {
    await provider.sendTransaction(tx);

    const watcher = new TransactionWatcher(provider);
    const transactionOnNetwork = await watcher.awaitCompleted(tx);

    const txHash = transactionOnNetwork.hash;
    const txStatus = await provider.getTransactionStatus(txHash);

    return {
      receiverAddress: address,
      txHash,
      txStatus: txStatus.status,
    };
  } catch (e) {
    console.log(JSON.stringify(e));
    return {
      receiverAddress: address,
      txHash: '',
      txStatus: 'failed',
    };
  }
};

export const getSftCreateTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  tokenDisaplayName: string,
  tokenSellingPrice: string,
  metadataIpfsCID: string,
  metadataIpfsFileName: string,
  initialAmountOfTokens: number,
  maxTokensPerAddress: number,
  royalties: number,
  tags: string,
  uris: string[]
) => {
  return contract.call({
    func: new ContractFunction(createSftTokenFnName),
    args: [
      BytesValue.fromUTF8(tokenDisaplayName.trim()),
      new BigUIntValue(
        TokenTransfer.egldFromAmount(tokenSellingPrice.trim()).valueOf()
      ),
      BytesValue.fromUTF8(metadataIpfsCID.trim()),
      BytesValue.fromUTF8(metadataIpfsFileName.trim()),
      new BigUIntValue(new BigNumber(initialAmountOfTokens).valueOf()),
      new BigUIntValue(new BigNumber(maxTokensPerAddress).valueOf()),
      new BigUIntValue(new BigNumber(Number(royalties) * 100 || 0).valueOf()),
      BytesValue.fromUTF8(tags.trim()),
      ...uris.map((uri) => BytesValue.fromUTF8(uri.trim())),
    ],
    value: 0,
    gasLimit,
    chainID: shortChainId[chain],
    caller,
  });
};

export const getBuySftTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  tokenNonce: string,
  amountToBuy: number
) => {
  const nonceBigNumber = new BigNumber(tokenNonce, 16);
  const tokens = amountToBuy || 1;
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const tokenSellingPrice =
    sftMinterTokenSellingPrice || output?.sftMinterScCollectionSellingPrice;

  if (!tokenSellingPrice) {
    console.log(
      "Price per token isn't provided. Please add it to the config file."
    );
    exit(9);
  } else {
    const totalPayment = new BigNumber(tokenSellingPrice).times(tokens);
    return contract.call({
      func: new ContractFunction(buySftTokenFnName),
      args: [new U32Value(amountToBuy), new U64Value(nonceBigNumber)],
      value: totalPayment,
      gasLimit,
      chainID: shortChainId[chain],
      caller,
    });
  }
};

export const getSftSetNewPriceTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  nonce: string,
  newPrice: string
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  return contract.call({
    func: new ContractFunction(setSftNewPriceFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [
      new U64Value(nonceBigNumber),
      new BigUIntValue(TokenTransfer.egldFromAmount(newPrice.trim()).valueOf()),
    ],
    caller,
  });
};

export const getSftStartSellingTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  nonce: string
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  return contract.call({
    func: new ContractFunction(sftStartSellingFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new U64Value(nonceBigNumber)],
    caller,
  });
};

export const getSftPauseSellingTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  nonce: string
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  return contract.call({
    func: new ContractFunction(sftPauseSellingFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [new U64Value(nonceBigNumber)],
    caller,
  });
};

export const getSftSetNewAmountLimitPerAddressTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  nonce: string,
  limit: string
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  return contract.call({
    func: new ContractFunction(sftSetNewAmountLimitPerAddressFunctionName),
    gasLimit: gasLimit,
    chainID: shortChainId[chain],
    args: [
      new U64Value(nonceBigNumber),
      new BigUIntValue(new BigNumber(limit).valueOf()),
    ],
    caller,
  });
};

export const getSftMintTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  nonce: string,
  amount: number
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  return contract.call({
    func: new ContractFunction(getSftMintFunctionName),
    gasLimit,
    chainID: shortChainId[chain],
    args: [new U64Value(nonceBigNumber), new BigUIntValue(amount)],
    caller,
  });
};

export const getSftBurnTransaction = (
  caller: UserAddress,
  contract: SmartContract,
  gasLimit: number,
  nonce: string,
  amount: number
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  return contract.call({
    func: new ContractFunction(getSftBurnFunctionName),
    gasLimit,
    chainID: shortChainId[chain],
    args: [new U64Value(nonceBigNumber), new BigUIntValue(amount)],
    caller,
  });
};

export const getSftTokenDisplayNameQuery = (nonce: string) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  commonScQuery({
    functionName: getTokenDisplayNameFunctionName,
    resultLabel: 'Token display name:',
    resultType: 'string',
    args: [new U64Value(nonceBigNumber)],
    isNft: false,
  });
};

export const getSftPriceQuery = (nonce: string) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  commonScQuery({
    functionName: getPriceFunctionName,
    resultLabel: 'Price per amount 1:',
    resultType: 'number',
    args: [new U64Value(nonceBigNumber)],
    isNft: false,
  });
};

export const getSftMaxAmountPerAddress = (nonce: string) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  commonScQuery({
    functionName: getMaxAmountPerAddressFunctionName,
    resultLabel: 'Max SFT amount per address:',
    resultType: 'number',
    args: [new U64Value(nonceBigNumber)],
    isNft: false,
  });
};

export const getTheCollectionIdAfterIssuing = (
  transactionOnNetwork: ITransactionOnNetwork
) => {
  const resultItem = transactionOnNetwork.contractResults.items.find((item) =>
    item.data.startsWith('@00')
  );

  const id = resultItem?.data?.split('@')?.[2];

  return id ? Buffer.from(id, 'hex').toString('utf8') : undefined;
};

export const getIsPausedState = (nonce: string) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  commonScQuery({
    functionName: getIsPausedFunctionName,
    resultLabel: `Buying tokens with nonce ${nonce} is paused: `,
    resultType: 'boolean',
    args: [new U64Value(nonceBigNumber)],
    isNft: false,
  });
};

export const getAmountPerAddressTotalQuery = (
  nonce: string,
  address: string
) => {
  const nonceBigNumber = new BigNumber(nonce, 16);
  commonScQuery({
    functionName: getSftAmountPerAddressTotalFunctionName,
    resultLabel: `Total amount with nonce ${nonce} per address ${address}: `,
    resultType: 'number',
    args: [
      new U64Value(nonceBigNumber),
      new AddressValue(new Address(address)),
    ],
    isNft: false,
  });
};
