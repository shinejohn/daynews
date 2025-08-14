const fs = require('fs');

console.log('🔧 Restoring deleted routes...\n');

const deletedRoutes = [
  {
    path: 'classifieds',
    subRoutes: ['[id]', 'post', 'payment', 'confirmation', 'communities', 'timeframe', 'rerun'],
    component: 'ClassifiedsPage'
  },
  {
    path: 'legal',
    subRoutes: ['[id]', 'create'],
    component: 'LegalNoticesListPage'
  },
  {
    path: 'memorials',
    subRoutes: ['[id]'],
    component: 'MemorialsPage'
  },
  {
    path: 'archive',
    subRoutes: [],
    component: 'ArchiveBrowserPage'
  },
  {
    path: 'photos',
    subRoutes: ['[id]', 'upload'],
    component: 'PhotoGalleryPage'
  }
];

deletedRoutes.forEach(({ path, subRoutes, component }) => {
  // Create main route
  const mainPath = `src/app/${path}`;
  fs.mkdirSync(mainPath, { recursive: true });
  
  // Create main page
  const pageContent = `import { ${component} } from '@/components/${component}'

export default function Page() {
  return <${component} />
}
`;
  
  fs.writeFileSync(`${mainPath}/page.tsx`, pageContent);
  console.log(`✅ Restored /${path}`);
  
  // Create sub-routes
  subRoutes.forEach(sub => {
    const subPath = `${mainPath}/${sub}`;
    fs.mkdirSync(subPath, { recursive: true });
    
    // Determine component name
    let subComponent = component;
    if (sub === 'create') subComponent = component.replace('List', 'Creator').replace('Page', 'Page');
    if (sub === '[id]') subComponent = component.replace('List', 'Detail').replace('sPage', 'Page');
    if (sub === 'post') subComponent = 'PostListingPage';
    if (sub === 'upload') subComponent = 'PhotoUploadPage';
    if (sub === 'payment') subComponent = 'PaymentPage';
    if (sub === 'confirmation') subComponent = 'ConfirmationPage';
    
    const subPageContent = sub.includes('[') ? 
`import { ${subComponent} } from '@/components/${subComponent}'

export default function Page({ params }: { params: { id: string } }) {
  return <${subComponent} />
}
` :
`'use client'

import { ${subComponent} } from '@/components/${subComponent}'

export default function Page() {
  return <${subComponent} />
}
`;
    
    fs.writeFileSync(`${subPath}/page.tsx`, subPageContent);
    console.log(`   ✅ Restored /${path}/${sub}`);
  });
});

console.log('\n🎉 All deleted routes have been restored!');
console.log('\n📝 Next steps:');
console.log('1. Run the SQL script to create missing tables');
console.log('2. Generate new types: npm run types');
console.log('3. Update routes to use proper SSR/CSR based on components');
