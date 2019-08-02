FROM node:8-alpine

ENV DIR /home/node/client

# Create app directory
RUN mkdir ${DIR}

# Install dev dependencies
RUN apk add --no-cache python make g++

# Install dependencies
WORKDIR ${DIR}
COPY yarn.lock package.json ${DIR}/
RUN yarn

# Bundle source code
COPY . ${DIR}/

EXPOSE 3000

CMD yarn start
