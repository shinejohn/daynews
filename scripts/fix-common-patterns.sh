#!/bin/bash

# Fix common patterns after basic conversion

COMPONENTS_DIR="$(dirname "$0")/../src/components"

echo "🔧 Fixing common patterns..."

# Fix location.state usage
echo "  - Converting location.state to searchParams..."
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/router\.query \/\* TODO: Convert location\.state \*\//useSearchParams().get("state")/g' {} \;

# Fix router navigation patterns
echo "  - Fixing router navigation patterns..."
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/router\.push(`\/\([^`]*\)`)/router.push("\/\1")/g' {} \;

# Fix Link href patterns
echo "  - Fixing Link href patterns..."
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/<Link href="\([^"]*\)"/<Link href="\/\1"/g' {} \;
find "$COMPONENTS_DIR" -name "*.tsx" -type f -exec sed -i '' \
  's/<Link href="\/\//\<Link href="\//g' {} \;

# Add missing imports for useSearchParams
echo "  - Adding missing useSearchParams imports..."
for file in $(grep -l "useSearchParams()" "$COMPONENTS_DIR"/*.tsx "$COMPONENTS_DIR"/**/*.tsx 2>/dev/null); do
  if ! grep -q "useSearchParams" "$file" | head -1; then
    sed -i '' '1s/^/import { useSearchParams } from "next\/navigation";\n/' "$file"
  fi
done

echo "✅ Common patterns fixed"