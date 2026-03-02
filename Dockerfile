# =============================================================================
# 📦 BUILD STAGE — install dependencies and compile the Next.js app
# =============================================================================
FROM node:20.16.0-alpine3.20 AS build

# 🔧 Build argument — override at build time to point at a different backend
ARG NEXT_PUBLIC_API_URL=https://iced-latte.uk/backend/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /usr/app

# --- Dependency Layer (cached when package.json unchanged) ---
COPY --chown=node package*.json ./
RUN npm ci

# --- Source Code Layer ---
COPY --chown=node ./ ./

# --- Build Application & prune dev dependencies ---
RUN npm run build && npm prune --omit=dev

# =============================================================================
# 🚀 RUNTIME STAGE — lean image with only what's needed to run
# =============================================================================
FROM node:20.16.0-alpine3.20

# Metadata
LABEL maintainer="Iced-Latte Team" \
      description="Iced-Latte Frontend Application"

WORKDIR /usr/app

# --- Install PM2 process manager ---
RUN npm install --global pm2

# --- Copy built artefacts from build stage ---
COPY --chown=node --from=build /usr/app/.next ./.next
COPY --chown=node --from=build /usr/app/public ./public
COPY --chown=node --from=build /usr/app/node_modules ./node_modules
COPY --chown=node --from=build /usr/app/package.json ./package.json

# --- Runtime Configuration ---
ENV NODE_ENV=production
EXPOSE 3000

# --- Run as non-root for security ---
USER node

# --- Application Startup ---
CMD ["pm2-runtime", "start", "npm", "--", "run", "start"]
