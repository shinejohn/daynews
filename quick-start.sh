#!/bin/bash
set -e

echo "🚀 Quick Start - Version B ISR System"
echo "===================================="

# Check for Magic Patterns
if [ -z "$1" ]; then
  echo "❌ Please provide path to Magic Patterns"
  echo "Usage: $0 <path-to-magic-patterns>"
  exit 1
fi

MAGIC_DIR="$1"

# Copy components
echo "📋 Copying Magic Patterns components..."
if [ -d "$MAGIC_DIR/src/components" ]; then
  cp -r "$MAGIC_DIR/src/components/"* src/components/
  echo "✅ Components copied"
else
  echo "❌ Components directory not found at $MAGIC_DIR/src/components"
  exit 1
fi

# Setup environment
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env file - please configure it"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Extract metadata
echo "🔍 Extracting page metadata..."
node scripts/extract-metadata-enhanced.js "$MAGIC_DIR/src/components"

# Start dev server
echo "🚀 Starting development server..."
./dev.sh
