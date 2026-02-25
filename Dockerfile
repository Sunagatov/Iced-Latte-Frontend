FROM node:20.16.0-alpine3.20
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_URL=https://iced-latte.uk/backend/api/v1
WORKDIR /usr/app
COPY --chown=node ./package*.json ./
RUN npm install --global pm2
RUN npm ci --omit=dev
COPY --chown=node ./ ./
RUN npm run build
EXPOSE 3000
USER node
CMD [ "pm2-runtime", "start", "npm", "--", "run", "start" ]
