#!/bin/bash
# Railway start script

echo "🚀 Starting Day.News ISR Server..."
echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-3001}"

# Ensure cache directory exists
mkdir -p cache

# Start the server
exec node server/server-enhanced.js