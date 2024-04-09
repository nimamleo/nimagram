FROM node:18-alpine
RUN mkdir -p /backend
WORKDIR /backend

COPY . .

RUN npm install
RUN npm run build

EXPOSE ${HTTP_PORT}
EXPOSE ${SOCKET_PORT}

CMD ["npm", "run", "start:prod"]
