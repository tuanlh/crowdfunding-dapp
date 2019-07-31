# Manual install for dapp client
## Install
### Environment require
- Node v8.10.0
- Yarn v1.17.3
### Setup
Front-end will help user interaction with blockchain easier.

First, you have to install some packages, run (in this folder):

```bash
yarn
```

To install some above packages, you need some package as c++, cmake, git. If you using Linux (Ubuntu 18 x64), you can cmd before run above cmd:

 ```bash
sudo apt install python make g++ git -y
```

To run correctly, you need edit some environment variables in file **.env** (in *client* folder):
- ``REACT_APP_SVR_POST`` is uri for upload data of campaign. Default: ``http://[IP|DOMAIN]:PORT/api/set``
- ``REACT_APP_SVR_GET`` is uri for get data of campaign. Default: ``http://[IP|DOMAIN]:PORT/api/get/REF_CAMPAIGN``
- ``REACT_APP_DEFAULT_NETWORK`` is api for connect to node on blockchain to fetch data in Homepage.Default, we set to *https://ropsten.infura.io/v3/PROJECT_ID*
- ``REACT_APP_DEFAULT_ACCOUNT`` is address of your account for fetch data from blockchain.
- ``REACT_APP_RECAPTCHA_SITEKEY`` is **site key** in captcha module. We use **Google ReCaptcha**, to use this components, you have to register an account and add your site, then get your key.

### Run
#### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

