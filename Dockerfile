FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# VITE_ vars são injetadas em tempo de build (baked into bundle)
ARG VITE_M1_URL=http://localhost:8001
ARG VITE_M2_URL=http://localhost:8002
ARG VITE_M3_URL=http://localhost:8003
ARG VITE_M4_URL=http://localhost:8004
ARG VITE_M5_URL=http://localhost:8005
ARG VITE_M6_URL=http://localhost:8006
ARG VITE_API_ANALYTICS=http://localhost:8007
ARG VITE_M9_URL=http://localhost:8009

ENV VITE_M1_URL=$VITE_M1_URL \
    VITE_M2_URL=$VITE_M2_URL \
    VITE_M3_URL=$VITE_M3_URL \
    VITE_M4_URL=$VITE_M4_URL \
    VITE_M5_URL=$VITE_M5_URL \
    VITE_M6_URL=$VITE_M6_URL \
    VITE_API_ANALYTICS=$VITE_API_ANALYTICS \
    VITE_M9_URL=$VITE_M9_URL

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
