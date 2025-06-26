FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 8095

CMD ["node", "server.js"]
