# Deployment Checklist for Version B

## Pre-Deployment Checks

### 1. Code Quality ✓
- [ ] Run `npm run validate` - All checks pass
- [ ] Run `npm run typecheck` - No TypeScript errors
- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npm run test:frontend` - Frontend tests pass

### 2. Build Verification ✓
- [ ] Run `npm run build` locally - Build succeeds
- [ ] Check `dist/` folder created with assets
- [ ] Verify no placeholder components in build

### 3. Import/Export Validation ✓
- [ ] App.tsx has correct export (`export function App()`)
- [ ] Entry files use correct import (`import { App }`)
- [ ] All components have proper exports

### 4. Route Configuration ✓
- [ ] Run `npm run validate:fix` if needed
- [ ] Verify route-config.js has valid syntax
- [ ] No `: :` patterns (should be `: [`)
- [ ] All arrays properly closed with `]`

### 5. Environment Variables ✓
- [ ] `.env.local` has Supabase credentials
- [ ] Vercel has environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. CSS/Styling ✓
- [ ] CSS imports in correct order (@import before @tailwind)
- [ ] Tailwind config present
- [ ] PostCSS config using `@tailwindcss/postcss`

### 7. Dependencies ✓
- [ ] All Magic Patterns dependencies installed
- [ ] No version conflicts in package.json
- [ ] `package-lock.json` committed

## Deployment Process

### 1. Final Validation
```bash
npm run clean
npm install
npm run validate
npm run build
npm run test:frontend
```

### 2. Git Operations
```bash
git add -A
git commit -m "deploy: [description]"
git push
```

### 3. Vercel Deployment
- Push triggers auto-deployment
- Check Vercel dashboard for build status
- Monitor for any build errors

### 4. Post-Deployment Verification
- [ ] Site loads without errors
- [ ] Homepage shows real content (not placeholder)
- [ ] Navigation works
- [ ] Console has no critical errors
- [ ] Data fetching works (if connected to Supabase)

## Common Issues & Fixes

### Build Fails on Vercel
1. **Import errors**: Check App.tsx export/import mismatch
2. **CSS errors**: Fix import order in index.css
3. **Missing deps**: Check package.json has all dependencies

### Route Errors
1. Run `npm run validate:fix`
2. Check for syntax errors in route-config.js

### TypeScript Errors
1. Ensure tsconfig.json is present
2. Run `npm run typecheck` locally first

## Quick Commands

```bash
# Full pre-deployment check
npm run clean && npm install && npm run validate && npm run build && npm run test:frontend

# Fix common issues
npm run validate:fix

# Emergency rollback
git revert HEAD && git push
```