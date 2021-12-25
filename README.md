### Elven Tools CLI (v0.1.0) (WIP)

It is a very early version of elven-tools, a CLI especially designed to be useful when interacting with custom NFT related Smart Contracts on the Elrond blockchain. For now it is designed to deploy this contract: [elven-nft-minter-sc](https://github.com/juliancwirko/elven-nft-minter-sc).

**It will change over time because Smart Contract will also change. So be aware of that.**

### What it can do now.

The elven-tools CLI will simplify a couple of operations:
- deploying the custom smart contract
- issuing collection token
- adding necessary roles
- TBA

The smart contract on which it operates is in a very early stage. It isn't suited for proper NFT launches. But this will change, and then elven-tools CLI will get more functionality. For now, you can deploy and prepare this simple, smart contract. Then you can use tools like [nft-art-maker](https://github.com/juliancwirko/nft-art-maker) and [elven-mint](https://github.com/juliancwirko/elven-mint) to play around. Watch the repo to be up to date. What connects all three libraries is that they are prepared to use the smart contract linked above.

### What it will do in the future

The plan is to have the tool which will simplify the NFT launches. It should be usable for people with very little technical knowledge and who want to do everything in their local environment. The tool searches for the smart contract in the GitHub repository, but the code is open-source, so everyone can fork the smart contract and alter its code if needed, then the elven-tools cli can deploy it from the local file system.

The tool will allow passing base CID and all required data when deploying the contract. Then there will be an option to use it for interaction with the smart contract. 

Smart contract itself will get a lot more improvements like mint when buying, so lazy mint without minting all at once. Shuffling on contract to avoid sniping the rarest nfts. There are a couple of useful functions like start, stop selling, time boxes for it, etc. Let me know your ideas, and if you can help with that, it would be awesome.

### How to use it?

1. `npm install elven-tools -g` or `yarn add elven-tools -g`
2. `elven-tools <command>`

### Commands

1. `elven tools derive-pem` - derives the PEM file from your mnemonic (seed phrase)
2. `elven-tools deploy nft-minter` - deploys the nft minter contract - uses a config file, PEM file, and WASM file with sc code (or it will download the wasm from the repo)
3. `elven-tools nft-minter issue-collection-token` - issues the ESDT token for your NFT collection 
4. `elven-tools nft-minter set-roles` - adds required roles - uses config file and PEM file
4. TBA

### Config file

The config is optional. Because there are predefined values already, they will change after changes in the linked above smart contract.

Below is the config structure with example values which are the defaults.

```
{
  "chain": "devnet",
  "nftMinterSc": {
    "version": "main",
    "deployNftMinterSC": "",
    "deployGasLimit": 80000000,
    "issueCollectionTokenGasLimit": 60000000,
    "issueCollectionTokenValue": 0.05,
    "assignRolesGasLimit": 60000000,
    "issueTokenFnName": "issueToken",
    "setLocalRolesFnName": "setLocalRoles",
    "getNftTokenIdFnName": "getNftTokenId"
  }
}
```

You can use the config file in the same place where you will run the `elven-tools`. Create `.elventoolsrc` file and paste the contents with the structure from above.

See the `config.ts` file for more info.

### Dev tools

- `npm run dev:prettier`
- `npm run dev:lint`

Please post an issue if you'll find any bugs.

### Contact

- [Twitter](https://twitter.com/JulianCwirko)
