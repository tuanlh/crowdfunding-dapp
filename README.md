# Blockchain-based crowdfunding platform
Live demo at: http://zoka.me:3000
## Install
### Environment require
- Solidity v0.5.x (solc-js)
- Node v8.10.0 & npm v3.5.2
### Install packages
#### 1. Install Truffle framework

``` npm i -g truffle ```

(may be require root privileges)

If you meet some errors with permission when install a global package with npm, you can run this cmd instead above cmd:

``` sudo npm install -g truffle --unsafe-perm ```

#### 2. Cd into repository dir, then cmd:
```
npm i
cd client && npm i
```   
To install some above packages, you need some package as c++, cmake, git. If you using Linux (Ubuntu 18 x64), you can cmd before run above cmd:

``` sudo apt install build-essential git -y ```

#### 3. Install ganache-cli (if you want use local testnet, otherwise you can skip this step):

``` npm i -g ganache-cli ```

(may be require root privileges)

### Build and deploy contract to network
In repository dir:

``` truffle compile ```

(may be require root privileges)

Start ganache-cli (if use local testnet):

``` ganache-cli ```

Above command will start ganache-cli with default host is **127.0.0.1** at port **8545**

Then migrate contracts to network:

``` truffle migrate --network development ```

(may be require root privileges)


Default, migrate will use development network in **truffle-config.js** (you can change network in this)

You can choose other testnet as **Ropsten**, **Rinkeby**, **Kovan**.

If you choose other testnet, you must change **API Infura key** and **MNENOMIC** in file `.env`

### Start front-end
Front-end, we use Reactjs.

Cd into `client` directory, then cmd:

``` npm start ```

Above command will start a server at port 3000 (if port 3000 already used, will start with 3002,..)

## How to use?
To use this dApp, use must have an extension called `Metamask`, this is web browser extension, you can install it on Firefox, Chrome, Opera, Vivaldi,...

After, you access to http://IP_SERVER:3000

