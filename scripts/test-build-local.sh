#!/bin/bash
echo "🧪 Testing build locally..."

# Clean
rm -rf dist

# Run the build
echo "Building client..."
npm run build

# Check if dist was created
if [ -d "dist" ]; then
  echo "✅ Build successful!"
  echo "Files in dist:"
  ls -la dist/
else
  echo "❌ Build failed - no dist directory"
  exit 1
fi

# Test simple server
echo "Testing simple server..."
node server/simple-server.js &
SERVER_PID=$!
sleep 2

# Test health endpoint
curl -s http://localhost:3001/health
echo ""

# Kill test server
kill $SERVER_PID

echo "✅ Local test complete!"