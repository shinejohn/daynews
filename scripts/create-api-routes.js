const fs = require('fs');

const apiRoutes = [
  'articles',
  'events', 
  'classifieds',
  'announcements',
  'photos',
  'coupons',
  'legal-notices',
  'auth',
  'upload'
];

apiRoutes.forEach(route => {
  const dir = `src/app/api/${route}`;
  fs.mkdirSync(dir, { recursive: true });
  
  const routeContent = `import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('${route.replace('-', '_')}')
    .select('*')
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('${route.replace('-', '_')}')
    .insert(body)
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}
`;
  
  fs.writeFileSync(`${dir}/route.ts`, routeContent);
  console.log(`✅ Created API route: /api/${route}`);
});
