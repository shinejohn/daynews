import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const sidepanelSeeds = [
  {
    "keyword": false,
    "description": false,
    "url": false,
    "wordCount": false,
    "images": false
  }
]

export async function seedSidepanel() {
  console.log('Seeding sidepanel...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('sidepanel').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('sidepanel')
    .insert(sidepanelSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding sidepanel:', error)
  } else {
    console.log('✅ Seeded 1 sidepanel')
  }
  
  return { data, error }
}
