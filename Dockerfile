FROM node:20-alpine
RUN npm install -g npm@10
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm ci --omit=dev
COPY app/ .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
