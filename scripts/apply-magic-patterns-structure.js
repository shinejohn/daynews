#!/usr/bin/env node

/**
 * Apply Magic Patterns Structure
 * Uses the analysis to rebuild pages with correct component hierarchy
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Applying Magic Patterns Structure...\n');

class StructureApplier {
  constructor() {
    this.loadAnalysis();
  }

  loadAnalysis() {
    try {
      this.analysis = JSON.parse(fs.readFileSync('magic-patterns-analysis.json', 'utf8'));
      this.conversionMap = JSON.parse(fs.readFileSync('magic-patterns-conversion-map.json', 'utf8'));
      console.log('✅ Loaded Magic Patterns analysis');
    } catch (error) {
      console.error('❌ Could not load analysis. Run analyze-magic-patterns-structure.js first');
      process.exit(1);
    }
  }

  apply() {
    console.log('📄 Rebuilding pages with discovered structure...\n');
    
    // Apply each page structure
    Object.entries(this.analysis.pageStructures).forEach(([routePath, pageData]) => {
      this.rebuildPage(routePath, pageData);
    });
    
    // Create navigation component
    this.createNavigation();
    
    // Apply layouts
    this.applyLayouts();
    
    // Create missing components
    this.createMissingComponents();
    
    console.log('\n✅ Structure applied successfully!');
  }

  rebuildPage(routePath, pageData) {
    const nextPath = this.conversionMap.routes[routePath]?.nextPath;
    if (!nextPath) return;
    
    const pagePath = path.join(process.cwd(), 'src', nextPath);
    console.log(`📝 Rebuilding ${routePath} → ${nextPath}`);
    
    // Create directory if needed
    fs.mkdirSync(path.dirname(pagePath), { recursive: true });
    
    // Generate imports based on discovered components
    const imports = this.generateImports(pageData);
    
    // Generate JSX structure based on hierarchy
    const jsxStructure = this.generateJSXStructure(pageData, routePath);
    
    // Determine rendering strategy
    const renderingStrategy = this.determineRenderingStrategy(routePath, pageData);
    
    // Generate complete page file
    const pageContent = this.generatePageFile({
      routePath,
      pageName: pageData.component,
      imports,
      jsxStructure,
      renderingStrategy,
      sections: pageData.sections
    });
    
    fs.writeFileSync(pagePath, pageContent);
    console.log(`  ✓ Created ${path.basename(nextPath)}`);
  }

  generateImports(pageData) {
    const imports = [];
    
    // Standard Next.js imports
    imports.push("import { Metadata } from 'next';");
    
    // Component imports based on hierarchy
    if (pageData.hierarchy?.components) {
      pageData.hierarchy.components.forEach(comp => {
        const importPath = this.getComponentImportPath(comp);
        imports.push(`import ${comp} from '${importPath}';`);
      });
    }
    
    // Data fetching imports if needed
    if (this.needsDataFetching(pageData)) {
      imports.push("import { fetchArticles, fetchEvents } from '@/lib/api';");
    }
    
    return imports.join('\n');
  }

  generateJSXStructure(pageData, routePath) {
    const { hierarchy, sections = [] } = pageData;
    
    // Build JSX based on discovered structure
    let jsx = '';
    
    // Determine layout pattern
    const layoutType = this.analysis.layouts[routePath] || 'default';
    
    switch (layoutType) {
      case 'grid-with-sidebar':
        jsx = this.generateGridWithSidebarLayout(hierarchy, sections);
        break;
      case 'grid-layout':
        jsx = this.generateGridLayout(hierarchy, sections);
        break;
      default:
        jsx = this.generateDefaultLayout(hierarchy, sections);
    }
    
    return jsx;
  }

  generateGridWithSidebarLayout(hierarchy, sections) {
    const components = hierarchy?.components || [];
    
    // Separate main content and sidebar components
    const mainComponents = components.filter(c => 
      !c.includes('Sidebar') && !c.includes('Aside') && !c.includes('Ad')
    );
    const sidebarComponents = components.filter(c => 
      c.includes('Sidebar') || c.includes('Aside') || c.includes('Ad') || c.includes('Trending')
    );
    
    return `    <div className="min-h-screen bg-gray-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
${mainComponents.map(comp => `            <${comp} />`).join('\n')}
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
${sidebarComponents.map(comp => `            <${comp} />`).join('\n')}
          </aside>
        </div>
      </Container>
    </div>`;
  }

  generateGridLayout(hierarchy, sections) {
    const components = hierarchy?.components || [];
    
    return `    <div className="min-h-screen bg-gray-50">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
${components.map(comp => `          <${comp} />`).join('\n')}
        </div>
      </Container>
    </div>`;
  }

  generateDefaultLayout(hierarchy, sections) {
    const components = hierarchy?.components || [];
    
    // Group by section type
    const heroComponents = components.filter(c => 
      sections.includes('hero') && (c.includes('Hero') || c.includes('Banner'))
    );
    const otherComponents = components.filter(c => !heroComponents.includes(c));
    
    return `    <div className="min-h-screen bg-gray-50">
${heroComponents.map(comp => `      <${comp} />`).join('\n')}
      
      <Container className="py-8">
        <div className="space-y-8">
${otherComponents.map(comp => `          <${comp} />`).join('\n')}
        </div>
      </Container>
    </div>`;
  }

  determineRenderingStrategy(routePath, pageData) {
    const category = this.conversionMap.routes[routePath]?.category;
    
    // Check if components need client-side
    const needsClient = pageData.hierarchy?.components.some(comp => 
      this.conversionMap.components[comp]?.isClient
    );
    
    if (needsClient) {
      return { type: 'dynamic', reason: 'Interactive components' };
    }
    
    // News content should use ISR
    if (['home', 'content', 'events'].includes(category)) {
      return { type: 'isr', revalidate: 300, reason: 'News content' };
    }
    
    // Static pages
    if (['about', 'contact', 'terms'].includes(category)) {
      return { type: 'ssg', revalidate: 86400, reason: 'Static content' };
    }
    
    return { type: 'ssr', reason: 'Default' };
  }

  generatePageFile(config) {
    const { routePath, pageName, imports, jsxStructure, renderingStrategy } = config;
    
    let renderingConfig = '';
    if (renderingStrategy.type === 'isr') {
      renderingConfig = `\nexport const revalidate = ${renderingStrategy.revalidate}; // ISR\n`;
    } else if (renderingStrategy.type === 'dynamic') {
      renderingConfig = `\nexport const dynamic = 'force-dynamic';\n`;
    }
    
    const isAsync = this.needsDataFetching({ hierarchy: { components: [] } });
    const functionDef = isAsync ? 'async function' : 'function';
    
    return `// ${pageName} - Generated from Magic Patterns analysis
${imports}

export const metadata: Metadata = {
  title: '${this.getPageTitle(routePath)} | DayNews',
  description: '${this.getPageDescription(routePath)}',
};
${renderingConfig}
export default ${functionDef} ${pageName}() {${isAsync ? `
  // Fetch data
  const [articles, events] = await Promise.all([
    fetchArticles(),
    fetchEvents()
  ]);` : ''}
  
  return (
${jsxStructure}
  );
}`;
  }

  createNavigation() {
    console.log('\n🧭 Creating navigation based on analysis...');
    
    const mainNav = this.analysis.navigation.mainNav || [];
    const navComponents = Object.entries(this.analysis.navigation)
      .filter(([key]) => key !== 'mainNav');
    
    // Find the main navigation component
    const mainNavComponent = navComponents.find(([name, data]) => data.isMainNav);
    
    if (mainNavComponent) {
      const [componentName, navData] = mainNavComponent;
      const navItems = navData.items || mainNav;
      
      // Create navigation component
      const navContent = `import Link from 'next/link';

const navigationItems = ${JSON.stringify(navItems, null, 2)};

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-8">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}`;
      
      const navPath = path.join(process.cwd(), 'src/components/navigation/Navigation.tsx');
      fs.mkdirSync(path.dirname(navPath), { recursive: true });
      fs.writeFileSync(navPath, navContent);
      console.log('  ✓ Created Navigation component');
    }
  }

  applyLayouts() {
    console.log('\n📐 Applying discovered layouts...');
    
    // Update the main layout with discovered navigation
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Add navigation import if not present
    if (!layoutContent.includes('Navigation') && this.analysis.navigation.mainNav) {
      const importStatement = "import Navigation from '@/components/navigation/Navigation';";
      layoutContent = layoutContent.replace(
        "import '../styles/globals.css';",
        `import '../styles/globals.css';\n${importStatement}`
      );
      
      // Add navigation to layout
      layoutContent = layoutContent.replace(
        '<body className={inter.className}>',
        `<body className={inter.className}>
        <Navigation />`
      );
      
      fs.writeFileSync(layoutPath, layoutContent);
      console.log('  ✓ Updated root layout with navigation');
    }
  }

  createMissingComponents() {
    console.log('\n🔧 Creating placeholder components...');
    
    const allComponents = new Set();
    
    // Collect all components from page structures
    Object.values(this.analysis.pageStructures).forEach(pageData => {
      if (pageData.hierarchy?.components) {
        pageData.hierarchy.components.forEach(comp => allComponents.add(comp));
      }
    });
    
    // Create placeholders for missing components
    allComponents.forEach(componentName => {
      const componentPath = this.getComponentPath(componentName);
      const fullPath = path.join(process.cwd(), 'src', componentPath);
      
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        
        const isClient = this.conversionMap.components[componentName]?.isClient;
        const componentContent = this.generateComponentPlaceholder(componentName, isClient);
        
        fs.writeFileSync(fullPath, componentContent);
        console.log(`  ✓ Created ${componentName}`);
      }
    });
  }

  generateComponentPlaceholder(componentName, isClient) {
    const directive = isClient ? "'use client';\n\n" : '';
    
    return `${directive}interface ${componentName}Props {
  className?: string;
}

export default function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    <section className={\`\${className} p-6 bg-white rounded-lg shadow-sm\`}>
      <h2 className="text-xl font-bold mb-4">${componentName}</h2>
      <div className="text-gray-600">
        {/* TODO: Implement ${componentName} based on Magic Patterns */}
        <p>Component content goes here</p>
      </div>
    </section>
  );
}`;
  }

  // Helper methods
  getComponentImportPath(componentName) {
    // Try to determine the component path
    const possiblePaths = [
      `@/components/${componentName}`,
      `@/components/content/${componentName}`,
      `@/components/navigation/${componentName}`,
      `@/components/layout/${componentName}`,
      `@/components/ui/${componentName}`
    ];
    
    // Check if we know the category
    if (componentName.includes('Nav') || componentName.includes('Header')) {
      return `@/components/navigation/${componentName}`;
    }
    if (componentName.includes('Layout') || componentName.includes('Container')) {
      return `@/components/layout/${componentName}`;
    }
    
    return possiblePaths[0];
  }

  getComponentPath(componentName) {
    const importPath = this.getComponentImportPath(componentName);
    return importPath.replace('@/', '') + '.tsx';
  }

  needsDataFetching(pageData) {
    // Check if any components likely need data
    const dataComponents = ['Article', 'Event', 'Featured', 'Latest', 'Recent'];
    return pageData.hierarchy?.components.some(comp => 
      dataComponents.some(dc => comp.includes(dc))
    );
  }

  getPageTitle(routePath) {
    const titles = {
      '/': 'Home',
      '/national': 'National News',
      '/sports': 'Sports',
      '/events': 'Local Events',
      '/classifieds': 'Classifieds',
      '/business-directory': 'Business Directory'
    };
    
    return titles[routePath] || 'Page';
  }

  getPageDescription(routePath) {
    const descriptions = {
      '/': 'Your trusted source for local news and community information',
      '/national': 'Breaking national news and in-depth coverage',
      '/events': 'Discover local events and community gatherings',
      '/classifieds': 'Browse local classifieds and marketplace listings'
    };
    
    return descriptions[routePath] || 'Stay connected with your community';
  }
}

// Run applier
if (require.main === module) {
  const applier = new StructureApplier();
  applier.apply();
}

module.exports = StructureApplier;