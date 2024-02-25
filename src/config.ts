import { cosmiconfigSync } from 'cosmiconfig';
import { cwd } from 'process';
import packageJson from '../package.json';

const configFileName = 'elventools';

const explorerSync = cosmiconfigSync(configFileName);
const customConfig = explorerSync.search(cwd());

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Global settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// Chain to be used (local, devnet, testnet, mainnet)
export const chain = customConfig?.config?.chain || 'devnet';

// The transaction watcher timeout (the time required when poling the transaction finalization results)
export const txWatcherTimeout = customConfig?.config?.txWatcherTimeout || 90000;

// The patience: an extra time (in milliseconds) to wait, after the transaction has reached its desired status.
// Currently there's a delay between the moment a transaction is marked as "completed" and the moment its outcome (contract results, events and logs) is available.
export const txWatcherPatience = customConfig?.config?.txWatcherPatience || 0;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// NFT minter smart contract
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// This is useful when you have already deployed the smart contract and you want to interact
// Otherwise, after deployment using this tool, it will be saved in the temp file for further usage
export const nftMinterScAddress =
  customConfig?.config?.nftMinterSc?.deployNftMinterSC;

// Base gas limit required for the deployment
export const deployNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.deployGasLimit || 80000000;

// The tag from the SC's GitHub repository, it can be release tag like v0.2.0 or branch name like 'main' or 'development'
export const deployNftMinterScVersion =
  customConfig?.config?.nftMinterSc?.version ||
  packageJson.elvenTools.nftSmartContractVersionTagName;

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
export const issueNftTokenFnName =
  customConfig?.config?.nftMinterSc?.issueTokenFnName || 'issueToken';

// Function name for setting the roles for collection token on the SC
export const setNftLocalRolesFnName =
  customConfig?.config?.nftMinterSc?.setLocalRolesFnName || 'setLocalRoles';

export const mintTxBaseGasLimit =
  customConfig?.config?.nftMinterSc?.mintBaseGasLimit || 12500000;

export const nftMinterTokenSellingPrice =
  customConfig?.config?.nftMinterSc?.tokenSellingPrice;

export const mintFunctionName =
  customConfig?.config?.nftMinterSc?.mintFnName || 'mint';

export const giveawayTxBaseGasLimit =
  customConfig?.config?.nftMinterSc?.giveawayBaseGasLimit || 12100000;

export const giveawayFunctionName =
  customConfig?.config?.nftMinterSc?.giveawayFnName || 'giveaway';

export const setDropFunctionName =
  customConfig?.config?.nftMinterSc?.setDropFnName || 'setDrop';

export const setUnsetDropTxGasLimit =
  customConfig?.config?.nftMinterSc?.setUnsetDropGasLimit || 5000000;

export const unsetDropFunctionName =
  customConfig?.config?.nftMinterSc?.unsetDropFnName || 'unsetDrop';

export const pauseUnpauseTxGasLimit =
  customConfig?.config?.nftMinterSc?.pauseUnpauseGasLimit || 4500000;

export const pauseMintingFunctionName =
  customConfig?.config?.nftMinterSc?.pauseMintingFnName || 'pauseMinting';

export const unpauseMintingFunctionName =
  customConfig?.config?.nftMinterSc?.unpauseMintingFnName || 'startMinting';

export const setNewPriceGasLimit =
  customConfig?.config?.nftMinterSc?.setNewPriceGasLimit || 4500000;

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

export const getCollectionTokenNameFunctionName =
  customConfig?.config?.nftMinterSc?.getCollectionTokenNameFnName ||
  'getCollectionTokenName';

export const getTokensLimitPerAddressTotalFunctionName =
  customConfig?.config?.nftMinterSc?.getTokensLimitPerAddressTotalFnName ||
  'getTokensLimitPerAddressTotal';

export const getMintedPerAddressTotalFunctionName =
  customConfig?.config?.nftMinterSc?.getMintedPerAddressTotalFnName ||
  'getMintedPerAddressTotal';

export const changeBaseCidsFunctionName =
  customConfig?.config?.nftMinterSc?.changeBaseCidsFnName || 'changeBaseCids';

export const changeBaseCidsGasLimit =
  customConfig?.config?.nftMinterSc?.changeBaseCidsGasLimit || 5000000;

