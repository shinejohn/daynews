const fs = require('fs');
const path = require('path');

/**
 * Intelligent type fixer based on scan results
 * Goal: Minimal type assertions only where absolutely needed
 */
class IntelligentTypeFixer {
  constructor() {
    this.fixCount = 0;
  }

  fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Step 1: Remove ALL excessive type assertions first
    content = this.removeExcessiveTypeAssertions(content);
    
    // Step 2: Apply minimal fixes only where needed
    content = this.applyMinimalFixes(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${path.basename(filePath)} (${this.fixCount} changes)`);
      this.fixCount = 0;
    }
  }

  removeExcessiveTypeAssertions(content) {
    // Remove 'as any' from string literals
    content = content.replace(/\('([^']+)'\s+as\s+any\)/g, (match, str) => {
      this.fixCount++;
      return `('${str}')`;
    });
    
    // Remove 'as any' from boolean values
    content = content.replace(/\b(true|false)\s+as\s+any\b/g, (match, bool) => {
      this.fixCount++;
      return bool;
    });
    
    // Remove 'as any' from numbers
    content = content.replace(/\b(\d+)\s+as\s+any\b/g, (match, num) => {
      this.fixCount++;
      return num;
    });
    
    // Remove 'as any' from simple objects where not needed
    content = content.replace(/{\s*(\w+):\s*([^}]+)\s*}\s+as\s+any/g, (match, key, value) => {
      // Only remove if it's a simple value
      if (!value.includes('as any') && !value.includes('{') && !value.includes('[')) {
        this.fixCount++;
        return `{ ${key}: ${value} }`;
      }
      return match;
    });
    
    // Clean up double 'as any' patterns
    content = content.replace(/as\s+any\s*\)\s*as\s+any/g, () => {
      this.fixCount++;
      return 'as any)';
    });
    
    // Fix syntax errors from previous fixes
    content = content.replace(/as any\)\)/g, ')');
    content = content.replace(/\(\(supabase as any\)/g, '(supabase as any');
    
    return content;
  }

  applyMinimalFixes(content) {
    // Strategy: Only add type assertions where we know they're needed
    
    // 1. Wrap the supabase client itself at the query level
    // Pattern: await supabase.from(...) => await (supabase as any).from(...)
    content = content.replace(
      /await\s+supabase\.from\(/g,
      (match) => {
        // Check if already wrapped
        if (content.includes('await (supabase as any).from(')) {
          return match;
        }
        this.fixCount++;
        return 'await (supabase as any).from(';
      }
    );
    
    // 2. For query assignments without await
    content = content.replace(
      /=\s+supabase\.from\(/g,
      (match) => {
        // Check if already wrapped
        const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 20), content.indexOf(match));
        if (beforeMatch.includes('(supabase as any)')) {
          return match;
        }
        this.fixCount++;
        return '= (supabase as any).from(';
      }
    );
    
    // 3. For client-side queries in query objects
    content = content.replace(
      /{\s*data,\s*error\s*}\s*=\s*await\s+supabase\.from\(/g,
      (match) => {
        this.fixCount++;
        return '{ data, error } = await (supabase as any).from(';
      }
    );
    
    // 4. Special case for server client usage
    content = content.replace(
      /const\s+supabase\s*=\s*await\s+createServerClient\(\)/g,
      (match) => {
        // Don't modify the client creation itself
        return match;
      }
    );
    
    // 5. Fix any remaining type depth issues by wrapping entire query chains
    // Only for specific patterns that cause issues
    const problematicPatterns = [
      '.eq(\'is_active\', true)',
      '.eq(\'is_active\', false)',
      '.or(',
      '.in(',
      '.contains(',
      '.containedBy('
    ];
    
    for (const pattern of problematicPatterns) {
      if (content.includes(pattern) && !content.includes('as any)')) {
        // Find query chains with these patterns
        const regex = new RegExp(`(await\\s+\\(?supabase[^;\\n]+${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^;\\n]+)`, 'g');
        content = content.replace(regex, (match) => {
          // Only wrap if not already wrapped
          if (!match.includes('as any)')) {
            this.fixCount++;
            return `(${match} as any)`;
          }
          return match;
        });
      }
    }
    
    return content;
  }

  processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
        this.processDirectory(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && 
                 file.includes('queries')) {
        this.fixFile(filePath);
      }
    }
  }
}

console.log('Starting intelligent type fixer...\n');
const fixer = new IntelligentTypeFixer();

// Process queries directory
fixer.processDirectory(path.join(__dirname, '..', 'src', 'lib', 'supabase'));

console.log('\nIntelligent fixing complete!');