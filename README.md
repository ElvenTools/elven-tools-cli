### Elven Tools CLI

- Docs: [www.elven.tools](https://www.elven.tools)
- Intro video: [youtu.be/szkNE_qOy6Q](https://youtu.be/szkNE_qOy6Q)

🚨 Not enough tests! As for the mainnet, use it at your own risk! 🚨

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
2. `elven-tools deploy nft-minter` - by default, the tools will take the abi and wasm source code and deploy directly from the main branch of the smart contract. There are two options to work with it, though. You can configure a different branch or tag, or you can download the files and work on them locally.
  - For changing the branch, for example to `development` create the `.elventoolsrc` file in the same directory where the `walletKey.pem` file is located, put there `{ "nftMinter": { "version": "development" } }`. It can be also a tag name of the release in this [GitHub repository](https://github.com/juliancwirko/elven-nft-minter-sc).
  - If you would like to work locally. For example, you cloned the Smart Contract and worked on your version. You can create a directory structure next to the `walletKey.pem`. It should look like: `sc/nft-minter`. Here you will need to put the .wasm and .abi.json files which you can get from the [output]() directory of the Smart Contract.
  - This command takes a couple of arguments asking for them with prompts.
3 When the Smart Contract (check it in the explorer) is deployed, you need to create your collection token. You can do this by `elven-tools nft-minter issue-collection-token`. You will be asked for the name and the ticker. Keep the name without spaces and the ticker short and capitalized.
4. Next step would be to add a 'create' role. You can do this by `elven-tools nft-minter set-roles`
5. Then you can start the minting `elven-tools nft-minter start-minting` or setup a drop `elven-tools nft-minter set-drop` where the minting will be split into 'waves'. The first version of the Smart Contract mints randomly on demand and sends the NFT to the buyer. More advanced logic will land in version 2.
6. You can also mint the tokens using the same or different `walletKey.pem` for that run `elven-tools nft-minter mint`.
7. You can list all the commands using `elven-tools nft-minter --help`; below, you'll find all of them with short descriptions.

### All Commands

- `elven-tools derive-pem` - derives the PEM file from seed phrase (keywords)
- `elven-tools deploy nft-minter` - deploys the smart contract (by default from the main branch using the devnet, can be configured)
- `elven-tools nft-minter issue-collection-token` [only owner] - issue main collection handle, it costs 0.05 EGLD, and it is a must in the Elrond chain. All NFTs will be under this collection. The cost here is a one-time payment for the whole collection.
- `elven-tools nft-minter set-roles` [only owner] - for now, the command sets the critical role for the collection handle. It is a 'create nft' role.
- `elven-tools nft-minter start-minting` [only owner] - by default, after deploying the smart contract, the minting is disabled. You would need to start it
- `elven-tools nft-minter pause-minting` [only owner] - you can also pause it at any moment
- `elven-tools nft-minter set-new-price` [only owner] - you can set a new price per NFT for the whole collection
- `elven-tools nft-minter giveaway` [only owner] - as an owner, you can give some random tokens to other addresses.
- `elven-tools nft-minter set-drop` [only owner] - you can also split the minting into drops. These are 'waves' of minting where you can change prices and promote each one (v1 doesn't include any logic for revealing the CIDs with delay, the revealed NFTs will be sent in every drop).
- `elven-tools nft-minter unset-drop` [only owner] - you can also disable the drop and pause minting
- `elven-tools nft-minter claim-dev-rewards` [only owner] - as an owner of the Smart Contract, you can always claim the developer rewards. Read more about them in the Elrond docs.
- `elven-tools nft-minter change-base-cids` [only owner] - you can change base IPFS CIDs only before any NFT was minted. Otherwise, it doesn't make sense to do that.
- `elven-tools nft-minter set-new-tokens-limit-per-address` [only owner] - it is possible to change the limits per address which are configured when deploying the Smart Contract
- `elven-tools nft-minter claim-sc-funds` [only owner] - this is treated as a fallback for royalties, there is no way for now to implement other solution, the Smart Contract will receive the royalties as the creator, so there has to be a way to get them back. Generally, it shouldn't be required otherwise. Proper solutions will be with the `esdt_nft_create_as_caller`, which doesn't work yet.
- `elven-tools nft-minter shuffle` - as a user, you can take part and ensure that the minting is random. This transaction will reshuffle the next index to mint. Everyone can run it.
- `elven-tools nft-minter mint` - the main mint function, you can mint NFTs using any `walletKey.pem` file
- `elven-tools nft-minter get-total-tokens-left` - the Smart Contract query, returns amount of tokens left
- `elven-tools nft-minter get-provenance-hash` - the Smart Contract query returns the provenance hash if provided when deploying
- `elven-tools nft-minter get-drop-tokens-left` - the Smart Contract query returns the number of tokens left per drop
- `elven-tools nft-minter get-nft-price` - the Smart Contract query, returns the current price
- `elven-tools nft-minter get-nft-token-id` - the Smart Contract query, returns the collection token id
- `elven-tools nft-minter get-nft-token-name` - the Smart Contract query, returns the collection token name
- `elven-tools nft-minter get-tokens-limit-per-address` - the Smart Contract query returns the tokens limit per address
- `elven-tools nft-minter get-tokens-minted-per-address` - the Smart Contract query returns the number of tokens minted per one address

### Custom configuration options

Below is an example of a `.elventoolsrc` config file with default values. It is not required if you will work on the devnet with the main branch of the Smart Contract. In other cases, you would need to have it. It should be located in the same directory from which the `elven-tools` commands are triggered—the same directory as the one where the `walletKey.pem` file is located.

```json
{
  "chain": "devnet",
  "customProxyGateway": "https://devnet-gateway.elrond.com",
  "nftMinter": {
    "version": "main",
    "deployGasLimit": 120000000,
    "issueCollectionTokenGasLimit": 80000000,
    "issueValue": "0.05",
    "assignRolesGasLimit": 80000000,
    "issueTokenFnName": "issueToken",
    "setLocalRolesFnName": "setLocalRoles",
    "mintBaseGasLimit": 11000000,
    "tokenSelingPrice": "",
    "mintFnName": "mint",
    "giveawayBaseGasLimit": 11000000,
    "giveawayFnName": "giveaway",
    "setDropFnName": "setDrop",
    "setUnsetDropGasLimit": 12000000,
    "unsetDropFnName": "unsetDrop",
    "pauseUnpauseGasLimit": 5000000,
    "pauseMintingFnName": "pauseMinting",
    "unpauseMintingFnName": "startMinting",
    "setNewPriceGasLimit": 5000000,
    "setNewPriceFnName": "setNewPrice",
    "shuffleFnName": "shuffle",
    "shuffleGasLimit": 6000000,
    "getTotalTokensLeftFnName": "getTotalTokensLeft",
    "getProvenanceHashFnName": "getProvenanceHash",
    "getDropTokensLeftFnName": "getDropTokensLeft",
    "getNftPriceFnName": "getNftPrice",
    "getNftTokenIdFnName": "getNftTokenId",
    "getNftTokenNameFnName": "getNftTokenName",
    "getMintedPerAddressTotalFnName": "getMintedPerAddressTotal",
    "getTokensLimitPerAddressTotalFnName": "getTokensLimitPerAddressTotal",
    "getMintedPerAddressPerDropFnName": "getMintedPerAddressPerDrop",
    "getTokensLimitPerAddressPerDropFnName": "getTokensLimitPerAddressPerDrop",
    "changeBaseCidsFnName": "changeBaseCids",
    "changeBaseCidsGasLimit": 5000000,
    "setNewTokensLimitPerAddressFnName": "setNewTokensLimitPerAddress",
    "setNewTokensLimitPerAddressGasLimit": 5000000,
    "claimScFundsFnName": "claimScFunds",
    "claimScFundsGasLimit": 6000000,
    "populateIndexesBaseGasLimit": 5000000,
    "populateIndexesMaxBatchSize": 5000,
    "populateIndexesFnName": "populateIndexes"
  }
}
```

**Whole config with default values:** [config.ts](https://github.com/juliancwirko/elven-tools-cli/blob/main/src/config.ts)

### Limitations and caveats

- there are main limitations related to the Smart Contract. Remember that it is most likely that this CLI tool won't be used only in a way that everyone would want to, be aware that you can always change the names of the endpoints in the Smart Contract. Then you can also use the config file and change them here in the CLI
- Smart Contract in version 1 doesn't have many mechanisms which will strongly limit unwanted behaviors. It only implements random minting, but in version 2, there will be more mechanisms for fair launches.

### TODO
- check the [issues](https://github.com/juliancwirko/elven-tools-cli/issues)

### Contact

- [Telegram](https://t.me/juliancwirko)
- [Twitter](https://twitter.com/JulianCwirko)

### Issues and ideas

Please post issues and ideas [here](https://github.com/juliancwirko/elven-tools-cli/issues).

### License

MIT + GPLv3 (Elrond tooling)
