# BUILDER IMAGE
FROM node:8-alpine AS builder

# Create app directory and set to working directory
WORKDIR /app

# Install dev dependencies
RUN apk add --no-cache git python make g++

# Install dependencies
COPY yarn.lock package.json /app/
RUN yarn

# RUN TIME IMAGES
FROM node:8-alpine

# Create app directory and set to working directory
WORKDIR /app

# Copy from builder image
COPY --from=builder /app .

# Bundle source code
COPY . /app/

# Build and deploy contract to Ethereum network
#RUN yarn truffle migrate --network ropsten

# Run this command
# docker build -t test_smartcontract -f test.Dockerfile
# docker run -it -v $(PWD):/app/ test_smartcontract /bin/sh
# yarn truffle development
# truffle migrate
# truffle test