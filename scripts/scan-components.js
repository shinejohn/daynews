const fs = require('fs');
const path = require('path');

const componentData = [];
const mockDataFound = [];

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
            scanDirectory(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            analyzeComponent(filePath);
        }
    });
}

function analyzeComponent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Extract props interface
    const propsMatch = content.match(/interface\s+\w*Props\s*{([^}]+)}/);
    const typeMatch = content.match(/type\s+\w*Props\s*=\s*{([^}]+)}/);
    
    // Look for useState with mock data
    const useStateMatches = content.matchAll(/useState\s*\(\s*(\[[\s\S]*?\]|\{[\s\S]*?\})/g);
    
    // Look for mock data constants
    const mockDataMatches = content.matchAll(/const\s+mock\w+\s*=\s*(\[[\s\S]*?\]|\{[\s\S]*?\})/g);
    
    // Look for data fetching patterns
    const fetchPatterns = content.includes('fetch(') || content.includes('axios') || content.includes('supabase');
    
    // Extract CRUD operations
    const hasCreate = content.includes('create') || content.includes('add') || content.includes('insert');
    const hasRead = content.includes('get') || content.includes('fetch') || content.includes('select');
    const hasUpdate = content.includes('update') || content.includes('edit') || content.includes('patch');
    const hasDelete = content.includes('delete') || content.includes('remove');
    
    const componentInfo = {
        name: componentName,
        path: filePath,
        props: propsMatch ? propsMatch[1].trim() : typeMatch ? typeMatch[1].trim() : null,
        hasMockData: false,
        operations: {
            create: hasCreate,
            read: hasRead,
            update: hasUpdate,
            delete: hasDelete
        },
        dataNeeds: []
    };
    
    // Process mock data
    for (const match of useStateMatches) {
        try {
            const mockData = match[1];
            if (mockData && mockData.length > 10) { // Likely has data
                componentInfo.hasMockData = true;
                mockDataFound.push({
                    component: componentName,
                    data: mockData,
                    type: 'useState'
                });
            }
        } catch (e) {}
    }
    
    for (const match of mockDataMatches) {
        try {
            mockDataFound.push({
                component: componentName,
                data: match[1],
                type: 'constant'
            });
            componentInfo.hasMockData = true;
        } catch (e) {}
    }
    
    componentData.push(componentInfo);
}

// Run the scan
scanDirectory('./src/components');

// Generate audit report
const auditReport = `# Component Data Audit

Generated: ${new Date().toISOString()}

## Components Found: ${componentData.length}

${componentData.map(comp => `
### ${comp.name}
- Path: \`${comp.path}\`
- Has Mock Data: ${comp.hasMockData ? '✅' : '❌'}
- Operations: ${Object.entries(comp.operations).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'None detected'}
${comp.props ? `- Props: \n\`\`\`typescript\n${comp.props}\n\`\`\`\n` : '- Props: None detected\n'}
`).join('\n')}

## Mock Data Summary
Total mock data instances found: ${mockDataFound.length}
`;

// Write reports
fs.writeFileSync('./docs/component-audit.md', auditReport);
fs.writeFileSync('./src/lib/mock-data/extracted-mocks.json', JSON.stringify(mockDataFound, null, 2));

console.log(`✅ Scanned ${componentData.length} components`);
console.log(`📝 Audit report: ./docs/component-audit.md`);
console.log(`📦 Mock data: ./src/lib/mock-data/extracted-mocks.json`);
