FROM node:8-alpine

EXPOSE 8080
ENV DIR /app

# Create app directory and set to working directory
WORKDIR ${DIR}

# Install dependencies
COPY yarn.lock package.json ${DIR}/
RUN yarn

# Bundle source code
COPY . ${DIR}/

CMD yarn start
