FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json .
COPY vendor/video-space/package.json ./vendor/video-space/package.json
# This build targets browsers and does not need optional ONNX Node binary downloads.
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
