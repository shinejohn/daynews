import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const communitydeploymentwizardSeeds = [
  {
    "communityName": "",
    "state": "Florida",
    "population": "",
    "targetSubscribers": "",
    "dataSource": "census",
    "aiJournalists": 5
  }
]

export async function seedCommunitydeploymentwizard() {
  console.log('Seeding communitydeploymentwizard...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('communitydeploymentwizard').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('communitydeploymentwizard')
    .insert(communitydeploymentwizardSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding communitydeploymentwizard:', error)
  } else {
    console.log('✅ Seeded 1 communitydeploymentwizard')
  }
  
  return { data, error }
}
