FROM node:20.16.0-alpine3.20
ARG NEXT_PUBLIC_API_URL=https://iced-latte.uk/backend/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
WORKDIR /usr/app
COPY --chown=node ./package*.json ./
RUN npm install --global pm2 && npm ci
COPY --chown=node ./ ./
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV production
EXPOSE 3000
USER node
CMD [ "pm2-runtime", "start", "npm", "--", "run", "start" ]
