import fs from 'fs';
import { Mnemonic } from '@elrondnetwork/erdjs';
import prompt from 'prompt';
import { exit } from 'process';
import { derivePemSeedQuestion } from './config';

// Derive PEM file from seed
export const derivePem = async () => {
  const promptSchema = {
    properties: {
      seed: {
        description: derivePemSeedQuestion,
        required: true,
      },
    },
  };

  prompt.start();

  try {
    const { seed } = await prompt.get([promptSchema]);

    if (!seed) {
      console.log('You have to provide the seed phrase value!');
      exit();
    }

    const mnemonic = Mnemonic.fromString(seed as string);

    const buff = mnemonic.deriveKey();

    const secretKeyHex = buff.hex();
    const pubKeyHex = buff.generatePublicKey().hex();

    const combinedKeys = Buffer.from(secretKeyHex + pubKeyHex).toString(
      'base64'
    );

    const addressFromPubKey = buff.generatePublicKey().toAddress().bech32();

    const header = `-----BEGIN PRIVATE KEY for ${addressFromPubKey}-----`;
    const footer = `-----END PRIVATE KEY for ${addressFromPubKey}-----`;

    const content = `${header}${combinedKeys}${footer}`;

    fs.writeFileSync('walletKey.pem', content);

    console.log('File saved as walletKey.pem');

    exit();
  } catch (e: any) {
    console.log(e.message);
    exit();
  }
};
