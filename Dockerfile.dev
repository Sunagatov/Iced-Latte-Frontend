FROM node:alpine
ENV NEXT_PUBLIC_API_HOST_REMOTE=https://dev.api.it-sl.ru/api/v1
WORKDIR /usr/app
COPY ./package*.json ./
RUN chown -R node /usr/app
RUN npm install --global pm2
USER node
RUN npm install --development
COPY ./ ./
RUN npm run build
EXPOSE 3000

CMD [ "pm2-runtime", "start", "npm", "--", "run", "dev" ]
