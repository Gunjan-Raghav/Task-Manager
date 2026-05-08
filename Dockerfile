# ==========================================
# 1. Build the Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build it
COPY frontend/ ./
RUN npm run build

# ==========================================
# 2. Build and run the Backend
# ==========================================
FROM node:20-alpine
WORKDIR /app/backend

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source code and Prisma schema
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Copy the built frontend static files from the previous stage to the location expected by the PR
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port (default for Express)
EXPOSE 4000

# Start script
# Use db push to ensure tables are created on the fresh Railway database
CMD npx prisma db push --accept-data-loss && npm start
