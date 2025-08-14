import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const targetcommunitiesSeeds = [
  {
    "category": "",
    "size": "",
    "engagement": "",
    "priceRange": [
      5,
      100
    ]
  }
]

export async function seedTargetcommunities() {
  console.log('Seeding targetcommunities...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('targetcommunities').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('targetcommunities')
    .insert(targetcommunitiesSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding targetcommunities:', error)
  } else {
    console.log('✅ Seeded 1 targetcommunities')
  }
  
  return { data, error }
}
