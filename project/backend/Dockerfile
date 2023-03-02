FROM 		node:alpine

WORKDIR 	/usr/src/app

COPY 		package.json ./
COPY 		tsconfig*.json ./
COPY 		nest-cli.json ./

RUN 		npm install

RUN 		npm run build
