FROM node:8

COPY package.json package-lock.json ./

RUN npm install

ENV WS_PROVIDER=wss://kovan.infura.io/ws

COPY . ./

CMD [ "node", "index.js" ]