export const setNewTokensLimitPerAddressFunctionName =
  customConfig?.config?.nftMinterSc?.setNewTokensLimitPerAddressFnName ||
  'setNewTokensLimitPerAddress';

export const setNewTokensLimitPerAddressGasLimit =
  customConfig?.config?.nftMinterSc?.setNewTokensLimitPerAddressGasLimit ||
  5000000;

export const claimScFundsFunctionName =
  customConfig?.config?.nftMinterSc?.claimScFundsFnName || 'claimScFunds';

export const claimScFundsTxGasLimit =
  customConfig?.config?.nftMinterSc?.claimScFundsGasLimit || 6000000;

export const getMintedPerAddressPerDropFunctionName =
  customConfig?.config?.nftMinterSc?.getMintedPerAddressPerDropFnName ||
  'getMintedPerAddressPerDrop';

export const getTokensLimitPerAddressPerDropFunctionName =
  customConfig?.config?.nftMinterSc?.getTokensLimitPerAddressPerDropFnName ||
  'getTokensLimitPerAddressPerDrop';

export const allowlistBatchSize =
  customConfig?.config?.nftMinterSc?.allowlistBatchSize || 320;

export const populateAllowlistFunctionName =
  customConfig?.config?.nftMinterSc?.populateAllowlistFnName ||
  'populateAllowlist';

export const populateAllowlistBaseGasLimit =
  customConfig?.config?.nftMinterSc?.populateAllowlistBaseGasLimit || 6000000;

export const clearAllowlistFunctionName =
  customConfig?.config?.nftMinterSc?.clearAllowlistFnName || 'clearAllowlist';

export const clearAllowlistBaseGasLimit =
  customConfig?.config?.nftMinterSc?.clearAllowlistBaseGasLimit || 5000000;

export const removeAllowlistFunctionName =
  customConfig?.config?.nftMinterSc?.removeAllowlistAddressFnName ||
  'removeAllowlistAddress';

export const removeAllowlistAddressLimit =
  customConfig?.config?.nftMinterSc?.removeAllowlistAddressLimit || 5000000;

export const getAllowlistFunctionName =
  customConfig?.config?.nftMinterSc?.getAllowlistFnName || 'getAllowlistSize';

export const isAllowlistEnabledFunctionName =
  customConfig?.config?.nftMinterSc?.isAllowlistEnabledFnName ||
  'isAllowlistEnabled';

export const getAllowlistAddressCheckFunctionName =
  customConfig?.config?.nftMinterSc?.getAllowlistAddressCheckFn ||
  'getAllowlistAddressCheck';

export const enableAllowlistFunctionName =
  customConfig?.config?.nftMinterSc?.enableAllowlistFnName || 'enableAllowlist';

export const disableAllowlistFunctionName =
  customConfig?.config?.nftMinterSc?.disableAllowlistFnName ||
  'disableAllowlist';

export const enableDisableAllowlistGasLimit =
  customConfig?.config?.nftMinterSc?.enableDisableAllowlistGasLimit || 6000000;

export const isDropActiveFunctionName =
  customConfig?.config?.nftMinterSc?.isDropActiveFnName || 'isDropActive';

export const tokensPerOneTx =
  customConfig?.config?.nftMinterSc?.tokensPerOneTx || 95;

export const tokensPerOneGiveawayTx =
  customConfig?.config?.nftMinterSc?.tokensPerOneGiveawayTx || 98;

export const isMintingPausedFunctionName =
  customConfig?.config?.nftMinterSc?.isMintingPausedFnName || 'isMintingPaused';

export const getTotalSupplyFunctionName =
  customConfig?.config?.nftMinterSc?.getTotalSupplyFnName || 'getTotalSupply';

export const getTotalSupplyOfCurrentDropFunctionName =
  customConfig?.config?.nftMinterSc?.getTotalSupplyOfCurrentDropFnName ||
  'getTotalSupplyOfCurrentDrop';

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// SFT minter smart contract
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// This is useful when you have already deployed the smart contract and you want to interact
// Otherwise, after deployment using this tool, it will be saved in the temp file for further usage
export const sftMinterScAddress =
  customConfig?.config?.sftMinterSc?.deploySftMinterSC;

