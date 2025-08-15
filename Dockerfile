# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build the application (run commands directly instead of script)
RUN mkdir -p dist && \
    npm run build:client && \
    npm run build:server && \
    cp -r server dist/ && \
    cp package*.json dist/ && \
    mkdir -p dist/cache

# Create cache directory
RUN mkdir -p cache

# Expose port
EXPOSE ${PORT:-3001}

# Start the application
CMD ["node", "server/server-enhanced.js"]