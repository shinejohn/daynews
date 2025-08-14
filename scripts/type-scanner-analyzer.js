const fs = require('fs');
const path = require('path');

class TypeScanner {
  constructor() {
    this.databaseTypes = this.loadDatabaseTypes();
    this.queryUsage = {};
    this.issues = [];
    this.corrections = [];
  }

  loadDatabaseTypes() {
    const typesPath = path.join(__dirname, '..', 'src', 'types', 'database.types.ts');
    const content = fs.readFileSync(typesPath, 'utf8');
    const types = {};
    
    // Extract tables and their columns
    const tableRegex = /(\w+):\s*{\s*Row:\s*{([^}]+)}/g;
    let match;
    
    while ((match = tableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const columnsContent = match[2];
      const columns = {};
      
      // Extract column definitions
      const columnRegex = /(\w+)(\?)?\s*:\s*([^;]+);/g;
      let colMatch;
      
      while ((colMatch = columnRegex.exec(columnsContent)) !== null) {
        const columnName = colMatch[1];
        const isOptional = colMatch[2] === '?';
        const columnType = colMatch[3].trim();
        
        columns[columnName] = {
          type: columnType,
          optional: isOptional
        };
      }
      
      types[tableName] = {
        columns,
        exists: true
      };
    }
    
    return types;
  }

  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    
    // Scan for table usage
    const fromRegex = /\.from\(['"]([\w_]+)['"]\)/g;
    let match;
    
    while ((match = fromRegex.exec(content)) !== null) {
      const tableName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      if (!this.queryUsage[tableName]) {
        this.queryUsage[tableName] = [];
      }
      
      this.queryUsage[tableName].push({
        file: relPath,
        line: lineNum,
        context: this.getContext(content, match.index)
      });
      
      // Check if table exists
      if (!this.databaseTypes[tableName]) {
        this.issues.push({
          type: 'MISSING_TABLE',
          table: tableName,
          file: relPath,
          line: lineNum,
          message: `Table '${tableName}' not found in database types`
        });
      }
    }
    
    // Scan for column usage in various methods
    this.scanColumnUsage(content, relPath, '.eq');
    this.scanColumnUsage(content, relPath, '.neq');
    this.scanColumnUsage(content, relPath, '.gt');
    this.scanColumnUsage(content, relPath, '.gte');
    this.scanColumnUsage(content, relPath, '.lt');
    this.scanColumnUsage(content, relPath, '.lte');
    this.scanColumnUsage(content, relPath, '.order');
    this.scanColumnUsage(content, relPath, '.select');
    
    // Scan for type assertion patterns
    this.scanTypeAssertions(content, relPath);
  }

  scanColumnUsage(content, filePath, method) {
    const regex = new RegExp(`\\${method}\\(['"]([\w_]+)['"]`, 'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const columnName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      // Find which table this query is for
      const tableMatch = this.findNearestTable(content, match.index);
      if (tableMatch && this.databaseTypes[tableMatch]) {
        const table = this.databaseTypes[tableMatch];
        if (!table.columns[columnName] && columnName !== '*') {
          this.issues.push({
            type: 'MISSING_COLUMN',
            table: tableMatch,
            column: columnName,
            file: filePath,
            line: lineNum,
            method: method,
            message: `Column '${columnName}' not found in table '${tableMatch}'`
          });
        }
      }
    }
  }

  scanTypeAssertions(content, filePath) {
    // Find excessive type assertions
    const asAnyRegex = /as\s+any/g;
    const matches = [...content.matchAll(asAnyRegex)];
    
    if (matches.length > 5) {
      this.issues.push({
        type: 'EXCESSIVE_TYPE_ASSERTIONS',
        file: filePath,
        count: matches.length,
        message: `File has ${matches.length} 'as any' assertions - consider reducing`
      });
    }
    
    // Find problematic patterns
    const problematicPatterns = [
      { pattern: /as any\s*\)\s*as any/g, name: 'double as any' },
      { pattern: /as any\.from/g, name: 'incorrect syntax' },
      { pattern: /\(\s*true\s+as\s+any\s*\)/g, name: 'unnecessary boolean casting' },
      { pattern: /\(\s*false\s+as\s+any\s*\)/g, name: 'unnecessary boolean casting' },
      { pattern: /\('[^']+'\s+as\s+any\)/g, name: 'unnecessary string casting' }
    ];
    
    for (const { pattern, name } of problematicPatterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        this.issues.push({
          type: 'PROBLEMATIC_PATTERN',
          file: filePath,
          pattern: name,
          count: matches.length,
          message: `Found ${matches.length} instances of ${name}`
        });
      }
    }
  }

  findNearestTable(content, position) {
    // Look backwards for the nearest .from('table') call
    const beforeContent = content.substring(0, position);
    const fromMatches = [...beforeContent.matchAll(/\.from\(['"]([\w_]+)['"]\)/g)];
    
    if (fromMatches.length > 0) {
      return fromMatches[fromMatches.length - 1][1];
    }
    
    return null;
  }

  getContext(content, position, contextSize = 50) {
    const start = Math.max(0, position - contextSize);
    const end = Math.min(content.length, position + contextSize);
    return content.substring(start, end).replace(/\n/g, ' ');
  }

  generateCorrections() {
    // Generate correction suggestions
    for (const issue of this.issues) {
      switch (issue.type) {
        case 'MISSING_TABLE':
          this.corrections.push({
            file: issue.file,
            type: 'ADD_TABLE_TYPE',
            table: issue.table,
            suggestion: `Add '${issue.table}' table to database.types.ts`
          });
          break;
          
        case 'MISSING_COLUMN':
          this.corrections.push({
            file: issue.file,
            type: 'ADD_COLUMN_TYPE',
            table: issue.table,
            column: issue.column,
            suggestion: `Add '${issue.column}' column to '${issue.table}' table in database.types.ts`
          });
          break;
          
        case 'EXCESSIVE_TYPE_ASSERTIONS':
          this.corrections.push({
            file: issue.file,
            type: 'REDUCE_TYPE_ASSERTIONS',
            suggestion: `Refactor to reduce 'as any' usage from ${issue.count} instances`
          });
          break;
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        tablesScanned: Object.keys(this.queryUsage).length,
        tablesInTypes: Object.keys(this.databaseTypes).length,
        totalIssues: this.issues.length,
        corrections: this.corrections.length
      },
      databaseTypes: this.databaseTypes,
      queryUsage: this.queryUsage,
      issues: this.issues,
      corrections: this.corrections
    };
    
    return report;
  }

  saveReport(outputPath) {
    const report = this.generateReport();
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    // Also create a human-readable summary
    const summary = this.generateHumanReadableSummary(report);
    fs.writeFileSync(outputPath.replace('.json', '.md'), summary);
  }

  generateHumanReadableSummary(report) {
    let summary = `# Type Scanner Report\n\n`;
    summary += `Generated: ${report.timestamp}\n\n`;
    
    summary += `## Summary\n`;
    summary += `- Tables in queries: ${report.summary.tablesScanned}\n`;
    summary += `- Tables in types: ${report.summary.tablesInTypes}\n`;
    summary += `- Total issues: ${report.summary.totalIssues}\n`;
    summary += `- Suggested corrections: ${report.summary.corrections}\n\n`;
    
    summary += `## Issues by Type\n\n`;
    
    const issuesByType = {};
    for (const issue of report.issues) {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    }
    
    for (const [type, issues] of Object.entries(issuesByType)) {
      summary += `### ${type} (${issues.length})\n\n`;
      for (const issue of issues.slice(0, 5)) { // Show first 5
        summary += `- ${issue.message} (${issue.file}:${issue.line || 'N/A'})\n`;
      }
      if (issues.length > 5) {
        summary += `- ... and ${issues.length - 5} more\n`;
      }
      summary += '\n';
    }
    
    summary += `## Corrections Needed\n\n`;
    
    const correctionsByType = {};
    for (const correction of report.corrections) {
      if (!correctionsByType[correction.type]) {
        correctionsByType[correction.type] = [];
      }
      correctionsByType[correction.type].push(correction);
    }
    
    for (const [type, corrections] of Object.entries(correctionsByType)) {
      summary += `### ${type}\n\n`;
      for (const correction of corrections.slice(0, 10)) {
        summary += `- ${correction.suggestion}\n`;
      }
      if (corrections.length > 10) {
        summary += `- ... and ${corrections.length - 10} more\n`;
      }
      summary += '\n';
    }
    
    return summary;
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
        this.scanDirectory(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && 
                 (file.includes('queries') || file.includes('supabase'))) {
        console.log(`Scanning: ${path.relative(path.join(__dirname, '..'), filePath)}`);
        this.scanFile(filePath);
      }
    }
  }
}

// Run the scanner
console.log('Starting type scanner...\n');
const scanner = new TypeScanner();

// Scan the queries directory
scanner.scanDirectory(path.join(__dirname, '..', 'src', 'lib', 'supabase'));

// Generate corrections
scanner.generateCorrections();

// Save report
const reportPath = path.join(__dirname, '..', 'type-scan-report.json');
scanner.saveReport(reportPath);

console.log(`\nType scan complete!`);
console.log(`Report saved to: ${reportPath}`);
console.log(`Human-readable summary: ${reportPath.replace('.json', '.md')}`);

// Show quick summary
const report = scanner.generateReport();
console.log(`\nQuick Summary:`);
console.log(`- ${report.summary.totalIssues} issues found`);
console.log(`- ${report.summary.corrections} corrections suggested`);

// Show top issues
const issueTypes = {};
for (const issue of report.issues) {
  issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
}

console.log(`\nTop issue types:`);
for (const [type, count] of Object.entries(issueTypes)) {
  console.log(`- ${type}: ${count}`);
}