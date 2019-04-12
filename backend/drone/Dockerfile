FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache --virtual build-dependencies add \
  git \
  python \
  make \
  g++ \
  && npm i \
  && apk del build-dependencies


COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"] 