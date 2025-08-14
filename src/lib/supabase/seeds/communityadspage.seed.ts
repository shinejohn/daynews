import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const communityadspageSeeds = [
  {
    "title": "",
    "image": null,
    "bodyText": "",
    "callToAction": "Learn More",
    "destinationUrl": ""
  }
]

export async function seedCommunityadspage() {
  console.log('Seeding communityadspage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('communityadspage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('communityadspage')
    .insert(communityadspageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding communityadspage:', error)
  } else {
    console.log('✅ Seeded 1 communityadspage')
  }
  
  return { data, error }
}