// Base gas limit required for the deployment
export const deploySftMinterGasLimit =
  customConfig?.config?.sftMinterSc?.deployGasLimit || 45000000;

// The tag from the SC's GitHub repository, it can be release tag like v0.2.0 or branch name like 'main' or 'development'
export const deploySftMinterScVersion =
  customConfig?.config?.sftMinterSc?.version ||
  packageJson.elvenTools.sftSmartContractVersionTagName;

// Issue collection token function name on the SC
export const issueSftTokenFnName =
  customConfig?.config?.sftMinterSc?.issueTokenFnName || 'issueToken';

// Value required for the collection token issuance  (1 = 1 EGLD)
export const issueSftMinterValue =
  customConfig?.config?.sftMinterSc?.issueValue || 0.05;

// Gas limit required for the collection token issuance
export const issueSftMinterGasLimit =
  customConfig?.config?.sftMinterSc?.issueCollectionTokenGasLimit || 60000000;

// Function name for setting the roles for collection token on the SC
export const setSftLocalRolesFnName =
  customConfig?.config?.sftMinterSc?.setLocalRolesFnName || 'setLocalRoles';

// Gas limit required for the collection token roles assignment
export const assignRolesSftMinterGasLimit =
  customConfig?.config?.sftMinterSc?.assignRolesGasLimit || 60000000;

// Gas limit required for the SFT create function
export const createSftMinterGasLimit =
  customConfig?.config?.sftMinterSc?.createGasLimit || 20000000;

// Create token function name on the SC
export const createSftTokenFnName =
  customConfig?.config?.sftMinterSc?.createTokenFnName || 'createToken';

// Gas limit required for the SFT buy function
export const buySftMinterGasLimit =
  customConfig?.config?.sftMinterSc?.buyGasLimit || 20000000;

// Buy token amount function name on the SC
export const buySftTokenFnName =
  customConfig?.config?.sftMinterSc?.buyTokenAmountFnName || 'buy';

// Set new price function name
export const setSftNewPriceFunctionName =
  customConfig?.config?.sftMinterSc?.setNewPriceFnName || 'setNewPrice';

// Gas limit required for the SFT new price
export const sftSetNewPriceGasLimit =
  customConfig?.config?.sftMinterSc?.setNewPriceGasLimit || 4500000;

// Start selling by token nonce
export const sftStartSellingFunctionName =
  customConfig?.config?.sftMinterSc?.startSellingFnName || 'startSelling';

// Gas limit required for start selling transaction
export const sftStartSellingGasLimit =
  customConfig?.config?.sftMinterSc?.startSellingGasLimit || 3000000;

// Pause selling by token nonce
export const sftPauseSellingFunctionName =
  customConfig?.config?.sftMinterSc?.pauseSellingFnName || 'pauseSelling';

// Gas limit required for start selling transaction
export const sftPauseSellingGasLimit =
  customConfig?.config?.sftMinterSc?.pauseSellingGasLimit || 3000000;

// Change the limit of tokens per address
export const sftSetNewAmountLimitPerAddressFunctionName =
  customConfig?.config?.sftMinterSc?.setNewAmountLimitPerAddressFnName ||
  'setNewAmountLimitPerAddress';

// Gas limit required for changing the limit of amount ot particular token per address
export const sftNewAmountLimitPerAddressGasLimit =
  customConfig?.config?.sftMinterSc?.setNewAmountLimitPerAddressGasLimit ||
  3000000;

// Price of the amount of 1
export const sftMinterTokenSellingPrice =
  customConfig?.config?.sftMinterSc?.tokenSellingPrice;

// Get token display name function name on the SC
export const getTokenDisplayNameFunctionName =
  customConfig?.config?.sftMinterSc?.getTokenDisplayFnName ||
  'getTokenDisplayName';

// Get price per amount 1 function name on the SC
export const getPriceFunctionName =
  customConfig?.config?.sftMinterSc?.getPriceFnName || 'getPrice';

// Get max amount per one address function name on the SC
export const getMaxAmountPerAddressFunctionName =
  customConfig?.config?.sftMinterSc?.getMaxAmountPerAddressFnName ||
  'getMaxAmountPerAddress';

// Get collection token name
export const getSftCollectionTokenNameFunctionName =
  customConfig?.config?.sftMinterSc?.getCollectionTokenNameFnName ||
  'getCollectionTokenName';

