const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing components for optimal rendering strategy...\n');
console.log('Default: SSR (for SEO - this is a newspaper!)\n');

// Patterns that REQUIRE Client-Side Rendering
const CSR_PATTERNS = {
  hooks: [
    'useState',
    'useEffect',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext',
    'useLayoutEffect'
  ],
  
  events: [
    'onClick',
    'onChange',
    'onSubmit',
    'onKeyDown',
    'onKeyUp',
    'onMouseOver',
    'onDrag',
    'onDrop'
  ],
  
  apis: [
    'localStorage',
    'sessionStorage',
    'window.',
    'document.',
    'navigator.'
  ],
  
  features: [
    'FileReader',
    'FormData',
    'WebSocket',
    'EventSource'
  ],
  
  // Component names that suggest interactivity
  namePatterns: [
    'Modal',
    'Dropdown',
    'Carousel',
    'Slider',
    'Toggle',
    'Tabs',
    'Accordion',
    'Editor',
    'Creator',
    'Upload',
    'Payment',
    'Selector',
    'Wizard',
    'Calendar',
    'Dashboard',
    'Admin',
    'Settings'
  ]
};

// Analyze all components
const components = fs.readFileSync('components-list.txt', 'utf8')
  .split('\n')
  .filter(Boolean);

const analysis = [];

components.forEach(componentPath => {
  const content = fs.readFileSync(componentPath, 'utf8');
  const fileName = path.basename(componentPath, '.tsx');
  
  let shouldBeCSR = false;
  const reasons = [];
  
  // Check for React hooks
  CSR_PATTERNS.hooks.forEach(hook => {
    if (content.includes(hook)) {
      shouldBeCSR = true;
      reasons.push(`Uses ${hook}`);
    }
  });
  
  // Check for event handlers
  CSR_PATTERNS.events.forEach(event => {
    if (content.includes(event)) {
      shouldBeCSR = true;
      reasons.push(`Has ${event} handler`);
    }
  });
  
  // Check for browser APIs
  CSR_PATTERNS.apis.forEach(api => {
    if (content.includes(api)) {
      shouldBeCSR = true;
      reasons.push(`Uses browser API: ${api}`);
    }
  });
  
  // Check for client-only features
  CSR_PATTERNS.features.forEach(feature => {
    if (content.includes(feature)) {
      shouldBeCSR = true;
      reasons.push(`Uses ${feature}`);
    }
  });
  
  // Check component name patterns
  CSR_PATTERNS.namePatterns.forEach(pattern => {
    if (fileName.includes(pattern)) {
      shouldBeCSR = true;
      reasons.push(`Name suggests interactivity: ${pattern}`);
    }
  });
  
  // Special cases for news site - these should usually be SSR
  const newsSSRPatterns = [
    'Page',
    'Detail',
    'List',
    'Article',
    'News',
    'Story',
    'Opinion',
    'Sports',
    'Gallery'
  ];
  
  // Override CSR if it's a main content page
  if (newsSSRPatterns.some(pattern => fileName.includes(pattern))) {
    // But still check if it truly needs CSR
    const hasStrongCSRIndicator = 
      reasons.some(r => r.includes('useState') || r.includes('useEffect')) ||
      fileName.includes('Create') ||
      fileName.includes('Admin') ||
      fileName.includes('Upload');
    
    if (!hasStrongCSRIndicator) {
      shouldBeCSR = false;
      reasons.push('Main content page - forcing SSR for SEO');
    }
  }
  
  analysis.push({
    file: componentPath,
    name: fileName,
    rendering: shouldBeCSR ? 'csr' : 'ssr',
    reasons: reasons.length > 0 ? reasons : ['Default SSR for SEO']
  });
});

// Generate report
const report = `# Smart Rendering Analysis Report

Generated: ${new Date().toISOString()}

## Principle: Default to SSR for newspaper SEO!

## Summary
- Total components: ${components.length}
- SSR components: ${analysis.filter(a => a.rendering === 'ssr').length}
- CSR components: ${analysis.filter(a => a.rendering === 'csr').length}

## Component Analysis

### SSR Components (Good for SEO)
${analysis.filter(a => a.rendering === 'ssr').map(a => 
  `- ${a.name}: ${a.reasons.join(', ')}`
).join('\n')}

### CSR Components (Interactive)
${analysis.filter(a => a.rendering === 'csr').map(a => 
  `- ${a.name}: ${a.reasons.join(', ')}`
).join('\n')}
`;

fs.writeFileSync('SMART_RENDERING_ANALYSIS.md', report);

// Also create a script to update components
const updateScript = `const fs = require('fs');

// Updates based on smart analysis
const updates = ${JSON.stringify(analysis, null, 2)};

updates.forEach(({file, rendering}) => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = \`// ssr-csr=\${rendering}\\n\${content.replace(/\\/\\/ ssr-csr=\\w+\\n/, '')}\`;
  fs.writeFileSync(file, newContent);
  console.log(\`Updated \${file} -> \${rendering}\`);
});
`;

fs.writeFileSync('apply-smart-rendering.js', updateScript);

console.log('✅ Analysis complete!');
console.log(`📊 Report: SMART_RENDERING_ANALYSIS.md`);
console.log(`🔧 To apply: node apply-smart-rendering.js`);

// Show summary
console.log('\n📈 Quick Summary:');
console.log(`   SSR (SEO-friendly): ${analysis.filter(a => a.rendering === 'ssr').length}`);
console.log(`   CSR (Interactive): ${analysis.filter(a => a.rendering === 'csr').length}`);
