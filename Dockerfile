FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Copy index.html to dist/client if it doesn't exist
RUN mkdir -p dist/client && cp index.html dist/client/ || true

# Expose port
EXPOSE 3000

# Start the application - bind to 0.0.0.0 for Railway
CMD ["node", "server/server-enhanced.js"]