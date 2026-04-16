# =============================================================================
# BUILD STAGE
# =============================================================================
FROM node:22.17.0-alpine3.22 AS build

ARG NEXT_PUBLIC_API_URL=https://iced-latte.uk/backend/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY public/ ./public/
COPY next.config.js tsconfig.json postcss.config.js next-env.d.ts ./
RUN npm run build

# =============================================================================
# RUNTIME STAGE
# =============================================================================
FROM node:22.17.0-alpine3.22

LABEL maintainer="Iced-Latte Team" \
      description="Iced-Latte Frontend Application"

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/.next/standalone ./

RUN mkdir -p /app/.next/cache \
 && chown -R node:node /app

EXPOSE 3000

USER node

ENTRYPOINT ["node", "server.js"]
