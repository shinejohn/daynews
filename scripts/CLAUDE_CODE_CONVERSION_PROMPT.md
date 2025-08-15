# Claude Code: Supervised Next.js Conversion Task

You are about to supervise an intelligent conversion of a Magic Patterns project to Next.js. This is a NEWS WEBSITE where SEO is critical, so we need proper SSR/CSR differentiation.

## Your Mission

Execute the conversion process step-by-step, verifying each stage before proceeding. You have full autonomy to:
- Run scripts and monitor their output
- Fix issues as they arise
- Make intelligent decisions about when to proceed vs when to intervene
- Ensure the final result is a properly configured SSR-first news website

## Important Context

1. **Current State**: The project was already converted but everything became client-side ('use client' everywhere), breaking SEO
2. **Goal**: Fix the conversion to be SSR-first with client-side only where necessary
3. **Approach**: Run each script, verify outputs, fix issues before proceeding

## Instructions

1. Start by reading `scripts/AI_CONVERSION_GUIDE.md` for detailed step-by-step instructions
2. Begin with Phase 1 and work through each phase sequentially
3. After each script:
   - Check the output for errors or warnings
   - Verify the results match expectations
   - Run the suggested verification commands
   - Fix any issues before proceeding
4. Document any manual interventions needed
5. If you encounter an error not covered in the guide, analyze it and fix it

## Key Scripts to Use

1. `scan-components.js` - Analyzes all components
2. `smart-rendering-analyzer.js` - Determines SSR vs CSR needs
3. `news-site-rendering-strategy.js` - Applies news site specific rules
4. `smart-magic-patterns-converter.js` - Converts routing
5. `create-route-pages.js` - Creates Next.js pages with proper rendering
6. `smart-use-client-analyzer.js` - Intelligently applies 'use client'
7. `fix-rendering-strategies.js` - Sets up ISR/SSR/SSG

## Critical Checks

After the conversion, these MUST be true:
- [ ] Homepage (`src/app/page.tsx`) has NO 'use client' directive
- [ ] Homepage has `export const revalidate = 300` for ISR
- [ ] Less than 30% of components have 'use client'
- [ ] Build completes successfully
- [ ] Content pages are server-rendered

## Decision Framework

**STOP and fix if:**
- Build fails at any point
- More than 50% components become client-side
- Any SEO-critical page has 'use client'
- You see "window is not defined" errors in SSR context

**Proceed when:**
- Current phase completes successfully
- Verification commands show expected results
- No critical errors in output

## Your First Steps

1. Check current state: `grep -r "^'use client'" src/ --include="*.tsx" | wc -l`
2. Read the conversion guide: `cat scripts/AI_CONVERSION_GUIDE.md`
3. Start with Phase 1, Step 1
4. Work methodically through each phase

Remember: This is a news website. Prioritize SEO. Default to SSR. Only use client-side rendering when absolutely necessary for interactivity.

Begin when ready. Good luck!