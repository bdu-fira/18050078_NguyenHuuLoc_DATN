# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies
COPY package*.json ./

RUN npm ci --only=production

# Stage 2: Create the production image
FROM node:22-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./


# Copy application code
COPY . .

# Set environment variables
COPY .env .

# Set file permissions
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "app.js"]
