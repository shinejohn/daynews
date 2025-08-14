const fs = require('fs');
const path = require('path');

function generateComponentWrapper(componentName, tableName) {
    const singular = tableName.slice(0, -1);
    const capitalized = singular.charAt(0).toUpperCase() + singular.slice(1);
    
    return `'use client'

import { ${componentName} as Original${componentName} } from './${componentName}.original'
import { use${capitalized}s, useCreate${capitalized}, useUpdate${capitalized}, useDelete${capitalized} } from '@/hooks/queries'

export function ${componentName}({ userId }: { userId?: string }) {
  const { data, isLoading, error } = use${capitalized}s()
  const createMutation = useCreate${capitalized}()
  const updateMutation = useUpdate${capitalized}()
  const deleteMutation = useDelete${capitalized}()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Original${componentName}
      data={data || []}
      onAdd={createMutation.mutate}
      onUpdate={updateMutation.mutate}
      onDelete={deleteMutation.mutate}
      isCreating={createMutation.isPending}
      isUpdating={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  )
}
`;
}

// Map components to their likely table names
const componentTableMap = {
    'TaskCreator': 'tasks',
    'TaskReport': 'tasks',
    'TaskMarketplace': 'marketplace_items',
    'Dashboard': 'tasks',
    'Invoice': 'invoices',
    'Payment': 'payments',
    'Messaging': 'messages',
    'Profile': 'profiles'
};

Object.entries(componentTableMap).forEach(([component, table]) => {
    const componentPath = `./src/components/${component}.tsx`;
    if (fs.existsSync(componentPath)) {
        // Rename original
        fs.renameSync(componentPath, `./src/components/${component}.original.tsx`);
        // Create wrapper
        fs.writeFileSync(componentPath, generateComponentWrapper(component, table));
        console.log(`✅ Created wrapper for ${component}`);
    }
});

console.log('\n📝 Next: Update the .original.tsx files to accept props');
