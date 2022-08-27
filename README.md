### Elven Tools CLI

- Docs: [www.elven.tools](https://www.elven.tools)
- Elven Tools Twitter: [www.twitter.com/ElvenTools](https://twitter.com/ElvenTools)
- Quick jumpstart: [www.elven.tools/docs/jump-start.html](https://www.elven.tools/docs/jump-start.html)
- Intro video: [youtu.be/Jou5jn8PFz8](https://youtu.be/Jou5jn8PFz8)

### What is it?

The CLI tool helps to:
- deploy the NFT minter Smart Contract on the Elrond blockchain
- setup and interact with the NFT minter Smart Contract on the Elrond blockchain
- provides a couple of helper tools for getting the data from API
  - get collection owners
  - filter and export the data
  - distribute EGLD, ESDT, SFT and Meta ESDT to the NFT owners of a collection

For now it is designed to deploy the contract: [elven-nft-minter-sc](https://github.com/ElvenTools/elven-nft-minter-sc). There will be more in the future.

Be aware that the Smart Contract doesn't have any audits. It has complete functionality for the first version, but it still needs some improvements. Test it first on the devnet/testnet.

**You can use [elven-tools-dapp](https://github.com/ElvenTools/elven-tools-dapp) as your frontend dapp for minting process! (NextJS based app with all 4 auth providers included, and React hooks for interaction)** (Learn more about it here: [How to start with the Dapp](https://www.elven.tools/docs/how-to-start-with-the-dapp.html)).

### Tracking the progress

- [Elven Tools CLI kanban](https://github.com/orgs/ElvenTools/projects/3)

### How does it work? 

#### General how to:

- `npm install elven-tools -g`
- `elven-tools --version` or `elven-tools -v`
- `elven-tools --help` or `elven-tools -h` - for getting the commands on the root level
- `elven-tools nft-minter --help` or `elven-tools nft-minter -h` - for getting all the commands for the subcommand

#### Steps for deploying and interacting with the Smart Contract:

Check out the TL;DR and longer description here: [Jump start](https://www.elven.tools/docs/jump-start.html#tl%3Bdr)

### Check out possible workflows

Examples of how you can configure your Smart Contract in a couple of scenarios and how to use the CLI to do this faster and more efficient: [www.elven.tools/docs/elven-tools-workflows.html](https://www.elven.tools/docs/elven-tools-workflows.html)

### All Commands

For all commands, check out the docs: [www.elven.tools/docs/cli-commands.html](https://www.elven.tools/docs/cli-commands.html)

### Custom configuration options

For all configuration options check out the docs: [www.elven.tools/docs/cli-introduction.html#custom-configuration-options](https://www.elven.tools/docs/cli-introduction.html#custom-configuration-options)

### Most common recipes

Here are ready-to-use recipes and more information on real-life use cases: [Elven Tools Recipes](https://www.elven.tools/docs/recipes.html)

### You may also like

- [elven.js](https://github.com/juliancwirko/elven.js) - simplified wrapper over erdjs, designed to work as a plug-n-play solution for browser based use cases. No build steps and frameworks, just one file to rule it all! Check usage examples!
- [NFT Art Maker](https://github.com/juliancwirko/nft-art-maker) - generates images and metadata files and packs them into CAR files, all from provided PNG layers.
- [Buildo Begins](https://github.com/ElrondDevGuild/buildo-begins) - CLI toolset for interacting with the Elrond blockchain, APIs and smart contracts
- [Export collection owners to CSV](https://github.com/ElvenTools/elven-tools-collection-owners-csv)

### Issues and ideas

Please post issues and ideas [here](https://github.com/ElvenTools/elven-tools-cli/issues).

### Contact

- [Telegram](https://t.me/juliancwirko)
- [Twitter](https://twitter.com/JulianCwirko)

### License

MIT
