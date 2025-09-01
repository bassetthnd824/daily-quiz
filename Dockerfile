FROM node:lts-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /src/app
COPY package.json package-lock.json ./
RUN corepack enable npm && npm ci

# Stage 2: Build the application
FROM base AS builder
WORKDIR /src/app
ARG CSRF_SECRET
ARG FIREBASE_SERVICE_ACCOUNT
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
COPY --from=deps /src/app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=CSRF_SECRET,target=/run/secrets/CSRF_SECRET \
  --mount=type=secret,id=FIREBASE_SERVICE_ACCOUNT,target=/run/secrets/FIREBASE_SERVICE_ACCOUNT_FILE \
  --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_API_KEY,target=/run/secrets/NEXT_PUBLIC_FIREBASE_API_KEY \
  --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,target=/run/secrets/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
  --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_PROJECT_ID,target=/run/secrets/NEXT_PUBLIC_FIREBASE_PROJECT_ID \
  --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,target=/run/secrets/NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
  --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,target=/run/secrets/NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
  --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_APP_ID,target=/run/secrets/NEXT_PUBLIC_FIREBASE_APP_ID \
  export CSRF_SECRET=$(cat /run/secrets/CSRF_SECRET) && \
  export FIREBASE_SERVICE_ACCOUNT=$(cat /run/secrets/FIREBASE_SERVICE_ACCOUNT_FILE) && \
  export NEXT_PUBLIC_FIREBASE_API_KEY=$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_API_KEY) && \
  export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) && \
  export NEXT_PUBLIC_FIREBASE_PROJECT_ID=$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_PROJECT_ID) && \
  export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) && \
  export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) && \
  export NEXT_PUBLIC_FIREBASE_APP_ID=$(cat /run/secrets/NEXT_PUBLIC_FIREBASE_APP_ID) && \
  # You can then use $MY_APP_SECRET in subsequent commands within this RUN instruction
  corepack enable npm && npm run build #--auth "$FIREBASE_SERVICE_ACCOUNT" 
# The secret is only available within this RUN instr

# Stage 3: Production server
FROM base AS runner
WORKDIR /src/app
ENV NODE_ENV=production
COPY --from=builder /src/app/.next/standalone ./
COPY --from=builder /src/app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]


