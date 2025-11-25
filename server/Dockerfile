FROM node:18-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base as dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base as prod
RUN npm install pm2 -g
EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
