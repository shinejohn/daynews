#!/bin/bash
set -e

echo "🚀 Starting development server..."

# Ensure cache directory exists
mkdir -p cache

# Check for .env
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  cp .env.example .env
  echo "⚠️  Please configure your .env file"
fi

# Start development server
node server/server-enhanced.js
