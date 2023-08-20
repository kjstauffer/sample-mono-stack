FROM node:18.17-alpine as base

FROM base as build

WORKDIR /app

# Selectivly COPY just files we need to build the yarn packages.
# This takes advantage of cached Docker layers.
COPY package.json yarn.lock .yarnrc.yml /app/
COPY .yarn /app/.yarn
# COPY packages/client/frontend/package.json /app/packages/client/frontend/package.json
COPY packages/server/frontend/prisma /app/packages/server/frontend/prisma
COPY packages/server/frontend/.env /app/packages/server/frontend/.env
COPY packages/server/frontend/package.json /app/packages/server/frontend/package.json

# Install all packages into `node_modules` (do not overwrite yarn.lock)
RUN yarn --immutable

# After `node_modules` is populated, run the prisma generator to generate the Prisma Client
WORKDIR /app/packages/server/frontend
RUN yarn prisma generate

# Change back to base working directory
WORKDIR /app

##
# Build the dev image on top of the `build` stage.
##
FROM build as dev

# Copy over the additional files needed in development.
# Note: Some directories, like `config` and `packages`, are bind mounted in the docker-compose
#       file so that changes can be picked up while the docker containers are running. Those
#       should not be included here.
COPY babel.config.cjs .
COPY tsconfig.json .

##
# Build the test image on top of the `build` stage.
##
FROM build as test

# For testing, copy everything since it all runs within the container.
COPY . /app
