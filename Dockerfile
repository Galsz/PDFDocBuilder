FROM node:20

RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends && \
    apt clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8095

CMD ["npm", "start"]
