import { cosmiconfigSync } from 'cosmiconfig';
import packageJson from '../package.json';
import { cwd } from 'process';

const explorerSync = cosmiconfigSync('elventools');
const customConfig = explorerSync.search(cwd());

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Global settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// Chain to be used (local, devnet, testnet, mainnet)
export const chain = customConfig?.config?.chain || 'devnet';

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Deploy
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

export const deployNftMinterSC =
  customConfig?.config?.deployment?.nftMinterSc?.deployNftMinterSC;

// Gas limit required for the deployment
export const deployNftMinterGasLimit =
  customConfig?.config?.deployment?.nftMinterSc?.gasLimit || 80000000;

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Issue token
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// TODO

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

// Urls to the repo
export const deployNftMinterSCabiFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/v${packageJson.version}/output/elven-nft-minter.abi.json`;
export const deployNftMinterSCwasmFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/v${packageJson.version}/output/elven-nft-minter.wasm`;
