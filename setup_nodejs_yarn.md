# This is tutorial for install nodejs and yarn on Ubuntu 18
Version:
- Nodejs 8.10
- Yarn 1.17.3
## 1. Setup NodeJS
In current, Nodejs is available on repository of Ubuntu, you can type following command:

```bash
sudo apt install nodejs
```

## 2. Setup Yarn
On Debian or Ubuntu Linux, you can install Yarn via our Debian package repository. You will first need to configure the repository:

```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```

Then you can simply:

```bash
sudo apt-get update && sudo apt-get install yarn
```

**Path Setup**

If Yarn is not found in your PATH, follow these steps to add it and allow it to be run from anywhere.

Note: your profile may be in your ``.profile``,      ``.bash_profile``, ``.bashrc``, ``.zshrc``, etc.

- Add this to your profile: ``export PATH="$PATH:/opt/yarn-[version]/bin"`` (the path may vary depending on where you extracted Yarn to)
- In the terminal, log in and log out for the changes to take effect

To have access to Yarn’s executables globally, you will need to set up the PATH environment variable in your terminal. To do this, add ``export PATH="$PATH:`yarn global bin`"`` to your profile.

Test that Yarn is installed by running:

```bash
yarn --version
```

You can detail at https://yarnpkg.com/lang/en/docs/install/#debian-stable