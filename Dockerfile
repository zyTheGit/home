# Use Node.js LTS image for building the frontend
FROM node:18-alpine AS builder

# Install specific version of pnpm
RUN npm install -g pnpm@8.15.4

# Set registry to taobao mirror
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm config set strict-ssl false

# Set up frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Set up backend
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/.env.production ./.env
COPY backend/ecosystem.config.js ./
RUN pnpm install

# Copy and build all files
WORKDIR /app
COPY . .
RUN cd backend && pnpm run build
RUN cd frontend && pnpm run build

# Final image
FROM node:18-alpine

# Install PM2 globally
RUN npm install -g pm2

# Install nginx using apk
RUN apk update && apk add nginx

# Create necessary directories
RUN mkdir -p /app/backend

# Copy built backend
WORKDIR /app/backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/.env ./.env
COPY --from=builder /app/backend/ecosystem.config.js ./

# Copy built frontend
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx static files
# RUN rm -rf /usr/share/nginx/html/*

# Expose ports
EXPOSE 80 3000

# Start the application
CMD ["sh", "-c", "cd /app/backend && pm2 start ecosystem.config.js && nginx -g 'daemon off;'"]