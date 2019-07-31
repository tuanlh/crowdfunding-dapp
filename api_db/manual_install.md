# This is server backend to store some data as campaign name, description
# Requirement
- Node: v8.x
- Yarn: v1.3.0
# How to setup
In this project, we use a DB server to store some data as campaign description, campaign name,...

First of all, you have to install **Redis**, you can read article about install Redis on Ubuntu at https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04

To run server correctly, you need edit file ``.env`` to change some env:
- ``PORT_LISTEN`` is port that you will start server to listen requests. I set default with **8080**
- ``RECAPTCHA_ENABLE`` include value **1** (use captcha) or **0** (NOT use captcha). We set default to **0**
- ``RECAPTCHA_SECRET_KEY`` if you set RECAPTCHA_ENABLE is 1, you have to have an account and get a secret key for use this component. If set to 0, you can skip this step.
- ``REDIS_HOST``, ``REDIS_PORT``, ``REDIS_PASSWORD`` is information to connect to Redis server

After that, you type following command to install some packages (require nodejs and yarn):

```bash
yarn
```

Then, you can command to start server:

```bash
node index.js
```

A port will be started with 8080 (default, you can set different port).

Finally, you need config with client site to run correctly.

