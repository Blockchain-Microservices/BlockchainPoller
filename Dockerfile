FROM node:18.12.1-alpine

RUN mkdir -p /app/Poller/node_modules \
    && chown -R node:node /app

WORKDIR /app/Poller

COPY package*.json ./
COPY tsconfig.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]

