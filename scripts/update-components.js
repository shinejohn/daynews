const fs = require('fs');
const path = require('path');

function updateComponent(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Remove mock data constants
    content = content.replace(/const\s+mock\w+\s*=\s*[\s\S]*?(?=\n\n|\nexport|\nconst|\nfunction)/g, '');
    
    // Replace useState with mock data to use props
    content = content.replace(/const\s*\[\s*(\w+)\s*,\s*set\w+\s*\]\s*=\s*useState\s*\(\s*mock\w+\s*\)/g, 
        (match, stateName) => {
            // Add to props interface if not exists
            return `// TODO: Receive ${stateName} from props instead of mock data\n  const ${stateName} = props.${stateName} || []`;
        }
    );
    
    // Add TODO comments for data integration
    if (content !== originalContent) {
        const todoComment = `// TODO: This component has been updated to remove mock data
// Please update the props interface to receive data from parent components
// See the generated hooks in src/hooks/queries for data fetching\n\n`;
        
        content = todoComment + content;
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${componentName}`);
        return true;
    }
    
    return false;
}

function scanAndUpdate(dir) {
    const files = fs.readdirSync(dir);
    let updatedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
            updatedCount += scanAndUpdate(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            if (updateComponent(filePath)) {
                updatedCount++;
            }
        }
    });
    
    return updatedCount;
}

const updated = scanAndUpdate('./src/components');
console.log(`✅ Updated ${updated} components to remove mock data`);
