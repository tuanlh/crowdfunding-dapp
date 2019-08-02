FROM node:8-alpine

ENV DIR /app

# Create app directory and set to working directory
WORKDIR ${DIR}

# Install dev dependencies
RUN apk add --no-cache git python make g++

# Install dependencies
COPY yarn.lock package.json ${DIR}/
RUN yarn

# Bundle source code
COPY . ${DIR}/

# Build and deploy contract to Ethereum network
RUN yarn truffle migrate --network ropsten