// Get collection token id
export const getSftCollectionTokenIdFunctionName =
  customConfig?.config?.sftMinterSc?.getSftCollectionTokenIdFnName ||
  'getCollectionTokenId';

// Check if buying is possible
export const getIsPausedFunctionName =
  customConfig?.config?.sftMinterSc?.getIsPausedFnName || 'isPaused';

// Check how much tokens are already bought by particular address
export const getSftAmountPerAddressTotalFunctionName =
  customConfig?.config?.sftMinterSc?.getAmountPerAddressTotalFnName ||
  'getAmountPerAddressTotal';

// Increase the initial supply
export const getSftMintFunctionName =
  customConfig?.config?.sftMinterSc?.getSftMintFnName || 'mint';

// Gas limit required for mint transaction
export const sftMintGasLimit =
  customConfig?.config?.sftMinterSc?.mintGasLimit || 3000000;

// Decrease the initial supply
export const getSftBurnFunctionName =
  customConfig?.config?.sftMinterSc?.getSftBurnFnName || 'burn';

// Gas limit required for mint transaction
export const sftBurnGasLimit =
  customConfig?.config?.sftMinterSc?.burnGasLimit || 3000000;

// Gas limit required for giveaway transaction
export const sftGiveawayTxBaseGasLimit =
  customConfig?.config?.sftMinterSc?.giveawayBaseGasLimit || 3500000;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Collection NFT owners
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

export const collectionNftOwnersCallsPerSecond =
  customConfig?.config?.collectionNftOwners?.apiCallsPerSecond || 5;

export const distributeToOwnersCallsPerSecond =
  customConfig?.config?.distributeToOwners?.apiCallsPerSecond || 5;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Dapp
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// The tag from the SC's GitHub repository, please do not use branch names here
export const minterDappVersionTagName =
  customConfig?.config?.minterDapp?.version ||
  packageJson.elvenTools.minterDappVersionTagName;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Other predefined config settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

export const apiProviderEndpoint = customConfig?.config?.apiProviderEndpoint;

// Default will be devnet, based on chain value, if the local is chosen you can change the proxy host
export const apiProvider: { [key: string]: string } = {
  local: apiProviderEndpoint || 'http://localhost:7950',
  testnet: apiProviderEndpoint || 'https://testnet-api.multiversx.com',
  devnet: apiProviderEndpoint || 'https://devnet-api.multiversx.com',
  mainnet: apiProviderEndpoint || 'https://api.multiversx.com',
};

export const gatewayProviderEndpoint =
  customConfig?.config?.gatewayProviderEndpoint;

export const gatewayProvider: { [key: string]: string } = {
  local: gatewayProviderEndpoint || 'http://localhost:7950',
  testnet: gatewayProviderEndpoint || 'https://testnet-gateway.multiversx.com',
  devnet: gatewayProviderEndpoint || 'https://devnet-gateway.multiversx.com',
  mainnet: gatewayProviderEndpoint || 'https://gateway.multiversx.com',
};

export const shortChainId: { [key: string]: string } = {
  testnet: 'T',
  devnet: 'D',
  mainnet: '1',
};

export const multiversxExplorer: { [key: string]: string } = {
  devnet: 'https://devnet-explorer.multiversx.com',
  testnet: 'https://testnet-explorer.multiversx.com',
  mainnet: 'https://explorer.multiversx.com',
};

export const derivePemSeedQuestion = 'Enter mnemonic (seed phrase)\n';
export const collectionTokenNameLabel =
  'Enter the name for the collection token (ex. MyName123). \n(3-20 characters, alphanumeric only)\n';
export const collectionTokenTickerLabel =
  'Enter the ticker for the collection token (ex. MYNAME). \n(3-10 characters, alphanumeric and uppercase only)\n';
export const nftTokenNameNumberLabel =
  "Do you want to remove the edition number from the name? (example: 'name #1' when there is 1.json and 1.png)";
export const nftTokenNameLabel =
  'Enter the name for NFTs. If not provided, the name of the collection will be used. (Optional)\n';
export const deployNftMinterImgCidLabel =
  'Provide the base assets files IPFS CID:\n';
