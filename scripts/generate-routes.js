const fs = require('fs');
const path = require('path');

// Read component audit to determine routes needed
const routes = [
    { name: 'tasks', component: 'TaskCreator' },
    { name: 'marketplace', component: 'TaskMarketplace' },
    { name: 'profile', component: 'Profile' },
    { name: 'messages', component: 'Messaging' },
    { name: 'invoices', component: 'Invoice' },
    { name: 'dashboard', component: 'Dashboard' },
];

routes.forEach(({ name, component }) => {
    const routePath = `./src/app/${name}`;
    
    // Create directory
    if (!fs.existsSync(routePath)) {
        fs.mkdirSync(routePath, { recursive: true });
    }
    
    // Generate page.tsx
    const pageContent = `import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ${component} } from '@/components/${component}'
import { get${name.charAt(0).toUpperCase() + name.slice(1)}sByUser } from '@/lib/supabase/queries/${name}.queries'
import { createServerClient } from '@/lib/supabase/server'

export default async function ${name.charAt(0).toUpperCase() + name.slice(1)}Page() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data, error } = await get${name.charAt(0).toUpperCase() + name.slice(1)}sByUser(user.id)
  
  if (error) {
    console.error('Error loading ${name}:', error)
    return <div>Error loading ${name}</div>
  }
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <${component} 
        initialData={data || []}
        userId={user.id}
      />
    </Suspense>
  )
}
`;

    fs.writeFileSync(`${routePath}/page.tsx`, pageContent);
    
    // Generate loading.tsx
    const loadingContent = `export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
}
`;

    fs.writeFileSync(`${routePath}/loading.tsx`, loadingContent);
    
    // Generate error.tsx
    const errorContent = `'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
`;

    fs.writeFileSync(`${routePath}/error.tsx`, errorContent);
});

console.log(`✅ Generated ${routes.length} routes`);
