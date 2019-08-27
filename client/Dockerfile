# BUILDER IMAGE
FROM node:8-alpine AS builder

# Create app directory and set to working directory
WORKDIR /app

# Install dev dependencies
RUN apk add --no-cache python make g++

# Install dependencies
COPY yarn.lock package.json /app/
RUN yarn

# RUN TIME IMAGES
FROM node:8-alpine

EXPOSE 3000

# Create app directory and set to working directory
WORKDIR /app

# Copy from builder image
COPY --from=builder /app .

# Bundle source code
COPY . /app/

CMD yarn start
