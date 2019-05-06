FROM node:alpine
LABEL maintainer="Bjornskjald <github@bjorn.ml>"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run compile

CMD [ "npm", "start" ]