export const deployNftMinterMetaCidLabel =
  'Provide the base metadata files IPFS CID:\n';
export const deployNftMinterAmountOfTokensLabel =
  'Provide amount of tokens in collection:\n';
export const minterSellingPriceLabel =
  'Provide the selling price (ex. 0.5 for 0.5 EGLD):\n';
export const minterRoyaltiesLabel =
  'Provide the royalties value (ex. 5.5 for 5.5%):\n';
export const minterTagsLabel = 'Provide tags (ex. tag1,tag2,tag3):\n';
export const deployNftMinterProvenanceHashLabel =
  'Provide the provenance hash (sha256 hash of all images) [optional]:\n';
export const deployNftMinterTokensLimitPerAddressLabel =
  'Total tokens limit per one address per whole collection (the best is to keep it as low as possible):\n';
export const deployNftMinterImgExtLabel = 'Provide the file extension:\n';
export const sftTokenDisplayName =
  'Provide token display name (Alphanumeric characters only):\n';
export const metadataIpfsCIDLabel =
  'Provide the the metadata file CID from IPFS:\n';
export const metadataIpfsFileNameLabel =
  'Provide the the metadata file name uploaded using IPFS (ex: metadata.json):\n';
export const initialSFTSupplyLabel =
  'Provide the initial SFT supply (amount of tokens):\n';
export const amountOfTokensLabel = `Provide how many tokens should be minted.\nTake into account possible limitations set on the Smart Contract.\nYou need to provide the value which fits in limits as a whole. Max ${tokensPerOneTx} because of the max gas limit per transaction:\n`;
export const listOfSftUrisLabel =
  'Provide assets URIS. Whole URIs from IPFS. To your images, music, video files.\nSeparate them with comma (","):\n';
export const maxTokensPerAddress =
  'Provide the max tokens to buy per address:\n';
export const sftTokenNonceLabel =
  'Provide token nonce (for example in TTSFT-d1d695-01 the 01 has to be provided):\n';
export const amountToBuyLabel = 'Provide the amount of SFT to buy:\n';
export const giveawayAddressLabel = `Provide the list of addresses.\nSeparate them with comma (","):\n`;
export const sftGiveawayReceiversLabel = `Provide the list of receivers.\nExample: erd1...|01|10,erd1...|02|100 etc. (address|nonce|amount):\n`;
export const giveawayTokensAmount = `Provide how many tokens per one address you want to give away. Max ${tokensPerOneGiveawayTx} in total because of the max gas limit per transaction:\n`;
export const dropTokensAmountLabel =
  'Provide the amount of the tokens for the drop:\n';
export const commonConfirmLabel = 'Are you sure that you want to proceed?\n';
export const scUpgradableLabel =
  'Decide if the contract can be upgraded in the future.\n';
export const scReadableLabel =
  "Decide if the contract's storage can be read by other contracts. Not recommended in this case.\n";
export const scPayableLabel = 'Decide if the contract can receive funds.\n';
export const scPayableByScLabel =
  'Decide if the contract can receive funds from other smart contract. Recommended because of the royalties.\n';
export const dropTokensLimitPerAddressPerDropLabel =
  'Provide the tokens limit per single address per whole drop (the best is to keep it as low as possible) [optional]:\n';
export const deployMetadataInAssetsLabel =
  'Do you want to attach the metadata JSON file in the Assets/Uris? \n (It will be attached and encoded in the attributes anyway, but some marketplaces require that). \n';
export const addressesListLabel = `Provide the list of addresses. Max ${allowlistBatchSize} addresses per one transaction.\nYou can add more by sending more transactions. Separate them with comma (","):\n`;
export const collectionNftOwnersTickerLabel = 'Provide the collection ticker\n';
export const collectionNftOwnersNoSmartContractsLabel =
  'Do you want to exclude smart contract addresses?\n';
export const collectionNftOwnersMetadataFileName =
  'Do you want to filter by metadata JSON file name? Provide names without the extension separated by a comma (example: 123,555,9999) [you can ommit that, just confirm empty]\n';
export const dappInitDirectoryNameLabel =
  'Please provide the project name (directory name) in which the dapp should be initialized.\n';
export const removeAllowlistAddressLabel = 'Provide address to remove.\n';
export const provideAnAddressLabel = 'Please provide an address.\n';
export const newLimitPerAddressLabel =
  'Please provide new limit of tokens per address.\n';
