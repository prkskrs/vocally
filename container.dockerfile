FROM node:14

WORKDIR /src

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

ENV PORT=8080
ENV MONGODB_CONNECTION_STRING=mongodb+srv://prkskrs:1JRRLP0TScJtklaB@cluster0.fncdhdb.mongodb.net/libraryDB?retryWrites=true&w=majority

EXPOSE 8080

CMD ["npm", "start"]
