FROM node:lts-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /src/app
COPY package.json package-lock.json ./
RUN corepack enable npm && npm ci

# Stage 2: Build the application
FROM base AS builder
WORKDIR /src/app
COPY --from=deps /src/app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=CSRF_SECRET,target=/run/secrets/CSRF_SECRET \
  --mount=type=secret,id=FIREBASE_SERVICE_ACCOUNT,target=/run/secrets/FIREBASE_SERVICE_ACCOUNT \
  --mount=type=secret,id=FIREBASE_WEB_CONFIG,target=/run/secrets/FIREBASE_WEB_CONFIG \
  set -eu && \
  export CSRF_SECRET="$(cat /run/secrets/CSRF_SECRET)" && \
  export FIREBASE_SERVICE_ACCOUNT="$(cat /run/secrets/FIREBASE_SERVICE_ACCOUNT)" && \
  node ./scripts/export-firebase-web-config.mjs /run/secrets/FIREBASE_WEB_CONFIG > /tmp/firebase-web-config.env && \
  . /tmp/firebase-web-config.env && \
  corepack enable npm && npm run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /src/app
ENV NODE_ENV=production
COPY --from=builder /src/app/.next/standalone ./
COPY --from=builder /src/app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
