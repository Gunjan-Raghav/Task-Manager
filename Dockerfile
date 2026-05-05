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
# Copy package files and install backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source code and Prisma schema
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Copy the built frontend static files from the previous stage to backend/public
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

# Expose port (default for Express)
EXPOSE 4000

# Start script
# Note: Railway handles database migrations automatically if you use a release command,
# but we can also just run migrations before starting the server.
CMD npx prisma migrate deploy && npm start
