import prompts, { PromptObject } from 'prompts';
import download from 'download';
import spawn from 'cross-spawn';
import { exit } from 'process';
import { dappInitDirectoryNameLabel, dappZipFileUrl } from './config';

const directoryNameRegex =
  // eslint-disable-next-line no-control-regex
  /^[^\s^\x00-\x1f\\?*:"";<>|/.][^\x00-\x1f\\?*:"";<>|/]*[^\s^\x00-\x1f\\?*:"";<>|/.]+$/g;

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

    download(dappZipFileUrl, `${process.cwd()}/${dappDirectoryName}`, {
      extract: true,
      strip: 1,
    })
      .then(() => {
        process.chdir(dappDirectoryName);
        spawn.sync('npm', ['install'], { stdio: 'inherit' });
        spawn.sync('cp', ['.env.example', '.env.local'], { stdio: 'inherit' });
        process.chdir('..');
        console.log('\n');
        console.log(
          `The Minter Dapp is initialized in the ${dappDirectoryName} directory. Npm dependencies installed. .env.example copied into .env.local - change the settings there. Check the docs on how to run the Dapp: https://www.elven.tools`
        );
        console.log('\n');
      })
      .catch((err: any) => {
        if (err)
          console.log(
            `Can't download the ${dappZipFileUrl} (${err.statusCode}:${err.statusMessage})`
          );
      });
  } catch (e) {
    console.log((e as Error)?.message);
  }
};
