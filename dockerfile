FROM node:18-alpine
RUN mkdir -p /backend
WORKDIR /backend

COPY ./package.json /backend
COPY ./package-lock.json /backend

RUN npm install

COPY ./ /backed

RUN ls
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start:prod"]