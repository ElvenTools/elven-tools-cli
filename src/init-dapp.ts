import prompts, { PromptObject } from 'prompts';
import spawn from 'cross-spawn';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { exit } from 'process';
import { dappInitDirectoryNameLabel, dappZipFileUrl } from './config';
import { elvenTools } from '../package.json';

const directoryNameRegex =
  // eslint-disable-next-line no-control-regex
  /^[^\s^\x00-\x1f\\?*:"";<>|/.][^\x00-\x1f\\?*:"";<>|/]*[^\s^\x00-\x1f\\?*:"";<>|/.]+$/g;

const triggerDownloadAndExtract = async (
  dappDirectoryName: string,
  resourceUrl: string
) => {
  try {
    const response = await axios.get(resourceUrl, {
      responseType: 'arraybuffer',
    });

    const dirPath = `${process.cwd()}/${dappDirectoryName}`;

    console.log('dirPath: ', dirPath);

    const zip = new AdmZip(response.data);
    const zipEntries = zip.getEntries();

    const mainDirInZipName = `elven-tools-dapp-${elvenTools.minterDappVersionTagName.replace(
      'v',
      ''
    )}`;

    zipEntries.forEach((entry) => {
      const entryName = entry.entryName;
      const flattenedEntryName = entryName.replace(mainDirInZipName, '');

      console.log('flattenedEntryName: ', flattenedEntryName);

      // If the entry is a directory, create it in the extraction directory
      if (entry.isDirectory) {
        const targetDir = path.join(dirPath, flattenedEntryName);

        console.log('targetDir: ', targetDir);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir);
        }
      } else {
        // If the entry is a file, extract it to the extraction directory
        const targetFilePath = path.join(dirPath, flattenedEntryName);
        fs.writeFileSync(targetFilePath, entry.getData());
      }
    });

    process.chdir(dappDirectoryName);
    spawn.sync('npm', ['install'], { stdio: 'inherit' });
    spawn.sync('cp', ['.env.example', '.env.local'], { stdio: 'inherit' });
    process.chdir('..');
    console.log('\n');
    console.log(
      `The Elven Tools Dapp is initialized in the ${dappDirectoryName} directory. Npm dependencies installed. .env.example copied into .env.local - change the settings there.`
    );
    console.log('\n');
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(
        `Can't download the ${resourceUrl} (${err.code}:${err.status})`
      );
    }
  }
};

export const initDapp = async () => {
  const promptsQuestions: PromptObject[] = [
    {
      type: 'text',
      name: 'dappDirectoryName',
      message: dappInitDirectoryNameLabel,
      validate: (value) => {
        if (!value) return 'Required!';
        if (!new RegExp(directoryNameRegex).test(value)) {
          return 'Wrong format for the directory name!';
        }
        return true;
      },
    },
  ];

  try {
    const { dappDirectoryName } = await prompts(promptsQuestions);

    if (!dappDirectoryName) {
      console.log('You have to provide the directory name!');
      exit(9);
    }

    await triggerDownloadAndExtract(dappDirectoryName, dappZipFileUrl);
  } catch (e) {
    console.log((e as Error)?.message);
  }
};
