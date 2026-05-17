# =============================================================================
# BUILD STAGE
# =============================================================================
FROM node:22.17.0-alpine3.22 AS build

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_IMAGE_REMOTE_SOURCES
# Keep local Docker builds disabled unless prod release tooling passes true.
ARG NEXT_PUBLIC_STRIPE_ENABLED=false
ARG NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false
ARG NEXT_PUBLIC_AI_ENABLED=false
ARG NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED=false
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_IMAGE_REMOTE_SOURCES=$NEXT_IMAGE_REMOTE_SOURCES
ENV NEXT_PUBLIC_STRIPE_ENABLED=$NEXT_PUBLIC_STRIPE_ENABLED
ENV NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=$NEXT_PUBLIC_GOOGLE_AUTH_ENABLED
ENV NEXT_PUBLIC_AI_ENABLED=$NEXT_PUBLIC_AI_ENABLED
ENV NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED=$NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED

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
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/.next/standalone ./

RUN mkdir -p /app/.next/cache \
 && chown -R node:node /app

USER node

ENTRYPOINT ["node", "server.js"]
