# Multi-stage build: tsc -> node:20-slim runtime (design §8).
# Default (last) stage is the production image; docker-compose.dev.yml
# builds `target: dev` for tsx-watch over a bind-mounted ./api/src.
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Dev image: full deps (tsx) + src; compose dev override bind-mounts ./api/src
# on top of /app/src so `tsx watch` reloads on host edits.
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npx", "tsx", "watch", "src/index.ts"]

FROM base AS build
RUN npm run build && npm prune --omit=dev

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
