# Manual install for dapp client
## Install
### Environment require
- Solidity v0.5.x (solc-js)
- Node v8.10.0
- Yarn v1.17.3
### Install components
#### 1. Compile and deploy smart contract
To compile smart contract, you need to have install Truffle framework, to install component neccessary, you cd to root directory of project, you type:

```bash
yarn
```

After install dependencies, you can compile contracts with command:

```bash
yarn truffle compile
```

Before deploy contract to network, you have to change some environment variable in file **.env** (in root project folder):
- ``MNENOMIC`` is mnenomic of your account to deploy contract and sign transaction.
- ``INFURA_API_KEY`` is api key on infura.io, you can register an account and get infura key. Why need infura? --> In this project, i choose infura to sync states on blockchain.

Then, you can deploy contracts into network:

```bash
yarn truffle migrate --network ropsten
```

You can change ``ropsten`` to other network as ``development``, ``mainnet``, ``rinkerby``, etc.
