#!/bin/bash

# Fix common TypeScript issues after conversion

COMPONENTS_DIR="$(dirname "$0")/../src/components"

echo "🔧 Fixing TypeScript issues..."

# Add any type to event handlers
echo "  - Adding types to event handlers..."
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/onClick={(\([^)]*\))}/onClick={(e: React.MouseEvent) => {\1}}/g' {} \;
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/onChange={(\([^)]*\))}/onChange={(e: React.ChangeEvent<HTMLInputElement>) => {\1}}/g' {} \;
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/onSubmit={(\([^)]*\))}/onSubmit={(e: React.FormEvent) => {\1}}/g' {} \;

# Fix missing return types
echo "  - Adding return types to components..."
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/export const \([A-Za-z]*\) = () => {/export const \1: React.FC = () => {/g' {} \;

# Fix any type issues
echo "  - Fixing any type annotations..."
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/: any\[\]/: unknown[]/g' {} \;
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/: any)/: unknown)/g' {} \;

# Add missing imports for React types
echo "  - Adding missing React type imports..."
for file in $(find "$COMPONENTS_DIR" -name "*.tsx" -type f); do
  if grep -q "React.FC\|React.MouseEvent\|React.ChangeEvent\|React.FormEvent" "$file"; then
    if ! grep -q "import.*React" "$file"; then
      sed -i '' '1s/^/import React from "react";\n/' "$file"
    fi
  fi
done

echo "✅ TypeScript issues fixed"