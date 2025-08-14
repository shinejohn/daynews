import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const aboutuspageSeeds = [
  {
    "storiesPublished": 0,
    "communitiesServed": 0,
    "readersReached": 0,
    "localBusinessesSupported": 0
  }
]

export async function seedAboutuspage() {
  console.log('Seeding aboutuspage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('aboutuspage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('aboutuspage')
    .insert(aboutuspageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding aboutuspage:', error)
  } else {
    console.log('✅ Seeded 1 aboutuspage')
  }
  
  return { data, error }
}
