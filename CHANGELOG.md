### [1.5.1](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.5.0) (2022-02-25)
- bump Smart Contract version, check out [SC v1.5.1](https://github.com/juliancwirko/elven-nft-minter-sc/releases/tag/v1.5.1) for more details. Fixes in how the unsetDrop logic clears previous drop.
- added new command: `is-drop-active`

### [1.5.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.5.0) (2022-02-25)
- bump Smart Contract version, check out [SC v1.5.0](https://github.com/juliancwirko/elven-nft-minter-sc/releases/tag/v1.5.0) for more details. Important performance fixes.

### [1.4.2](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.4.2) (2022-02-17)
- bump Smart Contract version. See more in [SC repo changelog](https://github.com/juliancwirko/elven-nft-minter-sc/blob/main/CHANGELOG.md).

### [1.4.1](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.4.1) (2022-02-14)
- fix populate indexes after changes in the Elrond's architecture, check out: [#34](https://github.com/juliancwirko/elven-nft-minter-sc/issues/34) for more details. It results in more transactions that have to be done. But for now, it is necessary.

### [1.4.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.4.0) (2022-02-13)
- added `allowlist` support, check out the docs at www.elven.tools especially [possible workflows](http://www.elven.tools/docs/elven-tools-workflows.html)
- Switch to public and official API endpoints instead of gateway ones for three reasons. The first one is because the gateway is lately overloaded, and the second one is that they will probably be merged soon. There were also problems fetching the smart contract results with the gateway, which will be required for future improvements.

### [1.3.3](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.3.3) (2022-02-09)
- bump Smart Contract version after fixes
- changes in the default gas limits for setting 'drops'
- removed the limit of 55 tokens per address when deploying, but the mint, giveaway commands will now have max 55 limit per **one** transaction. You can always make more transactions. This will be also improved in the future to be more automatic.

### [1.3.2](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.3.2) (2022-02-08)
- fix gas limit calculation for the `giveaway` endpoint
- temporary removed misleading message when issuing the collection token, retrieving the token ticker stopped working after update to erdjs v9 - needs more debugging

### [1.3.1](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.3.1) (2022-02-06)
- bump Smart Contract version usage
- there was a change in the `mint` endpoint arguments. The amount of tokens is now mandatory. But it doesn't change anything for the CLI. It was always mandatory here.
- fix the logic for public endpoints setup

### [1.3.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.3.0) (2022-02-04)
- Metadata JSON file can be now attached also in the Assets/Uris section (some marketplaces require that),
- There will be no `ipfs://` schema-based Uri from the Assets/Uris. It is because there are usually gateway Uris only. It is still possible to add the ipfs schema-based Uri to the metadata JSON file. (Smart Contract only change)

### [1.2.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.2.0) (2022-01-31)
- adjustments for SC v 1.1.0
- setDrop function changes and additional queries
- renamed or added new queries/commands
  - `getMintedPerAddressTotal` endpoint | command `get-minted-per-address-total`,
  - `getTokensLimitPerAddressTotal` endpoint | command `get-tokens-limit-per-address-total`,
  - `getMintedPerAddressPerDrop` endpoint | command `get-minted-per-address-per-drop`,
  - `getTokensLimitPerAddressPerDrop` endpoint | command `get-tokens-limit-per-address-per-drop`
- small changes in the default gas limits for mint and giveaway
- new function `populateIndexes` with command `populate-indexes` - use only as fallback if something goes wrong with the deployment. The populateIndexes endpoint will be called by default when deploying.

### [1.1.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.1.0) (2022-01-24)
- added possibility to set codeMetadata (upgradable, readable, payable) when deploying the SC
- bring back the `claim-sc-funds` command - works as a workaround for royalties unless `esdt_nft_create_as_caller` will work properly 

### [1.0.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.0.0) (2022-01-24)
- first proper version of the tool
