# Étape de build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --frozen-lockfile

COPY . .
RUN npm run build

# Étape de production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3304

CMD ["npm", "start"]