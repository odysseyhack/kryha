FROM node:11.14.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

CMD [ "npm", "start" ]