FROM node:latest
WORKDIR /usr/src/app
COPY ./WebContent/package*.json ./
RUN npm install
RUN npm install chai-as-promised capture-console axios@^1.6.8 chai@^4.3.4 chai-http@^4.3.0 mocha@^9.1.3 sinon@^17.0.1 nock@^13.5.4 --save-dev
RUN npm install mysql2@latest ejs body-parser express node-fetch dotenv bcryptjs express-session
COPY ./WebContent .
EXPOSE 3001
CMD ["npm", "start"]
