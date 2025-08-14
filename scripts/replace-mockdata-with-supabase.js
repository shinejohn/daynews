#!/usr/bin/env node

/**
 * Replace mockdata with Supabase queries in components
 * 
 * This script identifies components with hardcoded data and updates them
 * to fetch data from Supabase instead.
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Components that need data replacement
const COMPONENT_DATA_MAP = {
  'HeroStory': {
    table: 'news',
    query: 'fetchFeaturedNews',
    importPath: '@/lib/supabase/queries/news.queries'
  },
  'EssentialReads': {
    table: 'news',
    query: 'fetchEssentialReads',
    importPath: '@/lib/supabase/queries/news.queries'
  },
  'FeaturedStories': {
    table: 'news',
    query: 'fetchFeaturedStories',
    importPath: '@/lib/supabase/queries/news.queries'
  },
  'TrendingSection': {
    table: 'news',
    query: 'fetchTrendingNews',
    importPath: '@/lib/supabase/queries/news.queries'
  },
  'CommunityVoices': {
    table: 'news',
    query: 'fetchCommunityNews',
    importPath: '@/lib/supabase/queries/news.queries'
  },
  'OpinionSection': {
    table: 'news',
    query: 'fetchOpinionArticles',
    importPath: '@/lib/supabase/queries/news.queries'
  },
  'LocalEventsSection': {
    table: 'events',
    query: 'fetchUpcomingEvents',
    importPath: '@/lib/supabase/queries/events.queries'
  },
  'BusinessDirectoryPage': {
    table: 'businesses',
    query: 'fetchBusinesses',
    importPath: '@/lib/supabase/queries/businesses.queries'
  },
  'EventsCalendarPage': {
    table: 'events',
    query: 'fetchEvents',
    importPath: '@/lib/supabase/queries/events.queries'
  },
  'ClassifiedsPage': {
    table: 'marketplace_items',
    query: 'fetchMarketplaceItems',
    importPath: '@/lib/supabase/queries/marketplace_items.queries'
  }
};

function processComponent(filePath, componentName) {
  const dataConfig = COMPONENT_DATA_MAP[componentName];
  if (!dataConfig) return;

  console.log(`Processing ${componentName}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Parse the file
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  let hasDataFetching = false;
  let hasUseEffect = false;
  let hasUseState = false;

  // Track imports
  const imports = new Set();
  
  traverse(ast, {
    // Find hardcoded data arrays
    VariableDeclarator(path) {
      const { node } = path;
      
      // Look for patterns like: const allStories = [...]
      if (
        t.isIdentifier(node.id) &&
        (node.id.name.includes('Stories') || 
         node.id.name.includes('Events') || 
         node.id.name.includes('Items') ||
         node.id.name === 'allStories' ||
         node.id.name === 'mockData') &&
        t.isArrayExpression(node.init)
      ) {
        // Replace with state variable
        const stateVarName = 'data';
        const loadingVarName = 'loading';
        const errorVarName = 'error';
        
        // Find the function component
        const functionParent = path.getFunctionParent();
        if (functionParent && functionParent.isArrowFunctionExpression()) {
          const componentBody = functionParent.node.body;
          
          if (t.isBlockStatement(componentBody)) {
            // Add state hooks at the beginning
            const stateHooks = [
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.arrayPattern([
                    t.identifier(stateVarName),
                    t.identifier(`set${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}`)
                  ]),
                  t.callExpression(t.identifier('useState'), [t.arrayExpression([])])
                )
              ]),
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.arrayPattern([
                    t.identifier(loadingVarName),
                    t.identifier(`set${loadingVarName.charAt(0).toUpperCase() + loadingVarName.slice(1)}`)
                  ]),
                  t.callExpression(t.identifier('useState'), [t.booleanLiteral(true)])
                )
              ]),
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.arrayPattern([
                    t.identifier(errorVarName),
                    t.identifier(`set${errorVarName.charAt(0).toUpperCase() + errorVarName.slice(1)}`)
                  ]),
                  t.callExpression(t.identifier('useState'), [t.nullLiteral()])
                )
              ])
            ];

            // Add useEffect for data fetching
            const useEffectCall = t.expressionStatement(
              t.callExpression(t.identifier('useEffect'), [
                t.arrowFunctionExpression(
                  [],
                  t.blockStatement([
                    t.variableDeclaration('const', [
                      t.variableDeclarator(
                        t.identifier('fetchData'),
                        t.arrowFunctionExpression(
                          [],
                          t.blockStatement([
                            t.tryStatement(
                              t.blockStatement([
                                t.variableDeclaration('const', [
                                  t.variableDeclarator(
                                    t.identifier('result'),
                                    t.awaitExpression(
                                      t.callExpression(t.identifier(dataConfig.query), [])
                                    )
                                  )
                                ]),
                                t.expressionStatement(
                                  t.callExpression(t.identifier('setData'), [
                                    t.memberExpression(t.identifier('result'), t.identifier('data'))
                                  ])
                                )
                              ]),
                              t.catchClause(
                                t.identifier('err'),
                                t.blockStatement([
                                  t.expressionStatement(
                                    t.callExpression(
                                      t.memberExpression(t.identifier('console'), t.identifier('error')),
                                      [t.stringLiteral(`Error fetching ${dataConfig.table}:`), t.identifier('err')]
                                    )
                                  ),
                                  t.expressionStatement(
                                    t.callExpression(t.identifier('setError'), [
                                      t.memberExpression(t.identifier('err'), t.identifier('message'))
                                    ])
                                  )
                                ])
                              ),
                              t.blockStatement([
                                t.expressionStatement(
                                  t.callExpression(t.identifier('setLoading'), [t.booleanLiteral(false)])
                                )
                              ])
                            )
                          ]),
                          true // async
                        )
                      )
                    ]),
                    t.expressionStatement(
                      t.callExpression(t.identifier('fetchData'), [])
                    )
                  ])
                ),
                t.arrayExpression([]) // empty dependency array
              ])
            );

            // Insert hooks at the beginning of the component
            componentBody.body.unshift(...stateHooks, useEffectCall);
            
            // Remove the hardcoded data declaration
            path.remove();
            
            hasDataFetching = true;
            hasUseEffect = true;
            hasUseState = true;
            
            // Add necessary imports
            imports.add('useState');
            imports.add('useEffect');
          }
        }
        
        // Update references to use 'data' instead
        const binding = path.scope.getBinding(node.id.name);
        if (binding) {
          binding.referencePaths.forEach(refPath => {
            if (t.isIdentifier(refPath.node)) {
              refPath.node.name = stateVarName;
            }
          });
        }
      }
    },
    
    // Update filter operations to handle undefined data
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property, { name: 'filter' })
      ) {
        // Wrap in optional chaining
        const object = path.node.callee.object;
        if (t.isIdentifier(object)) {
          path.node.callee = t.optionalMemberExpression(
            object,
            path.node.callee.property,
            false,
            true
          );
        }
      }
    }
  });

  // Add imports at the beginning
  if (hasDataFetching) {
    // Add React hooks import if needed
    const reactImport = ast.program.body.find(node => 
      t.isImportDeclaration(node) && 
      node.source.value === 'react'
    );
    
    if (reactImport) {
      const specifiers = reactImport.specifiers;
      if (hasUseState && !specifiers.some(s => t.isImportSpecifier(s) && s.imported.name === 'useState')) {
        specifiers.push(t.importSpecifier(t.identifier('useState'), t.identifier('useState')));
      }
      if (hasUseEffect && !specifiers.some(s => t.isImportSpecifier(s) && s.imported.name === 'useEffect')) {
        specifiers.push(t.importSpecifier(t.identifier('useEffect'), t.identifier('useEffect')));
      }
    }
    
    // Add query import
    const queryImport = t.importDeclaration(
      [t.importSpecifier(t.identifier(dataConfig.query), t.identifier(dataConfig.query))],
      t.stringLiteral(dataConfig.importPath)
    );
    
    // Insert after the first import
    const firstImportIndex = ast.program.body.findIndex(node => t.isImportDeclaration(node));
    ast.program.body.splice(firstImportIndex + 1, 0, queryImport);
  }

  // Generate the new code
  const { code } = generate(ast, {
    retainLines: false,
    compact: false
  });

  // Write back
  fs.writeFileSync(filePath, code);
  console.log(`✓ Updated ${componentName} to use Supabase data`);
}

// Process all components
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') && !entry.name.includes('.original')) {
      // Extract component name from filename
      const componentName = path.basename(entry.name, '.tsx');
      
      if (COMPONENT_DATA_MAP[componentName]) {
        processComponent(fullPath, componentName);
      }
    }
  });
}

// Main execution
console.log('🔄 Replacing mockdata with Supabase queries');
console.log('=========================================\n');

const componentsDir = path.join(__dirname, '../src/components');

// Create backup
const backupDir = path.join(__dirname, `../src/components.backup.${Date.now()}`);
console.log(`Creating backup at: ${backupDir}`);
fs.cpSync(componentsDir, backupDir, { recursive: true });

// Process components
processDirectory(componentsDir);

console.log('\n✅ Mockdata replacement complete!');
console.log('\nNext steps:');
console.log('1. Ensure all query functions are implemented in the queries files');
console.log('2. Test each component to verify data fetching works');
console.log('3. Handle loading and error states in the UI');