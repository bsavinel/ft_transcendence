FROM      node:alpine

WORKDIR 	/usr/src/app

COPY 		  package*.json ./
COPY      tsconfig.json ./

RUN 		  npm install

EXPOSE    3000
