FROM node:lts-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /src/app
COPY package.json package-lock.json ./
RUN corepack enable npm && npm ci

# Stage 2: Build the application
FROM base AS builder
WORKDIR /src/app
ARG FIREBASE_SERVICE_ACCOUNT
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBbMil12kvb3pndmkwSf90NIDlNd69vMeU
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=daily-quiz-464300.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=daily-quiz-464300
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=daily-quiz-464300.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=590487417981
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:590487417981:web:16fcbaed7421172df4ad14
COPY --from=deps /src/app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=FIREBASE_SERVICE_ACCOUNT,target=/run/secrets/FIREBASE_SERVICE_ACCOUNT_FILE \
  export FIREBASE_SERVICE_ACCOUNT=$(cat /run/secrets/FIREBASE_SERVICE_ACCOUNT_FILE) && \
  echo "My app secret is: $FIREBASE_SERVICE_ACCOUNT" && \
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


