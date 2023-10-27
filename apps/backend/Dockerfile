FROM node:alpine as development

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

COPY --from=development /usr/src/app/migrations ./migrations
COPY --from=development /usr/src/app/dist ./dist

CMD ["/bin/sh", "-c", "npx node-pg-migrate up && node dist/index.js"]