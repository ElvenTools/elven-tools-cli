#!/usr/bin/env node

import { exit, argv } from 'process';
import { deploy } from './deploy';
import { derivePem } from './derive-pem';
import packageJson from '../package.json';

const COMMANDS = {
  deploy: 'deploy',
  derivePem: 'derivePem',
};

const args = argv;
const command = args ? args[2] : undefined;

// Show version number
if (command === '--version' || command === '-v') {
  console.log(packageJson.version);
  exit();
}

const availableCommands = Object.keys(COMMANDS);
const helpMsg = `Available commands: ${[
  ...availableCommands,
  '--version',
  '-v',
  '--help',
  '-h',
].join(', ')}`;

if (command === '--help' || command === '-h') {
  console.log(helpMsg);
  exit(9);
}

if (!command || !Object.keys(COMMANDS).includes(command)) {
  console.log(`Plaese provide a proper command. ${helpMsg}`);
  exit(9);
}

if (command === COMMANDS.derivePem) {
  derivePem();
}

if (command === COMMANDS.deploy) {
  deploy();
}
