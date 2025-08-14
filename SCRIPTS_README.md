# Day News Project Scripts - Complete Setup Guide

## Overview
This project converts a Magic Patterns React application (using React Router) to a Next.js application with App Router, Supabase integration, and proper TypeScript types.

## Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase project created (get your URL and anon key)
- GitHub repository created
- Vercel account (for deployment)

## Project Structure
```
/Users/johnshine/Dropbox/Fibonacco/Day-News/Code/
├── magic/              # Source Magic Patterns app (DO NOT MODIFY)
│   └── src/
│       ├── App.tsx     # Main app with all routes
│       └── components/ # All Magic Patterns components
└── daynews/           # Target Next.js app (will be created)
    └── scripts/       # All conversion scripts
```

## Step-by-Step Setup Process

### 1. Initial Setup
```bash
# Create new Next.js project
npx create-next-app@latest daynews --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigate to project
cd daynews

# Copy all scripts from backup
cp -r /path/to/backup/scripts ./scripts

# Make scripts executable
chmod +x scripts/*.js scripts/*.sh
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query lucide-react zustand
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge
npm install date-fns

# Dev dependencies for scripts
npm install --save-dev @babel/parser @babel/traverse @babel/generator @babel/types
npm install --save-dev prettier eslint typescript
```

### 3. Environment Setup
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 4. Run Scripts in Order

#### Phase 1: Basic Setup
```bash
# 1. Create route structure based on Magic Patterns routes
node scripts/create-route-pages.js

# 2. Convert Magic Patterns components to Next.js
node scripts/convert-magic-patterns.js

# 3. Generate database types from schema
node scripts/generate-type-mappings.js

# 4. Create Supabase queries
node scripts/generate-queries.js

# 5. Generate React Query hooks
node scripts/generate-hooks.js
```

#### Phase 2: Fix TypeScript Issues
```bash
# 6. Update database types to match actual usage
node scripts/update-database-types.js

# 7. Fix type depth issues
node scripts/fix-supabase-type-depth.js

# 8. Fix all TypeScript errors
node scripts/fix-all-type-errors.js

# 9. Fix syntax errors
node scripts/fix-all-syntax-errors.js
```

#### Phase 3: Data Integration
```bash
# 10. Implement mockdata/real data toggle
node scripts/implement-data-toggle.js

# 11. Process and extract mockdata
node scripts/scan-components.js
node scripts/process-mock-data.js

# 12. Create seed data from mockdata
node scripts/create-real-queries.js
```

#### Phase 4: Final Fixes
```bash
# 13. Fix any remaining build issues
node scripts/make-it-build.js

# 14. Run comprehensive fix
node scripts/master-fix.js
```

### 5. Database Setup
```bash
# Run seed data (requires Supabase CLI or use Supabase dashboard)
psql $DATABASE_URL < scripts/seed-data.sql
```

### 6. Build and Test
```bash
# Test build
npm run build

# Run locally
npm run dev
```

### 7. Deploy to Vercel
```bash
# Initialize git
git init
git add .
git commit -m "Initial Next.js setup with Magic Patterns conversion"

# Push to GitHub
git remote add origin https://github.com/yourusername/daynews.git
git push -u origin main

# Deploy to Vercel
vercel
```

## Important Scripts Explained

### `convert-magic-patterns.js`
- Converts React Router to Next.js navigation
- Transforms `<Link to=` to `<Link href=`
- Changes `useNavigate()` to `useRouter()`
- Adds 'use client' directives where needed

### `fix-supabase-type-depth.js`
- Wraps Supabase client to avoid TypeScript depth errors
- Only adds type assertions where absolutely necessary
- Preserves type safety for actual data usage

### `implement-data-toggle.js`
- Creates context for switching between mock/real data
- Useful for development without database
- Controlled via `NEXT_PUBLIC_USE_MOCK_DATA` env var

### `generate-queries.js`
- Creates typed Supabase query functions
- Generates CRUD operations for each table
- Includes proper error handling

## Common Issues and Solutions

### "Type instantiation is excessively deep"
Run: `node scripts/fix-supabase-type-depth.js`

### Missing database fields
1. Check actual usage: `node scripts/type-scanner-analyzer.js`
2. Update types: `node scripts/update-database-types.js`

### Build fails with syntax errors
Run in order:
1. `node scripts/fix-syntax-errors.js`
2. `node scripts/fix-all-syntax-errors.js`
3. `node scripts/master-fix.js`

### Mockdata still showing
Either:
- Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local`
- Or run: `node scripts/replace-mockdata-with-supabase.js`

## Script Categories

### Conversion Scripts
- `convert-magic-patterns.js` - Main converter
- `convert-react-router.js` - Router-specific conversions
- `create-route-pages.js` - Creates Next.js page structure

### Type Fixing Scripts
- `fix-supabase-type-depth.js` - Handles deep type issues
- `fix-all-type-errors.js` - General TypeScript fixes
- `update-database-types.js` - Updates types based on usage

### Data Scripts
- `scan-components.js` - Finds mockdata in components
- `process-mock-data.js` - Extracts and processes mockdata
- `implement-data-toggle.js` - Creates mock/real toggle

### Build Scripts
- `make-it-build.js` - Forces build to work
- `master-fix.js` - Comprehensive fixer
- `quick-build.js` - Creates placeholder components (avoid!)

## For AI/Claude Code

When working on this project:

1. **Never modify the source Magic Patterns app** in `/magic/`
2. **Always run scripts in the correct order** as listed above
3. **Check for existing scripts** before creating new ones
4. **Preserve mockdata** until database is properly seeded
5. **Use targeted type fixes** instead of aggressive `as any`
6. **Test build after each major change**

Key principles:
- Convert components, don't rewrite them
- Preserve all functionality and design
- Fix types intelligently, not aggressively
- Keep mockdata as fallback until DB works

## Deployment Checklist

- [ ] All routes working locally
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Environment variables set in Vercel
- [ ] Database seeded (if using real data)
- [ ] Mockdata toggle working (if needed)

## Emergency Recovery

If everything breaks:
1. Restore from backup
2. Start with `quick-build.js` to get deploying
3. Then run proper conversion scripts
4. Never panic - we have all the scripts!

---

Remember: The goal is to convert Magic Patterns → Next.js while preserving all functionality. The scripts handle the heavy lifting - just run them in order!