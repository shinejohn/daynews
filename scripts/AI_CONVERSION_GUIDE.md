# AI-Supervised Magic Patterns to Next.js Conversion Guide

## Overview
This guide is for Claude Code to intelligently supervise the conversion of a Magic Patterns project to Next.js with proper SSR/CSR differentiation for a news website. Instead of running scripts blindly, you will execute each step, verify results, fix issues, and only proceed when the current step is successful.

## Core Principles
1. **SSR-First**: This is a news website. SEO is critical. Default to server-side rendering.
2. **Verify Before Proceeding**: Check outputs and test builds after each major step.
3. **Fix Issues Immediately**: Don't proceed with errors. Fix them first.
4. **Document Everything**: Keep track of what worked and what needed intervention.

## Conversion Process

### PHASE 1: ANALYSIS & PREPARATION

#### Step 1: Initial Assessment
```bash
# First, understand the project structure
find src -type f -name "*.tsx" | head -20
ls -la src/components/ | head -20
```

**Check for:**
- Component organization
- Existing patterns (Magic Patterns structure)
- Current use of 'use client' directives

**Red flags:**
- Every component has 'use client' at the top
- Components mixing display and interaction logic
- Missing component files

#### Step 2: Create Component Inventory
```bash
find src/components -name "*.tsx" -type f > components-list.txt
wc -l components-list.txt
```

**Verify:**
- List contains all components
- No missing paths
- Reasonable component count (100-500 for a news site)

#### Step 3: Scan Components for Patterns
```bash
node scripts/scan-components.js
```

**Check output for:**
- Components with mock data (need real data integration)
- CRUD operations (need API connections)
- Client-side patterns (hooks, browser APIs)

**Expected output files:**
- `component-audit.json`
- `extracted-mock-data.json`

### PHASE 2: RENDERING ANALYSIS

#### Step 4: Analyze Rendering Requirements
```bash
node scripts/smart-rendering-analyzer.js
```

**Review the output for:**
- Default SSR percentage (should be >70% for news site)
- Components marked as CSR (should be forms, admin panels, interactive widgets)
- Any components with conflicts (need SSR but have client code)

**Verify the analysis by checking a few examples:**
```bash
# Check if HomePage is correctly identified as SSR
grep -A5 -B5 "HomePage" rendering-analysis-output.json

# Check if admin components are CSR
grep -A5 -B5 "AdminDashboard" rendering-analysis-output.json
```

#### Step 5: Apply News Site Strategy
```bash
node scripts/news-site-rendering-strategy.js
```

**Check the report for:**
- SSR components should include all content pages
- CSR components should be limited to interactive features
- Refactoring suggestions for components with conflicts

**Critical verification:**
```bash
# These MUST be SSR:
grep -E "HomePage|ArticleDetailPage|NewsContent|EventsPage" news-site-strategy-report.txt

# These MUST be CSR:
grep -E "CreateNewsPage|AdminDashboard|UserSettings" news-site-strategy-report.txt
```

### PHASE 3: INITIAL CONVERSION

#### Step 6: Run Smart Conversion
```bash
node scripts/smart-magic-patterns-converter.js
```

**Monitor output for:**
- React Router imports being converted
- Navigation updates
- Any components it couldn't convert

**Spot check conversions:**
```bash
# Check Link conversions
grep -n "from 'next/link'" src/components/Header.tsx

# Check navigation conversions
grep -n "useRouter" src/components/Navigation.tsx
```

#### Step 7: Create Route Pages
```bash
node scripts/create-route-pages.js
```

**Verify route creation:**
```bash
# Check key routes exist
ls -la src/app/page.tsx
ls -la src/app/national/page.tsx
ls -la src/app/events/page.tsx
ls -la src/app/admin-dashboard/page.tsx
```

**Check route configuration:**
```bash
# Homepage should have ISR
grep -A2 -B2 "revalidate" src/app/page.tsx

# Admin should have 'use client'
head -n 5 src/app/admin-dashboard/page.tsx
```

### PHASE 4: FIXING COMMON ISSUES

#### Step 8: Fix HTML Entities
```bash
node scripts/fix-all-html-entities.js
```

**Verify fixes:**
```bash
# Should find no HTML entities in strings
grep -r "&apos;" src/ --include="*.tsx" | wc -l  # Should be 0
grep -r "&quot;" src/ --include="*.tsx" | wc -l  # Should be 0
```

#### Step 9: Fix Missing Imports
```bash
node scripts/fix-react-hooks-imports.js
```

**Test a build to check imports:**
```bash
npm run build 2>&1 | grep -E "not defined|Cannot find"
```

If errors exist, fix them before proceeding.

