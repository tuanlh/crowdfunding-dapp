FROM node:8-alpine

EXPOSE 3000
ENV DIR /app

# Create app directory and set to working directory
WORKDIR ${DIR}

# Install dev dependencies
RUN apk add --no-cache python make g++

# Install dependencies
COPY yarn.lock package.json ${DIR}/
RUN yarn

# Bundle source code
COPY . ${DIR}/

CMD yarn start
