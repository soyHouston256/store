# Backoffice SPA: vite build -> nginx with SPA fallback
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Public storefront origin for WhatsApp tracking links (build-time; optional —
# code falls back to http://store.localhost when empty).
ARG VITE_STORE_URL
ENV VITE_STORE_URL=$VITE_STORE_URL
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
