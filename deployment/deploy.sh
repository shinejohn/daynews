#!/bin/bash

# DayNews ISR Deployment Script
set -e

echo "🚀 Starting DayNews ISR deployment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "❌ .env.production file not found. Please create it with required environment variables."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose -f docker/docker-compose.yml build

echo "🔄 Starting services..."
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Deployment successful! Application is running at http://localhost:3000"
else
    echo "❌ Health check failed. Check logs with: docker-compose -f docker/docker-compose.yml logs"
    exit 1
fi

echo "📊 Service status:"
docker-compose -f docker/docker-compose.yml ps
