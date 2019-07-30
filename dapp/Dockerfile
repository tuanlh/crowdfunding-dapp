FROM node:8-alpine

ENV DIR /home/node/dapp

# Create app directory
RUN mkdir ${DIR} ${DIR}/client

# Install requirements
RUN apk add --no-cache git python make g++

# Install dependencies
WORKDIR ${DIR}
COPY yarn.lock package.json ${DIR}/
RUN yarn
COPY client/yarn.lock client/package.json ${DIR}/client/
RUN cd client && yarn

# Bundle source code
COPY . ${DIR}/

EXPOSE 3000

CMD yarn truffle migrate --network ropsten && cd client && yarn start
