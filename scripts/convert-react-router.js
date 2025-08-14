#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load route mapping
const routeMapping = JSON.parse(fs.readFileSync('./route-mapping.json', 'utf8'));

// React Router to Next.js conversions
const CONVERSIONS = {
  imports: [
    {
      from: /import\s*{\s*BrowserRouter.*?}\s*from\s*['"]react-router-dom['"]/g,
      to: '// Next.js uses file-based routing'
    },
    {
      from: /import\s*{\s*Routes.*?}\s*from\s*['"]react-router-dom['"]/g,
      to: '// Routes handled by Next.js'
    },
    {
      from: /import\s*{\s*Route.*?}\s*from\s*['"]react-router-dom['"]/g,
      to: '// Route handled by Next.js'
    },
    {
      from: /import\s*{\s*Link\s*}\s*from\s*['"]react-router-dom['"]/g,
      to: "import Link from 'next/link'"
    },
    {
      from: /import\s*{\s*NavLink\s*}\s*from\s*['"]react-router-dom['"]/g,
      to: "import Link from 'next/link'"
    },
    {
      from: /import\s*{\s*useNavigate\s*}\s*from\s*['"]react-router-dom['"]/g,
      to: "import { useRouter } from 'next/navigation'"
    },
    {
      from: /import\s*{\s*useLocation\s*}\s*from\s*['"]react-router-dom['"]/g,
      to: "import { usePathname } from 'next/navigation'"
    },
    {
      from: /import\s*{\s*useParams\s*}\s*from\s*['"]react-router-dom['"]/g,
      to: "import { useParams } from 'next/navigation'"
    },
    {
      from: /import\s*{\s*useSearchParams\s*as\s*useRRSearchParams\s*}\s*from\s*['"]react-router-dom['"]/g,
      to: "import { useSearchParams } from 'next/navigation'"
    }
  ],
  code: [
    // Navigation
    { from: /const\s+navigate\s*=\s*useNavigate\(\)/g, to: "const router = useRouter()" },
    { from: /navigate\(/g, to: "router.push(" },
    { from: /navigate\(-1\)/g, to: "router.back()" },
    
    // Location
    { from: /const\s+location\s*=\s*useLocation\(\)/g, to: "const pathname = usePathname()" },
    { from: /location\.pathname/g, to: "pathname" },
    { from: /location\.search/g, to: "?search=" }, // Will need manual review
    { from: /location\.state/g, to: "{} /* TODO: Convert to searchParams or context */" },
    
    // Search params
    { from: /const\s*\[\s*searchParams\s*\]\s*=\s*useRRSearchParams\(\)/g, to: "const searchParams = useSearchParams()" },
    
    // Links - convert paths
    { from: /<Link\s+to="/g, to: '<Link href="' },
    { from: /<NavLink\s+to="/g, to: '<Link href="' },
  ]
};

// Convert Links to use proper Next.js paths
function convertLinkPaths(content) {
  Object.entries(routeMapping).forEach(([reactPath, mapping]) => {
    if (reactPath !== mapping.nextPath) {
      // Convert static paths
      const staticPattern = new RegExp(`(href|to)="${reactPath}"`, 'g');
      content = content.replace(staticPattern, `$1="${mapping.nextPath}"`);
      
      // Convert template literals
      const templatePattern = new RegExp(`(href|to)={\`${reactPath.replace(/:\w+/g, '\\$\\{[^}]+\\}')}\`}`, 'g');
      content = content.replace(templatePattern, (match) => {
        return match.replace(reactPath, mapping.nextPath);
      });
    }
  });
  
  return content;
}

// Process a file
function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply import conversions
  CONVERSIONS.imports.forEach(({from, to}) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // Apply code conversions
  CONVERSIONS.code.forEach(({from, to}) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  // Convert link paths
  const convertedContent = convertLinkPaths(content);
  if (convertedContent !== content) {
    content = convertedContent;
    modified = true;
  }
  
  // Add 'use client' if needed
  const needsClient = content.includes('useState') || 
                     content.includes('useEffect') || 
                     content.includes('onClick') ||
                     content.includes('useRouter');
                     
  if (needsClient && !content.includes("'use client'")) {
    content = "'use client';\n" + content;
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Updated`);
  }
}

// Process all files
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

// Find component file path
function findComponentPath(componentName) {
  const possiblePaths = [
    `./src/components/${componentName}.tsx`,
    `./src/components/${componentName}.jsx`,
    `./src/components/${componentName}/index.tsx`,
    `./src/components/${componentName}/index.jsx`,
    // Check subdirectories
    './src/components/admin',
    './src/components/ads',
    './src/components/announcements',
    './src/components/article',
    './src/components/auth',
    './src/components/business',
    './src/components/classifieds',
    './src/components/company',
    './src/components/events',
    './src/components/legal',
    './src/components/navigation',
  ];
  
  // Check direct paths first
  for (const basePath of possiblePaths.slice(0, 4)) {
    if (fs.existsSync(basePath)) {
      return basePath.replace('./src/components/', '').replace(/\.(tsx|jsx)$/, '');
    }
  }
  
  // Check subdirectories
  for (const dir of possiblePaths.slice(4)) {
    const filePath = `${dir}/${componentName}.tsx`;
    const filePathJsx = `${dir}/${componentName}.jsx`;
    if (fs.existsSync(filePath)) {
      return filePath.replace('./src/components/', '').replace(/\.tsx$/, '');
    }
    if (fs.existsSync(filePathJsx)) {
      return filePathJsx.replace('./src/components/', '').replace(/\.jsx$/, '');
    }
  }
  
  return componentName; // Default fallback
}

// Create page routes
function createPageRoutes() {
  console.log('\nCreating Next.js page routes...');
  
  Object.entries(routeMapping).forEach(([reactPath, mapping]) => {
    if (mapping.component === 'Unknown') return;
    
    const pagePath = path.join('./src/app', mapping.file);
    const pageDir = path.dirname(pagePath);
    
    // Create directory
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    
    // Skip if already exists
    if (fs.existsSync(pagePath)) {
      console.log(`  → ${mapping.file} already exists`);
      return;
    }
    
    // Find the actual component path
    const componentPath = findComponentPath(mapping.component);
    
    // Determine route type (ISR/SSR/CSR/SSG)
    let routeConfig = '';
    if (reactPath.includes('/search') || reactPath.includes('/profile') || 
        reactPath.includes('/settings') || reactPath.includes('/admin') ||
        reactPath.includes('/create') || reactPath.includes('/editor')) {
      // Client-side rendering for interactive pages
      routeConfig = "'use client';\n\n";
    } else if (reactPath.includes('/events') || reactPath.includes('/classifieds') ||
               reactPath.includes('/announcements') || reactPath.includes('/deals')) {
      // Server-side rendering for dynamic content
      routeConfig = `// SSR Configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

`;
    } else if (reactPath.includes('/about') || reactPath.includes('/privacy') ||
               reactPath.includes('/terms') || reactPath.includes('/contact')) {
      // Static generation for static content
      routeConfig = `// SSG Configuration
export const dynamic = 'force-static';
export const revalidate = false;

`;
    } else {
      // ISR for most content pages
      const revalidate = reactPath === '/' ? 60 : 3600;
      routeConfig = `// ISR Configuration
export const revalidate = ${revalidate}; // seconds
export const dynamic = 'force-static';

`;
    }
    
    // Create page content
    const pageContent = `${routeConfig}import ${mapping.component} from '@/components/${componentPath}'

export default function Page() {
  return <${mapping.component} />
}
`;
    
    fs.writeFileSync(pagePath, pageContent);
    console.log(`  ✓ Created ${mapping.file}`);
  });
}

// Main execution
console.log('Converting React Router to Next.js...\n');

// Process components
if (fs.existsSync('./src/components')) {
  processDirectory('./src/components');
}

// Process pages
if (fs.existsSync('./src/pages')) {
  processDirectory('./src/pages');
}

// Create Next.js routes
createPageRoutes();

console.log('\n✅ React Router conversion complete!');
