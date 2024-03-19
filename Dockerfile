FROM node:20-alpine as build_app

WORKDIR /app

COPY package.json /app

COPY prisma /app/prisma/

RUN npm install --production && npm cache clean --force

COPY . .


FROM node:20-alpine as build_db

WORKDIR /app
COPY --from=build_app /app /app

EXPOSE 4000:4000

CMD ["npm", "run", "start" ]