import { cosmiconfigSync } from 'cosmiconfig';
import { cwd } from 'process';

const explorerSync = cosmiconfigSync('elventools');
const customConfig = explorerSync.search(cwd());

export const derivePemSeedQuestion = 'Enter mnemonic (seed phrase)';

export const exampleAnswer = customConfig?.config?.exampleAnswer || 'Hi';
