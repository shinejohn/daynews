#!/bin/bash

# Quick Test Build - Skip to the essentials

set -e

echo "🚀 Quick Test Build"
echo "=================="

# Test if components exist
if [ -d "src/components" ] && [ -f "src/components/HomePage.tsx" ]; then
    echo "✓ Components found"
else
    echo "✗ Components missing"
    exit 1
fi

# Test build
echo ""
echo "Testing build..."
npm run build