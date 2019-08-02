# Blockchain-based crowdfunding platform
Live demo at: http://akiz.ga:3000
## System architecture
System include services (with folders): 
- **client** (front-end): we use ReactJS.
- **smartcontracts**: stored smart contracts and compile+deploy to Ethereum.
- **store_centralized_data** (is API to store some centralized data as campaign name, descripton,...). We use Express/NodeJS and connect to Redis.
- **redis** is database that we have used.

## Build with Docker (Recommended)
We also provide ``Dockerfile`` in each folders (client, api_db, smartcontracts) to build image for install environment and run app.
### Requirement:
- Docker Engine
- Docker Compose
### 1. Edit some env variable to run correctly
First, in file ``smartcontracts/.env``:
- ``MNENOMIC`` is mnenomic of your account to deploy contract and sign transaction.
- ``INFURA_API_KEY`` is api key on infura.io, you can register an account and get infura key. Why need infura? --> In this project, i choose infura to sync states on blockchain.

And in file ``client/.env``:
- ``REACT_APP_STORE_CENTRALIZED_API`` is api url to post/get data from db. Format: ``http://[IP|DOMAIN]:PORT/``. Default set to ``http://localhost:8080/`` if empty.
- ``REACT_APP_DEFAULT_NETWORK`` is api for connect to node on blockchain to fetch data in Homepage.Default, we set to *https://ropsten.infura.io/v3/PROJECT_ID*
- ``REACT_APP_DEFAULT_ACCOUNT`` is address of your account for fetch data from blockchain.
- ``RECAPTCHA_ENABLE`` include value **1** (use captcha) or **0** (NOT use captcha). We set default to **0**
- ``REACT_APP_RECAPTCHA_SITEKEY`` is **site key** in captcha module. We use **Google ReCaptcha**, to use this components, you have to register an account and add your site, then get your key. If you set RECAPTCHA_ENABLE is **0**, you can skip this step. (Default we disable this module)

Finally, in ``api_db/.env``:
- ``PORT_LISTEN`` is port that you will start server to listen requests. I set default with **8080**
- ``RECAPTCHA_ENABLE`` include value **1** (use captcha) or **0** (NOT use captcha). We set default to **0**
- ``RECAPTCHA_SECRET_KEY`` if you set RECAPTCHA_ENABLE is 1, you have to have an account on Google Recaptcha and get a secret key for use this component. If set to 0, you can skip this step. Detail about ReCaptcha: https://www.google.com/recaptcha/intro/v3.html
- ``REDIS_HOST``, ``REDIS_PORT``, ``REDIS_PASSWORD`` is information to connect to Redis server. (Note: if you change redis password, you have to edit in file ``docker-compose.yml`` to run correctly). Default, we set password of redis server is ``12345678``

### 2. Build and run
In repository root folder, you can run cmd:

```bash
docker-compose up
```

After run above cmd, docker will build and run some images. It will start 3 container with 3 services:
- **client** with port 3000 (development port of ReactJS).
- **store_centralized_data** with port 8080.
- **redis** with port 6379.

## How to use?
To use this dApp, use must have an extension called `Metamask`, this is web browser extension, you can install it on Firefox, Chrome, Opera, Vivaldi,...

After, you access to http://IP_SERVER:3000
