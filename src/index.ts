#!/usr/bin/env node

import { exit, argv } from 'process';
import { deploy } from './deploy';
import { derivePem } from './derive-pem';
import { nftMinter } from './nft-minter-fns';
import packageJson from '../package.json';

const COMMANDS = {
  deploy: 'deploy',
  derivePem: 'derive-pem',
  nftMinter: 'nft-minter',
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

if (command === COMMANDS.derivePem) {
  derivePem();
}

if (command === COMMANDS.deploy) {
  deploy(args ? args[3] : undefined);
}

if (command === COMMANDS.nftMinter) {
  nftMinter(args ? args[3] : undefined);
}
