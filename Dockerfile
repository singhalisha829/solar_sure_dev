# FROM node:20-alpine AS deps
# WORKDIR /app
# COPY package.json yarn.lock ./
# # RUN apk add --no-cache git && \
# #     yarn install --frozen-lockfile

# RUN yarn install --frozen-lockfile   

# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY . .
# COPY --from=deps /app/node_modules ./node_modules
# RUN yarn build && \
#     cp -r public .next/standalone/ && \
#     cp -r .next/static .next/standalone/.next/

# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# ENV PORT=3002
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/standalone/.next ./.next
# COPY --from=builder /app/.next/standalone/public ./public
# EXPOSE 3002
# CMD HOSTNAME="0.0.0.0" node server.js