export const newAmountOfTokensLabel =
  'Please provide the new amount of tokens to add to the initial supply.\n';
export const amountOfTokensToBurnLabel =
  'Please provide the amount to burn to decrease the initial supply.\n';

// Pem file name - generated by this tool
export const pemKeyFileName = 'walletKey.pem';

// Path to custom abi and wasm files when you don't want to use the repo version
// Relative to cmd
export const deployNftMinterSCabiRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.abi.json';
export const deployNftMinterSCwasmRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.wasm';

export const deploySftMinterSCabiRelativeFilePath =
  'sc/sft-minter/elven-tools-sft-minter.abi.json';
export const deploySftMinterSCwasmRelativeFilePath =
  'sc/sft-minter/elven-tools-sft-minter.wasm';

// Urls to the smart contract repo, when there are no local files
export const deployNftMinterSCabiFileUrl = `https://raw.githubusercontent.com/ElvenTools/elven-nft-minter-sc/${deployNftMinterScVersion}/output/elven-nft-minter.abi.json`;
export const deployNftMinterSCwasmFileUrl = `https://raw.githubusercontent.com/ElvenTools/elven-nft-minter-sc/${deployNftMinterScVersion}/output/elven-nft-minter.wasm`;

export const deploySftMinterSCabiFileUrl = `https://raw.githubusercontent.com/ElvenTools/elven-tools-sft-minter-sc/${deploySftMinterScVersion}/output/elven-tools-sft-minter.abi.json`;
export const deploySftMinterSCwasmFileUrl = `https://raw.githubusercontent.com/ElvenTools/elven-tools-sft-minter-sc/${deploySftMinterScVersion}/output/elven-tools-sft-minter.wasm`;

// Urls to the Dapp repo
export const dappZipFileUrl = `https://github.com/ElvenTools/elven-tools-dapp/archive/refs/tags/${minterDappVersionTagName}.zip`;

// Used for output data like the smart contract address after deploy
export const outputFileName = 'output.json';

// Used for the addresses list when populating the allowlist on the smart contract
export const allowlistFileRelativePath = 'allowlist.json';

// Used for the addresses list for giveaway functionality, optionally you can also use the giveaway and enter addresses by hand
export const giveawayFileRelativePath = 'giveaway.json';

const commonTokenProperties = [
  {
    name: 'CanFreeze',
    discriminant: 0,
  },
  {
    name: 'CanWipe',
    discriminant: 1,
  },
  {
    name: 'CanPause',
    discriminant: 2,
  },
  {
    name: 'CanTransferCreateRole',
    discriminant: 3,
  },
  {
    name: 'CanChangeOwner',
    discriminant: 4,
  },
  {
    name: 'CanUpgrade',
    discriminant: 5,
  },
  // The default property which is mandatory and already set to true on smart contract
  {
    name: 'CanAddSpecialRoles',
    discriminant: 6,
  },
];

// Tokens properties
export const sftCollectionProperties = {
  name: 'SFTProperties',
  variants: commonTokenProperties,
};

export const nftCollectionProperties = {
  name: 'NFTProperties',
  variants: commonTokenProperties,
};

export const sftSpecialRoles = {
  name: 'SFTRoles',
  variants: [
    {
      name: 'ESDTRoleNFTCreate',
      discriminant: 0,
    },
    {
      name: 'ESDTRoleNFTBurn',
      discriminant: 1,
    },
    {
      name: 'ESDTRoleNFTAddQuantity',
      discriminant: 2,
    },
    {
      name: 'ESDTTransferRole',
      discriminant: 3,
    },
  ],
};

export const nftSpecialRoles = {
  name: 'NFTRoles',
  variants: [
    {
      name: 'ESDTRoleNFTCreate',
      discriminant: 0,
    },
    {
      name: 'ESDTRoleNFTBurn',
      discriminant: 1,
    },
    {
      name: 'ESDTRoleNFTUpdateAttributes',
      discriminant: 2,
    },
    {
      name: 'ESDTRoleNFTAddURI',
      discriminant: 3,
    },
    {
      name: 'ESDTTransferRole',
      discriminant: 4,
    },
  ],
};
