# Blockchain-based crowdfunding platform
Live demo at: http://akiz.ga:3000
## System architecture

## Install
### Environment require
- Solidity v0.5.x (solc-js)
- Node v8.10.0
- Yarn v1.17.3
- Redis database
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
#### 2. Install front-end side
Front-end will help user interaction with blockchain easier.

First, you have to move into **client** folder and type following commands:

```bash
yarn
```

To install some above packages, you need some package as c++, cmake, git. If you using Linux (Ubuntu 18 x64), you can cmd before run above cmd:

 ```bash
sudo apt install build-essential git -y
```

To run correctly, you need edit some environment variables in file **.env** (in *client* folder):
- ``REACT_APP_SVR_POST`` is uri for upload data of campaign. Default: ``http://[IP|DOMAIN]:PORT/api/set``
- ``REACT_APP_SVR_GET`` is uri for get data of campaign. Default: ``http://[IP|DOMAIN]:PORT/api/get/REF_CAMPAIGN``
- ``REACT_APP_DEFAULT_NETWORK`` is api for connect to node on blockchain to fetch data in Homepage.Default, we set to *https://ropsten.infura.io/v3/PROJECT_ID*
- ``REACT_APP_DEFAULT_ACCOUNT`` is address of your account for fetch data from blockchain.
- ``REACT_APP_RECAPTCHA_SITEKEY`` is **site key** in captcha module. We use **Google ReCaptcha**, to use this components, you have to register an account and add your site, then get your key.

After config correct variables, you can start web app client with command:

```bash
yarn start
```

Above command will start a port is **3000** (if port 3000 already used, will start with 3002, 3004..). This is development environment.

If you want to create production, you can use command:

```bash
yarn build
```

Production will help site loading faster.

#### 3. Install DB server
In this project, we use a DB server to store some data as campaign description, campaign name,...

First of all, you have to install **Redis**, you can read article about install Redis on Ubuntu at https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04

To server correctly, you need edit file ``.env`` to change some env:
- ``PORT_LISTEN`` is port that you will start server to listen requests. I set default with **8080**
- ``RECAPTCHA_SECRET_KEY`` as i have told in previous section, we use Google recaptcha, you have to have an account and get a secret key for use this component.

Continue, you need move into folder ``server/campaign-info/``. After that, you type following command to install some packages (require nodejs and yarn):

```bash
yarn
```

Then, you can command to start server:

```bash
node server.js
```

A port will be started with 8080 (default, you can set different port).

Finally, you need config with client site to run correctly.

#### 4. Run client and server site as services (optional)
If you run client and server site in background (not exit when you logout session), you can read tuts in file ``client/setup_as_service.md``

## How to use?
To use this dApp, use must have an extension called `Metamask`, this is web browser extension, you can install it on Firefox, Chrome, Opera, Vivaldi,...

After, you access to http://IP_SERVER:3000

