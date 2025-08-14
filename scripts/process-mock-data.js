const fs = require('fs');
const path = require('path');

// Read the extracted mocks
const mocksPath = './src/lib/mock-data/extracted-mocks.json';
if (!fs.existsSync(mocksPath)) {
    console.log('No mock data found. Run scan-components first.');
    process.exit(1);
}

const mocks = JSON.parse(fs.readFileSync(mocksPath, 'utf8'));

// Group by likely table names
const tables = {};

mocks.forEach(mock => {
    // Try to determine table name from component name
    let tableName = mock.component.toLowerCase();
    
    // Common patterns
    if (tableName.includes('task')) tableName = 'tasks';
    else if (tableName.includes('user')) tableName = 'users';
    else if (tableName.includes('invoice')) tableName = 'invoices';
    else if (tableName.includes('payment')) tableName = 'payments';
    else if (tableName.includes('message')) tableName = 'messages';
    else if (tableName.includes('chat')) tableName = 'chats';
    else if (tableName.includes('profile')) tableName = 'profiles';
    else if (tableName.includes('marketplace')) tableName = 'marketplace_items';
    
    if (!tables[tableName]) {
        tables[tableName] = [];
    }
    
    try {
        // Clean up the data string and try to parse it
        let dataStr = mock.data
            .replace(/useState\s*\(/, '')
            .replace(/\)$/, '')
            .replace(/'/g, '"')
            .replace(/(\w+):/g, '"$1":')
            .replace(/,\s*}/, '}')
            .replace(/,\s*]/, ']');
            
        const data = eval(`(${dataStr})`);
        tables[tableName].push({
            source: mock.component,
            data: data
        });
    } catch (e) {
        console.log(`Could not parse data from ${mock.component}`);
    }
});

// Generate seed files
Object.entries(tables).forEach(([tableName, data]) => {
    const seedContent = `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const ${tableName}Seeds = ${JSON.stringify(data.map(d => d.data).flat(), null, 2)}

export async function seed${tableName.charAt(0).toUpperCase() + tableName.slice(1)}() {
  console.log('Seeding ${tableName}...')
  
  // Clear existing data (optional)
  // await supabase.from('${tableName}').delete().neq('id', 0)
  
  const { data, error } = await supabase
    .from('${tableName}')
    .insert(${tableName}Seeds)
    .select()
    
  if (error) {
    console.error('Error seeding ${tableName}:', error)
  } else {
    console.log('✅ Seeded ${data?.length || 0} ${tableName}')
  }
  
  return { data, error }
}
`;

    fs.writeFileSync(`./src/lib/supabase/seeds/${tableName}.seed.ts`, seedContent);
});

console.log(`✅ Generated seed files for ${Object.keys(tables).length} tables`);
