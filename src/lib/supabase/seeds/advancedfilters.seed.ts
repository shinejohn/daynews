import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const advancedfiltersSeeds = [
  {
    "price": true,
    "condition": true,
    "distance": true,
    "posted": true,
    "other": true
  }
]

export async function seedAdvancedfilters() {
  console.log('Seeding advancedfilters...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('advancedfilters').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('advancedfilters')
    .insert(advancedfiltersSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding advancedfilters:', error)
  } else {
    console.log('✅ Seeded 1 advancedfilters')
  }
  
  return { data, error }
}
