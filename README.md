### Elven Tools CLI

- Docs: [www.elven.tools](https://www.elven.tools)
- Quick jumpstart: [www.elven.tools/docs/jump-start.html](https://www.elven.tools/docs/jump-start.html)
- Intro video: [youtu.be/resGP6a7_34](https://youtu.be/resGP6a7_34)

🚨 It has complete functionality for the first version, but it is still under active development. As for the mainnet, use it at your own risk! Test it first on the devnet/testnet. 🚨

### What is it?

- The CLI tool helps to:
  - deploy the NFT minter Smart Contract on the Elrond blockchain
  - interact with the NFT minter Smart Contract on the Elrond blockchain

For now it is designed to deploy the contract: [elven-nft-minter-sc](https://github.com/juliancwirko/elven-nft-minter-sc).

### How does it work? 

#### General how to:

- `npm install elven-tools -g`
- `elven-tools --version` or `elvent-tools -v`
- `elven-tools --help` or `elven-tools -h` - for getting the commands on the root level
- `elven-tools nft-minter --help` or `elven-tools nft-minter -h` - for getting all the commands for the subcommand

#### Steps for deploying and interacting with the Smart Contract:

Be aware that, by default, all will happen on the devnet. See below how to change it.

First steps:

1. `elven-tools derive-pem` - you would need to generate the PEM file for all further operations, do not share it with anyone. It works similar to `erdpy wallet derive`. It will take the keyphrase and generate the `walletKey.pem` file in the same directory.
2. `elven-tools deploy nft-minter` - by default, the tools will take the abi and wasm source code and deploy directly from the defined tag branch of the smart contract. There are two options to work with it, though. You can configure a different branch or tag, or you can download the files and work on them locally.
  - For changing the branch, for example to `development` create the `.elventoolsrc` file in the same directory where the `walletKey.pem` file is located, put there `{ "nftMinter": { "version": "development" } }`. It can be also a tag name of the release in this [GitHub repository](https://github.com/juliancwirko/elven-nft-minter-sc).
  - If you would like to work locally. For example, you cloned the Smart Contract and worked on your version. You can create a directory structure next to the `walletKey.pem`. It should look like: `sc/nft-minter`. Here you will need to put the .wasm and .abi.json files which you can get from the [output](https://github.com/juliancwirko/elven-nft-minter-sc/tree/main/output) directory of the Smart Contract.
  - This command takes a couple of arguments asking for them with prompts.
3. When the Smart Contract (check it in the explorer) is deployed, you need to create your collection token. You can do this by `elven-tools nft-minter issue-collection-token`. You will be asked for the name and the ticker. Keep the name without spaces and the ticker short and capitalized.
4. Next step would be to add a 'create' role. You can do this by `elven-tools nft-minter set-roles`
5. Next is a required initial call to the shuffle endpoint: `elven-tools nft-minter shuffle`. Anyone can call this anytime, but it should be called once before the minting. Otherwise, the mint process won't work.
5. Then you can start the minting `elven-tools nft-minter start-minting` or setup a drop `elven-tools nft-minter set-drop` where the minting will be split into 'waves'. The first version of the Smart Contract mints randomly on demand and sends the NFT to the buyer. More advanced logic will land in version 2.
6. You can also mint the tokens using the same or different `walletKey.pem` for that run `elven-tools nft-minter mint`.
7. You can list all the commands using `elven-tools nft-minter --help`; below, you'll find all of them with short descriptions.

### Check out possible workflows

Examples of how you can configure your Smart Contract in a couple of scenarios and how to use the CLI to do this faster and more efficient: [www.elven.tools/docs/elven-tools-workflows.html](https://www.elven.tools/docs/elven-tools-workflows.html)

### All Commands

For all commands, check out the docs: [www.elven.tools/docs/cli-commands.html](https://www.elven.tools/docs/cli-commands.html)

### Custom configuration options

For all configuration options check out the docs: [www.elven.tools/docs/cli-introduction.html#custom-configuration-options](https://www.elven.tools/docs/cli-introduction.html#custom-configuration-options)

### TODO
- check the [issues](https://github.com/juliancwirko/elven-tools-cli/issues)

### Contact

- [Telegram](https://t.me/juliancwirko)
- [Twitter](https://twitter.com/JulianCwirko)

### You may also like

- [NFT Art Maker](https://github.com/juliancwirko/nft-art-maker) - generates images and metadata files and packs them into CAR files, all from provided PNG layers.

### Issues and ideas

Please post issues and ideas [here](https://github.com/juliancwirko/elven-tools-cli/issues).

### License

MIT + GPLv3 (Elrond tooling)
