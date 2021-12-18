### Elven Tools CLI (v0.1.0)

It is a very early version of elven-tools, a CLI especially designed to be useful when interacting with custom NFT related Smart Contracts on the Elrond blockchain. For example: [elven-nft-minter-sc](https://github.com/juliancwirko/elven-nft-minter-sc).

**It will change over time because Smart Contracts will also change. So be aware of that.**

### How to use it?

1. `npm install elven-tools -g` or `yarn add elven-tools -g`
2. `elven-tools <command>`

### Commands

1. `elven tools derivePem` - derives the PEM file from your mnemonic (seed phrase)
2. `elven-tools deploy` - deploys the contract - uses a config file, PEM file, and WASM file with sc code
3. `elven-tools issueTokenAndSetRoles` - issues the ESDT token for your NFT collection and adds required roles - uses config file and PEM file
4. TBA
5. TBA
6. TBA

### Config file

TODO

### Dev tools

- `npm run dev:prettier`
- `npm run dev:lint`

### Contact

- [Twitter](https://twitter.com/JulianCwirko)