### PHASE 5: SMART CLIENT DIRECTIVE APPLICATION

#### Step 10: Apply Smart 'use client' Analysis
```bash
# First, check current state
grep -r "^'use client'" src/ --include="*.tsx" | wc -l

# Run smart analyzer
node scripts/smart-use-client-analyzer.js
```

**Review the report:**
- Added count should be low (<30% of components)
- Removed count might be high (that's good!)
- Check specific examples to ensure correctness

**Verify critical pages are SSR:**
```bash
# These should NOT have 'use client':
head -n 5 src/app/page.tsx
head -n 5 src/app/national/page.tsx
head -n 5 src/app/events/page.tsx
```

### PHASE 6: SSR COMPATIBILITY

#### Step 11: Fix SSR Issues
```bash
node scripts/fix-ssr-pages.js
```

**Check for SSR compatibility:**
```bash
# Should not find window/document in SSR pages
grep -r "window\." src/app/ --include="page.tsx" | grep -v "typeof window"
grep -r "document\." src/app/ --include="page.tsx"
```

#### Step 12: Apply Rendering Strategies
```bash
node scripts/fix-rendering-strategies.js
```

**Verify strategies applied:**
```bash
# Check ISR on news pages
grep "revalidate = 300" src/app/page.tsx
grep "revalidate = 300" src/app/national/page.tsx

# Check SSG on static pages
grep "revalidate = 86400" src/app/about/page.tsx
```

### PHASE 7: BUILD VERIFICATION

#### Step 13: Test Build
```bash
npm run build
```

**If build fails:**
1. Read the error carefully
2. Identify if it's:
   - Missing import → Run import fixer
   - Client/server mismatch → Check 'use client' placement
   - Type error → May need manual fix
3. Fix the specific issue
4. Re-run build

**If build succeeds:**
```bash
# Check build output
ls -la .next/server/app/
ls -la .next/static/
```

### PHASE 8: FINAL VERIFICATION

#### Step 14: Verify Rendering Strategies
```bash
# Start the production server
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if pages are actually SSR
curl -s http://localhost:3000 | grep -o "<title>.*</title>"
curl -s http://localhost:3000/national | grep -o "<title>.*</title>"

# Stop server
kill $SERVER_PID
```

#### Step 15: Generate Final Report
```bash
cat > CONVERSION_REPORT.md << 'EOF'
# Conversion Report

## Summary
- Date: $(date)
- Total Components: $(find src/components -name "*.tsx" | wc -l)
- SSR Pages: $(grep -r "^export const revalidate" src/app/ | wc -l)
- Client Components: $(grep -r "^'use client'" src/ | wc -l)

## Rendering Strategy
- ISR Pages (News): $(grep -r "revalidate = 300" src/app/ | wc -l)
- SSG Pages (Static): $(grep -r "revalidate = 86400" src/app/ | wc -l)
- Dynamic Pages: $(grep -r "force-dynamic" src/app/ | wc -l)

## Build Status
$(npm run build 2>&1 | tail -n 20)
EOF
```

## Decision Points

### When to STOP and fix:
1. **Build fails** - Never proceed with a failing build
2. **More than 50% components have 'use client'** - Something's wrong
3. **Homepage has 'use client'** - Critical SEO issue
4. **SSR pages reference window/document** - Will crash in production

### When to proceed:
1. Build succeeds
2. Less than 30% components are client-side
3. All news/content pages are SSR/ISR
4. No window/document errors in SSR pages

## Common Interventions

### If too many components have 'use client':
```bash
# Remove all and re-analyze
find src -name "*.tsx" -exec sed -i '' "s/^'use client';//" {} \;
node scripts/smart-use-client-analyzer.js
```

### If build fails with "window is not defined":
```bash
# Find the offending file
grep -r "window\." src/ --include="*.tsx" | grep -v "typeof window"
# Wrap with: if (typeof window !== 'undefined')
```

### If imports are missing:
```bash
# Run comprehensive import fix
node scripts/fix-all-imports.js
```

## Success Criteria

The conversion is successful when:
1. ✅ Build completes without errors
2. ✅ Homepage and content pages are server-rendered
3. ✅ SEO-critical pages have proper meta tags
4. ✅ Interactive features still work (test manually)
5. ✅ Less than 30% of components are client-side
6. ✅ Production build serves SSR content

## Final Notes

Remember: This is a NEWS WEBSITE. SEO is paramount. When in doubt, choose SSR over CSR. The goal is to have most content server-rendered with client-side interactivity only where absolutely necessary.

If you encounter issues not covered here, analyze the error, understand why it's happening, and fix it before proceeding. Document any new fixes for future conversions.