FROM node:20-alpine AS builder

WORKDIR /app

# Copy files needed for install/build
COPY package*.json ./
COPY next.config.js ./
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY prisma ./prisma/
COPY lib ./lib/
COPY app ./app/

# Install deps + generate prisma + build
RUN npm install \
  && npx prisma generate \
  && npm run build

# Runtime
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built app + deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/app ./app
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib

EXPOSE 3000

# Ensure DB schema exists, then start
CMD ["sh", "-lc", "npx prisma db push && npm start"]
