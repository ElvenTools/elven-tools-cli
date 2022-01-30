### [1.2.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.2.0) (2022-01-28)
- adjustments for SC v 1.1.0
- setDrop function changes and additional queries
- renamed or added new queries/commands
  - `getMintedPerAddressTotal` endpoint | command `get-minted-per-address-total`,
  - `getTokensLimitPerAddressTotal` endpoint | command `get-tokens-limit-per-address-total`,
  - `getMintedPerAddressPerDrop` endpoint | command `get-minted-per-address-per-drop`,
  - `getTokensLimitPerAddressPerDrop` endpoint | command `get-tokens-limit-per-address-per-drop`
- small changes in the default gas limits for mint and giveaway

### [1.1.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.1.0) (2022-01-24)
- added possibility to set codeMetadata (upgradable, readable, payable) when deploying the SC
- bring back the `claim-sc-funds` command - works as a workaround for royalties unless `esdt_nft_create_as_caller` will work properly 

### [1.0.0](https://github.com/juliancwirko/elven-tools-cli/releases/tag/v1.0.0) (2022-01-24)
- first proper version of the tool
