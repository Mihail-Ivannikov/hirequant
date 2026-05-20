# ==========================================
# STAGE 1: True Monorepo Builder
# ==========================================
FROM node:22-slim AS builder

WORKDIR /app

ENV CI=true
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

ARG VITE_API_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}

COPY . .

RUN pnpm install --no-frozen-lockfile

WORKDIR /app/apps/web

RUN npx vite build


FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]