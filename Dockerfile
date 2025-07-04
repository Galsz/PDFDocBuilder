FROM browserless/chrome:1.61-puppeteer-21.3.8

WORKDIR /app

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8095

CMD ["npm", "start"]
