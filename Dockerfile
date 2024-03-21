FROM node:20-alpine

WORKDIR /app

COPY package.json /app

COPY prisma /app/prisma/

RUN npx prisma generate

RUN npm install --omit-dev && npm cache clean --force

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]