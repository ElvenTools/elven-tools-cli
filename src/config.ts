import { cosmiconfigSync } from 'cosmiconfig';
import packageJson from '../package.json';
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
// Deploy
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// This is useful when you have already deployed the smart contract and you want to interact
// Otherwise, after deployment using this tool, it will be saved in the temp file for further usage
export const nftMinterScAddress =
  customConfig?.config?.deployment?.nftMinterSc?.deployNftMinterSC;

// Gas limit required for the deployment
export const deployNftMinterGasLimit =
  customConfig?.config?.deployment?.nftMinterSc?.deployGasLimit || 80000000;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Issue token
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
export const issueNftMinterGasLimit =
  customConfig?.config?.deployment?.nftMinterSc?.issueGasLimit || 60000000;

// 1 = 1 EGLD
export const issueNftMinterValue =
  customConfig?.config?.deployment?.nftMinterSc?.issueValue || 0.05;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Other predefined config settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

export const proxyGateways: { [key: string]: string } = {
  local: customConfig?.config?.localProxyGateway || 'http://localhost:7950',
  testnet: 'https://testnet-gateway.elrond.com',
  devnet: 'https://devnet-gateway.elrond.com',
  mainnet: 'https://gateway.elrond.com',
};

export const derivePemSeedQuestion = 'Enter mnemonic (seed phrase)';

export const pemKeyFileName = 'walletKey.pem';

// Relative to cmd (checked first)
export const deployNftMinterSCabiRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.abi.json';

export const deployNftMinterSCwasmRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.wasm';

// Urls to the repo, when there are no local files
export const deployNftMinterSCabiFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/v${packageJson.version}/output/elven-nft-minter.abi.json`;
export const deployNftMinterSCwasmFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/v${packageJson.version}/output/elven-nft-minter.wasm`;

// Used for output data like the smart contract address after deploy
export const outputFileName = 'output.json';

export const issueTokenFnName = 'issueToken';

export const getNftTokenIdFnName = 'getNftTokenId';
