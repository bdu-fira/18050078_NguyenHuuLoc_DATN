# Development stage
FROM node:19.5.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .env ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
