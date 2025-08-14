const fs = require('fs');

console.log('🔧 Fixing route-to-table mappings...\n');

const mappings = [
  // Fix business route to use businesses table
  {
    file: 'src/app/business/page.tsx',
    oldTable: 'business',
    newTable: 'businesses'
  },
  // Fix article route to use news table
  {
    file: 'src/app/article/[slug]/page.tsx',
    oldTable: 'articles',
    newTable: 'news',
    whereClause: ".eq('slug', params.slug)"
  },
  // Fix authors to use virtual_journalists
  {
    file: 'src/app/authors/page.tsx',
    oldTable: 'authors',
    newTable: 'virtual_journalists'
  },
  // Fix profile to use users
  {
    file: 'src/app/profile/page.tsx',
    oldTable: 'profiles',
    newTable: 'users'
  }
];

mappings.forEach(({ file, oldTable, newTable, whereClause }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace table name
    content = content.replace(
      new RegExp(`\\.from\\(['"\`]${oldTable}['"\`]\\)`, 'g'),
      `.from('${newTable}')`
    );
    
    // Add where clause if needed
    if (whereClause && !content.includes(whereClause)) {
      content = content.replace(
        `.from('${newTable}')`,
        `.from('${newTable}')${whereClause}`
      );
    }
    
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed ${file}: ${oldTable} → ${newTable}`);
  }
});

// Update category pages to use news table
const categoryPages = ['sports', 'opinion', 'life', 'national'];
categoryPages.forEach(category => {
  const file = `src/app/${category}/page.tsx`;
  if (fs.existsSync(file)) {
    const content = `import { ${category.charAt(0).toUpperCase() + category.slice(1)}Page } from '@/components/${category}/${category.charAt(0).toUpperCase() + category.slice(1)}Page'
import { createServerClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServerClient()
  
  const { data: articles } = await supabase
    .from('news')
    .select('*, author:virtual_journalists(*), community:communities(*)')
    .eq('category', '${category}')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)
    
  return <${category.charAt(0).toUpperCase() + category.slice(1)}Page articles={articles || []} />
}
`;
    fs.writeFileSync(file, content);
    console.log(`✅ Updated ${category} page to use news table`);
  }
});

console.log('\n✅ Route mappings fixed!');
