# Production Multi-Stage Dockerfile for Smart Student Management System
FROM node:20-alpine AS build

WORKDIR /app

# Copy root, client, and server manifests
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm --prefix client install
RUN npm --prefix server install --omit=dev

# Copy source files
COPY client/ ./client/
COPY server/ ./server/

# Build client
RUN npm --prefix client run build

# Final runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built assets and server from builder
COPY --from=build /app/package.json ./
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server ./server

EXPOSE 5000

CMD ["npm", "--prefix", "server", "start"]
