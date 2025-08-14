const fs = require('fs');
const path = require('path');

// This assumes you've already generated database.types.ts
const dbTypesPath = './src/types/database.types.ts';
const hasDbTypes = fs.existsSync(dbTypesPath);

if (!hasDbTypes) {
    console.log('⚠️  No database types found. Run "npm run types" first');
}

// Read component audit
const auditPath = './docs/component-audit.md';
if (!fs.existsSync(auditPath)) {
    console.log('Run scan-components first');
    process.exit(1);
}

// Generate mapping template
const mappingContent = `import { Database } from '@/types/database.types'

// Component to Database Type Mappings
// TODO: Update these mappings based on your actual database schema

// Task related mappings
export type TaskFromDB = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// User related mappings  
export type UserFromDB = Database['public']['Tables']['users']['Row']
export type ProfileFromDB = Database['public']['Tables']['profiles']['Row']

// Add more mappings as needed...

// Component prop type generators
export function mapTaskToComponent(task: TaskFromDB) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status,
    createdAt: new Date(task.created_at),
    // Map other fields as needed
  }
}

export function mapUserToComponent(user: UserFromDB, profile?: ProfileFromDB) {
  return {
    id: user.id,
    email: user.email,
    name: profile?.full_name || 'Anonymous',
    avatar: profile?.avatar_url,
    // Map other fields as needed
  }
}

// Add more mapping functions as needed...
`;

fs.writeFileSync('./src/types/component-db-mappings.ts', mappingContent);
console.log('✅ Created type mapping file: ./src/types/component-db-mappings.ts');
