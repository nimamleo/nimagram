FROM node:18-alpine
RUN mkdir -p /backend
WORKDIR /backend

COPY . .

RUN ls

RUN npm install
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start:prod"]