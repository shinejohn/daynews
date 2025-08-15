#!/bin/bash

# Full build fix script
# Runs all necessary fixes for Next.js build issues

echo "🚀 Starting full build fix process..."
echo "=================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run all fix scripts
echo ""
echo "1️⃣ Running HTML entity fixes..."
node scripts/fix-all-html-entities.js

echo ""
echo "2️⃣ Running React hooks import fixes..."
node scripts/fix-react-hooks-imports.js

echo ""
echo "3️⃣ Running navigate dependency fixes..."
node scripts/fix-navigate-dependencies.js

echo ""
echo "4️⃣ Running use client directive fixes..."
node scripts/fix-use-client-directives.js

echo ""
echo "5️⃣ Running location reference fixes..."
node scripts/fix-location-references.js

echo ""
echo "6️⃣ Running dynamic page configuration fixes..."
node scripts/fix-all-dynamic-pages.js

echo ""
echo "7️⃣ Running post-conversion comprehensive fixes..."
node scripts/post-conversion-fixes.js

echo ""
echo "8️⃣ Running build quality validation..."
node scripts/build-quality-validator.js

echo ""
echo "=================================="
echo "✅ All fixes applied!"
echo ""
echo "🔨 Running build test..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Build successful! Your project is ready for deployment."
else
    echo ""
    echo "⚠️  Build failed. Please check the errors above."
    echo "You may need to run manual fixes for specific issues."
fi