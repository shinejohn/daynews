#!/bin/bash

# Aggressive Mock Data Removal
# This completely removes ALL mock data patterns

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔥 Aggressive Mock Data Removal${NC}"
echo "================================"
echo ""

# Step 1: Remove all array literals with objects
echo -e "${YELLOW}Step 1: Removing array literals with objects...${NC}"
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Skip test files
  if [[ "$file" == *".test."* ]]; then
    continue
  fi
  
  # Use perl for multi-line regex
  perl -i -0pe 's/const\s+\w+\s*=\s*\[\s*\{[^}]*\}[^\]]*\];/const data = []; \/\/ TODO: Fetch from Supabase/gs' "$file"
  perl -i -0pe 's/useState\(\[\s*\{[^}]*\}[^\]]*\]\)/useState([])/gs' "$file"
done

# Step 2: Remove mock data comments and their associated data
echo -e "\n${YELLOW}Step 2: Removing mock data sections...${NC}"
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove entire mock data blocks
  sed -i '' '/\/\/ Mock data/,/^$/d' "$file" 2>/dev/null || true
  sed -i '' '/\/\/ Sample data/,/^$/d' "$file" 2>/dev/null || true
  sed -i '' '/\/\/ Dummy data/,/^$/d' "$file" 2>/dev/null || true
  sed -i '' '/\/\/ Test data/,/^$/d' "$file" 2>/dev/null || true
  sed -i '' '/\/\/ Fake data/,/^$/d' "$file" 2>/dev/null || true
done

# Step 3: Replace specific mock patterns
echo -e "\n${YELLOW}Step 3: Replacing specific patterns...${NC}"

# Replace placeholder images
find src -name "*.tsx" -exec sed -i '' \
  's|https://randomuser\.me/[^"]*|/images/placeholder-user.png|g' {} \;
find src -name "*.tsx" -exec sed -i '' \
  's|https://via\.placeholder\.com/[^"]*|/images/placeholder.png|g' {} \;
find src -name "*.tsx" -exec sed -i '' \
  's|https://images\.unsplash\.com/[^"]*|/images/placeholder.jpg|g' {} \;

# Replace Lorem ipsum
find src -name "*.tsx" -exec sed -i '' \
  's/Lorem ipsum[^.]*/Content loading.../g' {} \;

# Replace John/Jane Doe
find src -name "*.tsx" -exec sed -i '' \
  's/John Doe/User/g' {} \;
find src -name "*.tsx" -exec sed -i '' \
  's/Jane Doe/User/g' {} \;

# Step 4: Fix specific components
echo -e "\n${YELLOW}Step 4: Fixing specific components...${NC}"

# Fix AnnouncementsSectionWithData
if [ -f "src/components/AnnouncementsSectionWithData.tsx" ]; then
  cat > "src/components/AnnouncementsSectionWithData.tsx" << 'EOF'
'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncementsSection } from './AnnouncementsSection';
import { announcementsQueries } from '@/lib/supabase/queries/announcements.queries';

export const AnnouncementsSectionWithData = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementsQueries.featured();
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;
  }

  if (error) {
    return <div className="text-center py-8 text-gray-500">Unable to load announcements</div>;
  }

  return <AnnouncementsSection announcements={announcements} />;
};
EOF
  echo "  ✓ Fixed AnnouncementsSectionWithData"
fi

# Fix BusinessProfile - convert to data-driven
if [ -f "src/components/BusinessProfile.tsx" ]; then
  echo "  ✓ BusinessProfile needs manual conversion (too complex for automated fix)"
fi

# Step 5: Create placeholder images
echo -e "\n${YELLOW}Step 5: Creating placeholder images directory...${NC}"
mkdir -p public/images
touch public/images/placeholder.png
touch public/images/placeholder.jpg
touch public/images/placeholder-user.png

# Step 6: Run the comprehensive removal script
echo -e "\n${YELLOW}Step 6: Running comprehensive removal...${NC}"
node scripts/remove-all-mockdata.js 2>/dev/null || echo "  (Script not found, skipping)"

# Step 7: Final verification
echo -e "\n${YELLOW}Step 7: Verifying removal...${NC}"
remaining=$(grep -r "= \[" src --include="*.tsx" --include="*.ts" | grep -c "{" || echo "0")
echo -e "  Remaining array literals: ${remaining}"

echo -e "\n${GREEN}✅ Aggressive mock data removal complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review components that need manual fixes"
echo "2. Implement proper data fetching for each component"
echo "3. Add loading and error states"
echo "4. Test all pages"