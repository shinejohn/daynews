import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const postlistingpageSeeds = [
  {
    "title": "",
    "category": "",
    "subcategory": "",
    "price": "",
    "description": "",
    "location": "",
    "images": []
  }
]

export async function seedPostlistingpage() {
  console.log('Seeding postlistingpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('postlistingpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('postlistingpage')
    .insert(postlistingpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding postlistingpage:', error)
  } else {
    console.log('✅ Seeded 1 postlistingpage')
  }
  
  return { data, error }
}
