###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine AS build

WORKDIR /usr/app

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json

RUN npm install --immutable --immutable-cache --check-cache

COPY --chown=node:node . .

RUN npm run build

###################
# PRODUCTION
###################

FROM node:20-alpine AS production

WORKDIR /usr/app

COPY --chown=node:node --from=build /usr/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/dist ./dist

ENTRYPOINT node dist/main.js