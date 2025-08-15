#!/usr/bin/env node

/**
 * Magic Patterns Structure Analyzer
 * Extracts complete page structure, navigation, and component relationships
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Analyzing Magic Patterns Structure...\n');

class MagicPatternsAnalyzer {
  constructor(magicDir) {
    this.magicDir = magicDir || process.env.MAGIC_PATTERNS_DIR || '../magic';
    this.structure = {
      navigation: {},
      pages: {},
      components: {},
      routes: {},
      layouts: {},
      dataFlow: {},
      styling: {}
    };
  }

  async analyze() {
    console.log(`📂 Analyzing: ${this.magicDir}\n`);
    
    // Step 1: Find and analyze App.jsx/tsx for routes
    await this.analyzeRoutes();
    
    // Step 2: Analyze navigation components
    await this.analyzeNavigation();
    
    // Step 3: Analyze page components and their structure
    await this.analyzePages();
    
    // Step 4: Extract component hierarchy
    await this.analyzeComponentHierarchy();
    
    // Step 5: Analyze data flow and props
    await this.analyzeDataFlow();
    
    // Step 6: Extract styling patterns
    await this.analyzeStyling();
    
    // Step 7: Generate complete structure report
    await this.generateReport();
    
    return this.structure;
  }

  async analyzeRoutes() {
    console.log('🛣️  Analyzing routes...');
    
    // Find main App file
    const appFiles = glob.sync(`${this.magicDir}/**/App.{jsx,tsx}`, { ignore: '**/node_modules/**' });
    
    if (appFiles.length === 0) {
      console.log('  No App.jsx/tsx found, checking for routes...');
      return;
    }
    
    const appContent = fs.readFileSync(appFiles[0], 'utf8');
    
    // Extract React Router routes
    const routePattern = /<Route\s+(?:exact\s+)?path=["']([^"']+)["']\s+(?:component|element)={([^}]+)}/g;
    const routes = {};
    let match;
    
    while ((match = routePattern.exec(appContent)) !== null) {
      const [, path, component] = match;
      const componentName = component.replace(/[<>{}]/g, '').trim();
      routes[path] = {
        path,
        component: componentName,
        isIndex: path === '/',
        category: this.categorizeRoute(path)
      };
    }
    
    // Also check for Routes with element prop (React Router v6)
    const v6RoutePattern = /<Route\s+path=["']([^"']+)["']\s+element={<([^/>]+)/g;
    while ((match = v6RoutePattern.exec(appContent)) !== null) {
      const [, path, component] = match;
      routes[path] = {
        path,
        component: component.trim(),
        isIndex: path === '/',
        category: this.categorizeRoute(path)
      };
    }
    
    // Check for navigation links
    const linkPattern = /<(?:Link|NavLink)\s+to=["']([^"']+)["'][^>]*>([^<]+)</g;
    const navLinks = [];
    while ((match = linkPattern.exec(appContent)) !== null) {
      const [, href, text] = match;
      navLinks.push({ href, text: text.trim() });
    }
    
    this.structure.routes = routes;
    this.structure.navigation.mainNav = navLinks;
    
    console.log(`  ✓ Found ${Object.keys(routes).length} routes`);
    console.log(`  ✓ Found ${navLinks.length} navigation links`);
  }

  async analyzeNavigation() {
    console.log('\n🧭 Analyzing navigation components...');
    
    // Find navigation-related components
    const navPatterns = ['**/Header*.{jsx,tsx}', '**/Nav*.{jsx,tsx}', '**/Menu*.{jsx,tsx}'];
    const navFiles = [];
    
    navPatterns.forEach(pattern => {
      navFiles.push(...glob.sync(`${this.magicDir}/${pattern}`, { ignore: '**/node_modules/**' }));
    });
    
    navFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.basename(file, path.extname(file));
      
      // Extract navigation structure
      const navItems = [];
      
      // Look for navigation arrays
      const navArrayPattern = /const\s+(?:nav|menu)Items\s*=\s*\[([\s\S]*?)\];/;
      const navArrayMatch = content.match(navArrayPattern);
      
      if (navArrayMatch) {
        // Parse navigation items
        const itemPattern = /{\s*(?:name|label|text):\s*["']([^"']+)["'],\s*(?:href|path|to):\s*["']([^"']+)["']/g;
        let itemMatch;
        while ((itemMatch = itemPattern.exec(navArrayMatch[1])) !== null) {
          navItems.push({ text: itemMatch[1], href: itemMatch[2] });
        }
      }
      
      // Look for Link/NavLink components
      const linkPattern = /<(?:Link|NavLink)\s+(?:to|href)=["']([^"']+)["'][^>]*>([^<]+)</g;
      let linkMatch;
      while ((linkMatch = linkPattern.exec(content)) !== null) {
        navItems.push({ href: linkMatch[1], text: linkMatch[2].trim() });
      }
      
      this.structure.navigation[fileName] = {
        file: file,
        items: navItems,
        isMainNav: fileName.toLowerCase().includes('header') || fileName.toLowerCase().includes('mainnav')
      };
    });
    
    console.log(`  ✓ Found ${Object.keys(this.structure.navigation).length} navigation components`);
  }

  async analyzePages() {
    console.log('\n📄 Analyzing page components...');
    
    // Find all page components based on routes
    Object.values(this.structure.routes).forEach(route => {
      const componentName = route.component;
      const pageFiles = glob.sync(`${this.magicDir}/**/${componentName}.{jsx,tsx}`, { 
        ignore: '**/node_modules/**' 
      });
      
      if (pageFiles.length > 0) {
        const content = fs.readFileSync(pageFiles[0], 'utf8');
        
        // Extract imported components
        const imports = this.extractImports(content);
        
        // Extract JSX structure
        const jsxStructure = this.extractJSXStructure(content, componentName);
        
        // Extract sections and layout
        const sections = this.extractSections(content);
        
        this.structure.pages[route.path] = {
          component: componentName,
          file: pageFiles[0],
          imports: imports,
          structure: jsxStructure,
          sections: sections,
          route: route.path,
          category: route.category
        };
      }
    });
    
    console.log(`  ✓ Analyzed ${Object.keys(this.structure.pages).length} pages`);
  }

  async analyzeComponentHierarchy() {
    console.log('\n🏗️  Analyzing component hierarchy...');
    
    // For each page, build complete component tree
    Object.entries(this.structure.pages).forEach(([path, pageData]) => {
      const hierarchy = this.buildComponentTree(pageData.structure);
      pageData.hierarchy = hierarchy;
      
      // Extract layout patterns
      if (this.hasLayoutPattern(hierarchy)) {
        this.structure.layouts[path] = this.extractLayoutPattern(hierarchy);
      }
    });
    
    console.log(`  ✓ Built hierarchy for ${Object.keys(this.structure.pages).length} pages`);
  }

  async analyzeDataFlow() {
    console.log('\n🔌 Analyzing data flow...');
    
    // Find data fetching patterns
    const componentFiles = glob.sync(`${this.magicDir}/**/*.{jsx,tsx}`, { 
      ignore: '**/node_modules/**' 
    });
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const componentName = path.basename(file, path.extname(file));
      
      // Look for data patterns
      const dataPatterns = {
        useState: (content.match(/useState\s*\(/g) || []).length,
        useEffect: (content.match(/useEffect\s*\(/g) || []).length,
        fetch: content.includes('fetch('),
        axios: content.includes('axios.'),
        mockData: this.extractMockData(content),
        props: this.extractProps(content, componentName)
      };
      
      if (Object.values(dataPatterns).some(v => v)) {
        this.structure.dataFlow[componentName] = dataPatterns;
      }
    });
    
    console.log(`  ✓ Analyzed data flow for ${Object.keys(this.structure.dataFlow).length} components`);
  }

  async analyzeStyling() {
    console.log('\n🎨 Analyzing styling patterns...');
    
    // Find CSS/SCSS files
    const styleFiles = glob.sync(`${this.magicDir}/**/*.{css,scss,sass}`, { 
      ignore: '**/node_modules/**' 
    });
    
    // Extract Tailwind classes from components
    const tailwindClasses = new Set();
    const componentFiles = glob.sync(`${this.magicDir}/**/*.{jsx,tsx}`, { 
      ignore: '**/node_modules/**' 
    });
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const classMatches = content.matchAll(/className=["']([^"']+)["']/g);
      for (const match of classMatches) {
        match[1].split(' ').forEach(cls => tailwindClasses.add(cls));
      }
    });
    
    // Categorize styling patterns
    const stylePatterns = {
      useTailwind: tailwindClasses.size > 0,
      tailwindClasses: Array.from(tailwindClasses).slice(0, 50), // Sample
      cssFiles: styleFiles.map(f => path.relative(this.magicDir, f)),
      hasGlobalStyles: styleFiles.some(f => f.includes('global') || f.includes('app')),
      componentStyles: this.categorizeStyles(tailwindClasses)
    };
    
    this.structure.styling = stylePatterns;
    
    console.log(`  ✓ Found ${tailwindClasses.size} unique Tailwind classes`);
    console.log(`  ✓ Found ${styleFiles.length} style files`);
  }

  // Helper methods
  categorizeRoute(path) {
    if (path === '/') return 'home';
    if (path.includes('article') || path.includes('news')) return 'content';
    if (path.includes('event')) return 'events';
    if (path.includes('classified') || path.includes('marketplace')) return 'marketplace';
    if (path.includes('business')) return 'directory';
    if (path.includes('admin') || path.includes('create')) return 'admin';
    return 'other';
  }

  extractImports(content) {
    const imports = [];
    const importPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+["']([^"']+)["']/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const componentName = path.basename(importPath).replace(/\.\w+$/, '');
        imports.push(componentName);
      }
    }
    
    return imports;
  }

  extractJSXStructure(content, componentName) {
    // Simplified JSX extraction - finds main structure
    const returnPattern = new RegExp(`(?:function|const)\\s+${componentName}[\\s\\S]*?return\\s*\\([\\s\\S]*?\\)\\s*;?\\s*}`);
    const returnMatch = content.match(returnPattern);
    
    if (!returnMatch) return null;
    
    const jsx = returnMatch[0];
    const structure = [];
    
    // Extract top-level components
    const componentPattern = /<(\w+)(?:\s|>)/g;
    let match;
    const componentCounts = {};
    
    while ((match = componentPattern.exec(jsx)) !== null) {
      const comp = match[1];
      if (comp[0] === comp[0].toUpperCase() && !['React', 'Fragment'].includes(comp)) {
        componentCounts[comp] = (componentCounts[comp] || 0) + 1;
      }
    }
    
    return Object.entries(componentCounts).map(([comp, count]) => ({
      component: comp,
      count: count
    }));
  }

  extractSections(content) {
    const sections = [];
    
    // Look for section-like patterns
    const sectionPatterns = [
      /<section[^>]*>[\s\S]*?<\/section>/g,
      /<div[^>]*(?:section|container|wrapper)[^>]*>[\s\S]*?<\/div>/g
    ];
    
    sectionPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const sectionContent = match[0];
        
        // Try to identify section purpose
        let sectionType = 'generic';
        if (sectionContent.includes('hero') || sectionContent.includes('Hero')) sectionType = 'hero';
        else if (sectionContent.includes('featured') || sectionContent.includes('Featured')) sectionType = 'featured';
        else if (sectionContent.includes('sidebar') || sectionContent.includes('Sidebar')) sectionType = 'sidebar';
        else if (sectionContent.includes('grid') || sectionContent.includes('Grid')) sectionType = 'grid';
        
        sections.push(sectionType);
      }
    });
    
    return sections;
  }

  extractMockData(content) {
    const mockData = [];
    
    // Look for mock data patterns
    const patterns = [
      /const\s+(?:mock|dummy|sample|test)Data\s*=\s*(\[[\s\S]*?\])/,
      /const\s+\w*(?:mock|dummy|sample)\w*\s*=\s*({[\s\S]*?})/
    ];
    
    patterns.forEach(pattern => {
      const match = content.match(pattern);
      if (match) {
        try {
          // Try to extract data structure
          const dataStr = match[1];
          if (dataStr.includes('[')) {
            mockData.push({ type: 'array', sample: 'Multiple items' });
          } else {
            mockData.push({ type: 'object', sample: 'Single item' });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    
    return mockData;
  }

  extractProps(content, componentName) {
    const propsPattern = new RegExp(`(?:function|const)\\s+${componentName}\\s*\\(\\s*{([^}]+)}\\s*\\)`);
    const match = content.match(propsPattern);
    
    if (match) {
      return match[1].split(',').map(p => p.trim()).filter(Boolean);
    }
    
    return [];
  }

  buildComponentTree(structure) {
    if (!structure) return null;
    
    // Build a simplified tree structure
    return {
      components: structure.map(s => s.component),
      counts: structure.reduce((acc, s) => {
        acc[s.component] = s.count;
        return acc;
      }, {})
    };
  }

  hasLayoutPattern(hierarchy) {
    if (!hierarchy) return false;
    const components = hierarchy.components || [];
    return components.some(c => 
      c.includes('Layout') || c.includes('Container') || c.includes('Grid')
    );
  }

  extractLayoutPattern(hierarchy) {
    const components = hierarchy.components || [];
    const hasGrid = components.some(c => c.includes('Grid'));
    const hasContainer = components.some(c => c.includes('Container'));
    const hasSidebar = components.some(c => c.includes('Sidebar') || c.includes('Aside'));
    
    if (hasGrid && hasSidebar) return 'grid-with-sidebar';
    if (hasGrid) return 'grid-layout';
    if (hasContainer) return 'container-layout';
    return 'custom-layout';
  }

  categorizeStyles(classes) {
    const categories = {
      layout: 0,
      typography: 0,
      colors: 0,
      spacing: 0,
      interactive: 0
    };
    
    Array.from(classes).forEach(cls => {
      if (cls.includes('grid') || cls.includes('flex') || cls.includes('col')) categories.layout++;
      if (cls.includes('text') || cls.includes('font')) categories.typography++;
      if (cls.includes('bg-') || cls.includes('text-') || cls.includes('border-')) categories.colors++;
      if (cls.includes('p-') || cls.includes('m-') || cls.includes('gap')) categories.spacing++;
      if (cls.includes('hover') || cls.includes('focus') || cls.includes('active')) categories.interactive++;
    });
    
    return categories;
  }

  async generateReport() {
    const report = {
      summary: {
        totalRoutes: Object.keys(this.structure.routes).length,
        totalPages: Object.keys(this.structure.pages).length,
        totalComponents: Object.keys(this.structure.dataFlow).length,
        hasNavigation: Object.keys(this.structure.navigation).length > 0,
        usesTailwind: this.structure.styling.useTailwind
      },
      
      pageStructures: Object.entries(this.structure.pages).reduce((acc, [path, data]) => {
        acc[path] = {
          component: data.component,
          imports: data.imports,
          sections: data.sections,
          hierarchy: data.hierarchy
        };
        return acc;
      }, {}),
      
      navigation: this.structure.navigation,
      layouts: this.structure.layouts,
      dataFlow: this.structure.dataFlow,
      styling: this.structure.styling
    };
    
    // Save detailed report
    fs.writeFileSync(
      'magic-patterns-analysis.json',
      JSON.stringify(report, null, 2)
    );
    
    // Create conversion mapping
    const conversionMap = this.createConversionMap();
    fs.writeFileSync(
      'magic-patterns-conversion-map.json',
      JSON.stringify(conversionMap, null, 2)
    );
    
    console.log('\n📋 Analysis complete!');
    console.log(`   Full report: magic-patterns-analysis.json`);
    console.log(`   Conversion map: magic-patterns-conversion-map.json`);
  }

  createConversionMap() {
    const map = {
      routes: {},
      components: {},
      layouts: {}
    };
    
    // Map routes to Next.js structure
    Object.entries(this.structure.routes).forEach(([path, route]) => {
      let nextPath = path;
      if (path === '/') nextPath = 'app/page.tsx';
      else if (path.includes(':')) {
        // Dynamic routes
        nextPath = `app${path.replace(/:/g, '[').replace(/([^/]+)$/, '$1]')}/page.tsx`;
      } else {
        nextPath = `app${path}/page.tsx`;
      }
      
      map.routes[path] = {
        originalPath: path,
        nextPath: nextPath,
        component: route.component,
        category: route.category
      };
    });
    
    // Map components
    Object.entries(this.structure.pages).forEach(([path, pageData]) => {
      if (pageData.hierarchy) {
        pageData.hierarchy.components.forEach(comp => {
          if (!map.components[comp]) {
            map.components[comp] = {
              usedIn: [],
              isClient: this.structure.dataFlow[comp]?.useState > 0 || 
                       this.structure.dataFlow[comp]?.useEffect > 0
            };
          }
          map.components[comp].usedIn.push(path);
        });
      }
    });
    
    // Map layouts
    map.layouts = this.structure.layouts;
    
    return map;
  }
}

// Run analyzer
async function main() {
  const magicDir = process.argv[2] || process.env.MAGIC_PATTERNS_DIR || '../magic';
  
  if (!fs.existsSync(magicDir)) {
    console.error(`❌ Magic Patterns directory not found: ${magicDir}`);
    console.log('\nUsage: node analyze-magic-patterns-structure.js <path-to-magic-patterns>');
    process.exit(1);
  }
  
  const analyzer = new MagicPatternsAnalyzer(magicDir);
  await analyzer.analyze();
  
  // Generate rebuild script based on analysis
  console.log('\n📝 Generating rebuild script based on analysis...');
  
  const rebuildScript = `#!/bin/bash
# Auto-generated rebuild script based on Magic Patterns analysis

echo "🏗️  Rebuilding from Magic Patterns structure..."

# Apply the complete structure
node scripts/apply-magic-patterns-structure.js

# Fix component assembly based on discovered hierarchy  
node scripts/fix-page-component-assembly.js

# Setup data flow as discovered
node scripts/setup-component-data-flow.js

# Apply styling patterns
node scripts/apply-magic-patterns-styles.js

echo "✅ Rebuild complete!"
`;
  
  fs.writeFileSync('rebuild-from-analysis.sh', rebuildScript);
  fs.chmodSync('rebuild-from-analysis.sh', '755');
  
  console.log('✅ Created rebuild-from-analysis.sh');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MagicPatternsAnalyzer;