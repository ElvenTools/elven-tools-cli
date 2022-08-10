### [1.14.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.14.1) (2022-08-10)
- make it possible to use the decimals for the royalties

### [1.14.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.14.0) (2022-08-06)
- added 'payable by smart contracts' option when deploying - from now, the 'payable' option is disabled by default, and 'payable by smart contracts' is enabled by default
- increased the default mint gas limit because of problems when the drop is enabled
- bump dapp version
- dependencies updates
- MIT license

### [1.13.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.13.1) (2022-07-30)
- bump smart contract verion

### [1.13.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.13.0) (2022-07-30)
- added more file formats when deploying ([supported](https://docs.elrond.com/developers/nft-tokens/#supported-media-types) by Elrond services)
- bump dependencies

### [1.12.3](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.12.3) (2022-07-21)
- added more data checks in case of wrong input file format

### [1.12.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.12.2) (2022-07-20)
- added rate limiting calls for `elven-tools distribute-to-owners` to make it more reliable. There are five calls per second by default. You can change this using the configuration file. Check the docs for more info.
- fix misleading prompt examples in `elven-tools distribute-to-owners`

### [1.12.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.12.1) (2022-07-19)
- added SFT distribution to `elven-tools distribute-to-owners`

### [1.12.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.12.0) (2022-07-17)
- added new functionality. Now you can distribute EGLD, ESDT, and Meta-ESDT to owners of NFTs from a particular collection. It can be any collection, not only yours. More in the docs
- the first version assumes that chosen token is on the wallet and you have enough amount of it
- you will get the distribution-log.json file in the end with all transactions hashes, receiver address, and status of the transaction (success, fail)

### [1.11.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.11.1) (2022-07-17)
- bump dapp version, new major version of the dapp, check its changelog [here](https://github.com/ElvenTools/elven-tools-dapp/blob/main/CHANGELOG.md)
- update erdjs

### [1.11.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.11.0) (2022-06-18)
- changes in the configuration structure
- proper names for network providers
- when you use the gateway instead of API, you would need to provide the `gatewayProviderEndpoint`. You can also provide a custom API endpoint by `apiProviderEndpoint.`
- by default, the CLI will still use the public API (api.elrond.com, devnet-api.elrond.com, testnet-api.elrond.com)

### [1.10.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.10.0) (2022-06-18)
- adjustments in the CLI regarding SC updates, there is no more initial `shuffle` required, and `populateIndexes` was removed at all
- you can still use the the `shuffle` endpoint - it still does the same

### [1.9.6](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.6) (2022-06-17)
- bump dapp version - Web Wallet tx signing fix there

### [1.9.5](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.5) (2022-06-09)
- bump dapp version - Ledger support added!

### [1.9.4](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.4) (2022-05-27)
- bump dapp version, where `useScQuery` was improved

### [1.9.3](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.3) (2022-05-25)
- `collection-nft-owners` changes, cleanup for the output files. From now there will be only one output file with unique addresses. Each address will have info about the number of tokens, tickers, and metadata file names. The output file structure is a standard JSON format that can be transformed further.

### [1.9.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.2) (2022-05-24)
- fix the order of reading the smart contract address and 'selling price'. First the config file, then the `output.json`. The logic for that will be unified soon. There will be no `output.json` file anymore.

### [1.9.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.1) (2022-05-18)
- bump smart contract version, elrond-wasm framework update

### [1.9.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.9.0) (2022-05-16)
- update to the erdjs SDK v10
- the functionality doesn't change
- please report issues if any

### [1.8.5](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.8.5) (2022-05-08)
- improvements for `collection-nft-owners` - now, you can also aggregate and count NFTs per address. It will create another JSON file. It is like that because the list of addresses will also be helpful for future operations. The option will make sense only when you don't select the unique addresses option. Otherwise, the option will not be available.

### [1.8.4](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.8.4) (2022-05-05)
- bump dapp version, which was migrated to erdjs 10

### [1.8.3](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.8.3) (2022-05-02)
- new commands for new endpoints
  - `elven-tools nft-minter get-total-supply` for endpoint `getTotalSupply`
  - `elven-tools nft-minter is-minting-paused` for endpoint `isMintingPaused`
  - `elven-tools nft-minter get-total-supply-of-current-drop` for endpoint `getTotalSupplyOfCurrentDrop`

### [1.8.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.8.2) (2022-04-30)
- new command `elven-tools nft-minter clear-allowlist` - It will clear the whole allowlist. The best is to keep max 1300 addresses in the allowlist at a time. Of course, if only you plan to clear it later. If you keep more and want to clear it, you can reach the gas limit for a transaction. So it would be best to split the allowlist per drop, keep it as small as possible and clear it each time.
- new command `elven-tools nft-minter remove-allowlist-address` - removes single address from the allowlist
- bugfix for `collection-nft-owners` - there was a problem with data checks

### [1.8.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.8.1) (2022-04-30)
- You can now initialize the Minter Dapp by running `elven-tools init-dapp`. It will download the NextJS-based app and install all npm dependencies. Then you can check the docs on how to start the app.

### [1.8.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.8.0) (2022-04-28)
- `allowlist.json` default location changed to the root directory. You will now need to place it in the same directory where you call the elven-tools commands. It will be the place for all similar files with data. The naming convention will always be predefined, maybe later, it will change if there are a lot of such files, but for now, it is ok

### [1.7.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.7.1) (2022-04-27)
- gas limits adjustments
- max tokens to mint per one transaction limit adjusted
- max addresses for allowlist limit adjusted

### [1.7.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.7.0) (2022-04-24)
- an additional option for `issue-collection-token` - now you can also set the name for NFTs, previously it was the same name as the collection token name
- better validation for `issue-collection-token` arguments
- changes in `get-nft-token-name` it will now display the NFTs name, not the collection token name
- new query: `get-collection-token-name` - it will display the collection token name

### [1.6.5](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.6.5) (2022-04-17)
- fixed regression for `collection-nft-owners` 

### [1.6.4](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.6.4) (2022-04-10)
- fixed metadata file name filter for `collection-nft-owners` 

### [1.6.3](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.6.3) (2022-04-10)
- new filter for `collection-nft-owners` you can now get owners filtered by metadata JSON file name saved in the attributes field. This is optional. If there is not provided at least one file name, the filter will be ignored.

### [1.6.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.6.2) (2022-03-31)
- minor updates after moving repositories, cleanup, and update for npm registry

### [1.6.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.6.1) (2022-03-28)
- fix for `collection-nft-owners` spinner when collection doesn't exist on chain or is empty

### [1.6.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.6.0) (2022-03-28)
- new functionality for getting the collection NFT owners' addresses, you can filter smart contract addresses, and also you can decide if you need unique addresses in a case when one address is an owner of a couple of NFTs from the collection
- this update doesn't affect the interaction with the Elven Tools smart contract in any way

### [1.5.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.5.2) (2022-03-05)
- bump Smart Contract version,  check out [SC v1.5.2](https://github.com/ElvenTools/elven-nft-minter-sc/releases/tag/v1.5.2) for more details. Upgrades for the elrond-wasm and cleanup.

### [1.5.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.5.1) (2022-02-25)
- bump Smart Contract version, check out [SC v1.5.1](https://github.com/ElvenTools/elven-nft-minter-sc/releases/tag/v1.5.1) for more details. Fixes in how the unsetDrop logic clears previous drop.
- added new command: `is-drop-active`

### [1.5.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.5.0) (2022-02-25)
- bump Smart Contract version, check out [SC v1.5.0](https://github.com/ElvenTools/elven-nft-minter-sc/releases/tag/v1.5.0) for more details. Important performance fixes.

### [1.4.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.4.2) (2022-02-17)
- bump Smart Contract version. See more in [SC repo changelog](https://github.com/ElvenTools/elven-nft-minter-sc/blob/main/CHANGELOG.md).

### [1.4.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.4.1) (2022-02-14)
- fix populate indexes after changes in the Elrond's architecture, check out: [#34](https://github.com/ElvenTools/elven-nft-minter-sc/issues/34) for more details. It results in more transactions that have to be done. But for now, it is necessary.

### [1.4.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.4.0) (2022-02-13)
- added `allowlist` support, check out the docs at www.elven.tools especially [possible workflows](http://www.elven.tools/docs/elven-tools-workflows.html)
- Switch to public and official API endpoints instead of gateway ones for three reasons. The first one is because the gateway is lately overloaded, and the second one is that they will probably be merged soon. There were also problems fetching the smart contract results with the gateway, which will be required for future improvements.

### [1.3.3](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.3.3) (2022-02-09)
- bump Smart Contract version after fixes
- changes in the default gas limits for setting 'drops'
- removed the limit of 55 tokens per address when deploying, but the mint, giveaway commands will now have max 55 limit per **one** transaction. You can always make more transactions. This will be also improved in the future to be more automatic.

### [1.3.2](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.3.2) (2022-02-08)
- fix gas limit calculation for the `giveaway` endpoint
- temporary removed misleading message when issuing the collection token, retrieving the token ticker stopped working after update to erdjs v9 - needs more debugging

### [1.3.1](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.3.1) (2022-02-06)
- bump Smart Contract version usage
- there was a change in the `mint` endpoint arguments. The amount of tokens is now mandatory. But it doesn't change anything for the CLI. It was always mandatory here.
- fix the logic for public endpoints setup

### [1.3.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.3.0) (2022-02-04)
- Metadata JSON file can be now attached also in the Assets/Uris section (some marketplaces require that),
- There will be no `ipfs://` schema-based Uri from the Assets/Uris. It is because there are usually gateway Uris only. It is still possible to add the ipfs schema-based Uri to the metadata JSON file. (Smart Contract only change)

### [1.2.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.2.0) (2022-01-31)
- adjustments for SC v 1.1.0
- setDrop function changes and additional queries
- renamed or added new queries/commands
  - `getMintedPerAddressTotal` endpoint | command `get-minted-per-address-total`,
  - `getTokensLimitPerAddressTotal` endpoint | command `get-tokens-limit-per-address-total`,
  - `getMintedPerAddressPerDrop` endpoint | command `get-minted-per-address-per-drop`,
  - `getTokensLimitPerAddressPerDrop` endpoint | command `get-tokens-limit-per-address-per-drop`
- small changes in the default gas limits for mint and giveaway
- new function `populateIndexes` with command `populate-indexes` - use only as fallback if something goes wrong with the deployment. The populateIndexes endpoint will be called by default when deploying.

### [1.1.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.1.0) (2022-01-24)
- added possibility to set codeMetadata (upgradable, readable, payable) when deploying the SC
- bring back the `claim-sc-funds` command - works as a workaround for royalties unless `esdt_nft_create_as_caller` will work properly 

### [1.0.0](https://github.com/ElvenTools/elven-tools-cli/releases/tag/v1.0.0) (2022-01-24)
- first proper version of the tool
