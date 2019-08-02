FROM node:8-alpine

ENV DIR /home/node/smartcontract

# Create app directory
RUN mkdir ${DIR}

# Install dev dependencies
RUN apk add --no-cache git python make g++

# Install dependencies
WORKDIR ${DIR}
COPY yarn.lock package.json ${DIR}/
RUN yarn

# Bundle source code
COPY . ${DIR}/

# Build and deploy contract to Ethereum network
RUN yarn truffle migrate --network ropsten