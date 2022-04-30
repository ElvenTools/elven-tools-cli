#!/usr/bin/env node

import { exit, argv } from 'process';
import { deploy } from './deploy';
import { collectionNftOwners } from './collection-nft-owners';
import { derivePem } from './derive-pem';
import { nftMinter } from './nft-minter-fns';
import { initDapp } from './init-dapp';
import packageJson from '../package.json';

const COMMANDS = {
  deploy: 'deploy',
  derivePem: 'derive-pem',
  nftMinter: 'nft-minter',
  collectionNftOwners: 'collection-nft-owners',
  initDapp: 'init-dapp',
};

const args = argv;
const command = args ? args[2] : undefined;

// Show version number
if (command === '--version' || command === '-v') {
  console.log(packageJson.version);
  exit();
}

const availableCommands = Object.values(COMMANDS);

const commandsArray = [...availableCommands, '--version', '-v', '--help', '-h'];

const helpMsg = `========================\nAvailable commands:\n========================\n${commandsArray.join(
  '\n'
)}`;

if (command === '--help' || command === '-h') {
  console.log(helpMsg);
  exit(9);
}

if (!command || !Object.values(COMMANDS).includes(command)) {
  console.log(
    `====================================================\nPlaese provide a proper command. Available commands:\n====================================================\n${commandsArray.join(
      '\n'
    )}`
  );
  exit(9);
}

switch (command) {
  case COMMANDS.derivePem:
    derivePem();
    break;
  case COMMANDS.deploy:
    deploy(args ? args[3] : undefined);
    break;
  case COMMANDS.nftMinter:
    nftMinter(args ? args[3] : undefined);
    break;
  case COMMANDS.collectionNftOwners:
    collectionNftOwners();
    break;
  case COMMANDS.initDapp:
    initDapp();
    break;
  default:
    break;
}
