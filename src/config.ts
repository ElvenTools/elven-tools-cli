import { cosmiconfigSync } from 'cosmiconfig';
import { cwd } from 'process';

const configFileName = 'elventools';

const explorerSync = cosmiconfigSync(configFileName);
const customConfig = explorerSync.search(cwd());

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Global settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// Chain to be used (local, devnet, testnet, mainnet)
export const chain = customConfig?.config?.chain || 'devnet';

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// NFT minter smart contract
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// This is useful when you have already deployed the smart contract and you want to interact
// Otherwise, after deployment using this tool, it will be saved in the temp file for further usage
export const nftMinterScAddress =
  customConfig?.config?.nftMinterSc?.deployNftMinterSC;

// Base gas limit required for the deployment
export const deployNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.deployGasLimit || 120000000;

// The tag from the SC's GitHub repository, it can be release tag like v0.2.0 or branch name like 'main' or 'development'
export const deployNftMinterScVersion =
  customConfig?.config?.nftMinterSc?.version || 'main';

// Gas limit required for the collection token issuance
export const issueNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.issueCollectionTokenGasLimit || 80000000;

// Value required for the collection token issuance  (1 = 1 EGLD)
export const issueNftMinterValue =
  customConfig?.config?.nftMinterSc?.issueValue || 0.05;

// Gas limit required for the collection token roles assignment
export const assignRolesNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.assignRolesGasLimit || 80000000;

// Issue collection token function name on the SC
export const issueTokenFnName =
  customConfig?.config?.nftMinterSc?.issueTokenFnName || 'issueToken';

// Function name for setting the roles for collection token on the SC
export const setLocalRolesFnName =
  customConfig?.config?.nftMinterSc?.setLocalRolesFnName || 'setLocalRoles';

// Get NFT collection token query function name on SC
export const getNftTokenIdFnName =
  customConfig?.config?.nftMinterSc?.getNftTokenIdFnName || 'getNftTokenId';

export const mintTxBaseGasLimit =
  customConfig?.config?.nftMinterSc?.mintBaseGasLimit || 10000000;

export const nftMinterTokenSellingPrice =
  customConfig?.config?.nftMinterSc?.tokenSelingPrice;

export const mintFunctionName =
  customConfig?.config?.nftMinterSc?.mintFnName || 'mint';

export const giveawayTxBaseGasLimit =
  customConfig?.config?.nftMinterSc?.giveawayBaseGasLimit || 10000000;

export const giveawayFunctionName =
  customConfig?.config?.nftMinterSc?.giveawayFnName || 'giveaway';

export const claimScFundsFunctionName =
  customConfig?.config?.nftMinterSc?.claimScFundsFnName || 'claimScFunds';

export const claimScFundsTxGasLimit =
  customConfig?.config?.nftMinterSc?.claimScFundsGasLimit || 6000000;

export const setDropFunctionName =
  customConfig?.config?.nftMinterSc?.setDropFnName || 'setDrop';

export const setUnsetDropTxGasLimit =
  customConfig?.config?.nftMinterSc?.setUnsetDropGasLimit || 6000000;

export const unsetDropFunctionName =
  customConfig?.config?.nftMinterSc?.unsetDropFnName || 'unsetDrop';

export const pauseUnpauseTxGasLimit =
  customConfig?.config?.nftMinterSc?.pauseUnpauseGasLimit || 5000000;

export const pauseMintingFunctionName =
  customConfig?.config?.nftMinterSc?.pauseMintingFnName || 'pauseMinting';

export const unpauseMintingFunctionName =
  customConfig?.config?.nftMinterSc?.unpauseMintingFnName || 'startMinting';

export const setNewPriceGasLimit =
  customConfig?.config?.nftMinterSc?.setNewPriceGasLimit || 5000000;

export const setNewPriceFunctionName =
  customConfig?.config?.nftMinterSc?.setNewPriceFnName || 'setNewPrice';

export const shuffleFunctionName =
  customConfig?.config?.nftMinterSc?.shuffleFnName || 'shuffle';

export const shuffleGasLimit =
  customConfig?.config?.nftMinterSc?.shuffleGasLimit || 5000000;

export const getTotalTokensLeftFunctionName =
  customConfig?.config?.nftMinterSc?.getTotalTokensLeftFnName ||
  'getTotalTokensLeft';

