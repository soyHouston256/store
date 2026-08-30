# Storefront SPA: vite build -> nginx with SPA fallback (design §8).
#
# VITE_API_URL is a BUILD-TIME argument (vite inlines it into the bundle):
#   docker build --build-arg VITE_API_URL=https://api.example.com .
# docker-compose.yml passes it from the root .env.
#
# Toolchain note: the storefront is Vite 2 / TS 4.6 with no "engines" field;
# builds verified on node >= 20 (node:20-alpine matches the api/backoffice images).
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
