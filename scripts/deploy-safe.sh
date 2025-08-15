#!/bin/bash
set -e

echo "🚀 Safe Deployment Script for Version B"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "${YELLOW}⚠️  Warning: Not on main branch (current: $BRANCH)${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Error: Uncommitted changes detected${NC}"
  echo "Please commit or stash your changes first"
  exit 1
fi

echo -e "\n${GREEN}1️⃣ Running validation...${NC}"
if ! npm run validate; then
  echo -e "${RED}❌ Validation failed!${NC}"
  echo "Run 'npm run validate:fix' to attempt fixes"
  exit 1
fi

echo -e "\n${GREEN}2️⃣ Running build test...${NC}"
npm run clean
npm install --silent
if ! npm run build; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi

echo -e "\n${GREEN}3️⃣ Running frontend tests...${NC}"
if ! npm run test:frontend; then
  echo -e "${YELLOW}⚠️  Frontend tests failed${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo -e "\n${GREEN}4️⃣ Checking critical files...${NC}"

# Check App.tsx export
if ! grep -q "export function App\|export const App" src/App.tsx; then
  echo -e "${RED}❌ App.tsx missing proper export${NC}"
  exit 1
fi

# Check entry files import
if ! grep -q "import { App }" src/entry/entry-client.tsx; then
  echo -e "${RED}❌ entry-client.tsx has wrong import${NC}"
  exit 1
fi

echo -e "${GREEN}✅ All checks passed!${NC}"

# Show what will be deployed
echo -e "\n${YELLOW}📋 Deployment Summary:${NC}"
echo "Branch: $BRANCH"
echo "Last commit: $(git log -1 --oneline)"
echo "Build output: $(du -sh dist 2>/dev/null | cut -f1 || echo 'N/A')"

echo -e "\n${YELLOW}🚀 Ready to deploy to Vercel${NC}"
read -p "Deploy now? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "\n${GREEN}Pushing to GitHub...${NC}"
  git push origin $BRANCH
  
  echo -e "\n${GREEN}✅ Deployed! Check Vercel dashboard for build status.${NC}"
  echo "Dashboard: https://vercel.com/dashboard"
  
  # Optional: Open Vercel dashboard
  if command -v open &> /dev/null; then
    read -p "Open Vercel dashboard? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      open "https://vercel.com/dashboard"
    fi
  fi
else
  echo -e "${YELLOW}Deployment cancelled${NC}"
fi