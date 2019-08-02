FROM node:8-alpine

ENV DIR /home/node/api

# Create app directory
RUN mkdir ${DIR}

# Install dependencies
WORKDIR ${DIR}
COPY yarn.lock package.json ${DIR}/
RUN yarn

# Bundle source code
COPY . ${DIR}/

EXPOSE 8080

CMD yarn start
