FROM node:alpine
ENV NODE_ENV production
ENV NEXT_PUBLIC_API_HOST_REMOTE=https://iced-latte.uk/backend/api/v1
WORKDIR /usr/app
COPY --chown=node ./package*.json ./
RUN npm install --global pm2
USER node
RUN npm ci --only=production
COPY --chown=node ./ ./
RUN npm run build
EXPOSE 3000
CMD [ "pm2-runtime", "start", "npm", "--", "run", "start" ]