export const getProvenanceHashFunctionName =
  customConfig?.config?.nftMinterSc?.getProvenanceHashFnName ||
  'getProvenanceHash';

export const getDropTokensLeftFunctionName =
  customConfig?.config?.nftMinterSc?.getDropTokensLeftFnName ||
  'getDropTokensLeft';

export const getNftPriceFunctionName =
  customConfig?.config?.nftMinterSc?.getNftPriceFnName || 'getNftPrice';

export const getNftTokenIdFunctionName =
  customConfig?.config?.nftMinterSc?.getNftTokenIdFnName || 'getNftTokenId';

export const getNftTokenNameFunctionName =
  customConfig?.config?.nftMinterSc?.getNftTokenNameFnName || 'getNftTokenName';

export const getTokensLimitPerAddressFunctionName =
  customConfig?.config?.nftMinterSc?.getTokensLimitPerAddressFnName ||
  'getTokensLimitPerAddress';

export const getTokensMintedPerAddressFunctionName =
  customConfig?.config?.nftMinterSc?.getTokensMintedPerAddressFnName ||
  'getTokensMintedPerAddress';

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Other predefined config settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// Default will be devnet, based on chain value, if the local is chosen you can change the proxy host
export const proxyGateways: { [key: string]: string } = {
  local: customConfig?.config?.customProxyGateway || 'http://localhost:7950',
  testnet:
    customConfig?.config?.customProxyGateway ||
    'https://testnet-gateway.elrond.com',
  devnet:
    customConfig?.config?.customProxyGateway ||
    'https://devnet-gateway.elrond.com',
  mainnet:
    customConfig?.config?.customProxyGateway || 'https://gateway.elrond.com',
};

export const derivePemSeedQuestion = 'Enter mnemonic (seed phrase)\n';
export const collectionTokenNameLabel =
  'Enter the name for the collection token (ex. MyName123). \nAvoid spaces and special characters\n';
export const collectionTokenTickerLabel =
  'Enter the ticker for the collection token (ex. MYNAME). \nAvoid spaces and special characters. Keep it short and capitalize.\n';

export const deployNftMinterImgCidLabel = 'Provide the base IPFS CID:\n';
export const deployNftMinterMetaCidLabel =
  'Provide the base metadata files IPFS CID:\n';
export const deployNftMinterAmountOfTokensLabel =
  'Provide amount of tokens in collection:\n';
export const deployNftMinterSellingPriceLabel =
  'Provide the seling price (ex. 0.5 for 0.5 EGLD):\n';
export const deployNftMinterRoyaltiesLabel =
  'Provide the royalties value (ex. 20 for 20%) [optional]:\n';
export const deployNftMinterTagsLabel =
  'Provide tags (ex. tag1,tag2,tag3) [optional]:\n';
export const deployNftMinterProvenanceHashLabel =
  'Provide the provenance hash (sha256 hash of all images) [optional]:\n';
export const deployNftMinterImgExtLabel = 'Provide the file extension:\n';

export const amountOfTokensLabel =
  'Provide how many tokens should be minted.\nTake into account possible limitations set on the Smart Contract (ex 3 for three tokens):\n';

export const giveawayAddressLabel = 'Provide the address for giveaway: \n';
export const giveawayTokensAmount =
  'Provide how many tokens you want to give away.\nTake into account possible limitations set on the Smart Contract (ex 3 for three tokens):\n';

export const dropTokensAmountLabel =
  'Provide the amount of the tokens for the drop:\n';

export const commonConfirmLabel = 'Are you sure that you want to proceed?\n';

// Pem file name - generated by this tool
export const pemKeyFileName = 'walletKey.pem';

// Path to custom abi and wasm files when you don't want to use the repo version
// Relative to cmd
export const deployNftMinterSCabiRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.abi.json';
export const deployNftMinterSCwasmRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.wasm';

// Urls to the repo, when there are no local files
export const deployNftMinterSCabiFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/${deployNftMinterScVersion}/output/elven-nft-minter.abi.json`;
export const deployNftMinterSCwasmFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/${deployNftMinterScVersion}/output/elven-nft-minter.wasm`;

// Used for output data like the smart contract address after deploy
export const outputFileName = 'output.json';
