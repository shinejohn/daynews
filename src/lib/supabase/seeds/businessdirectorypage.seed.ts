import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const businessdirectorypageSeeds = [
  {
    "openNow": false,
    "deliveryAvailable": false,
    "newBusinesses": false,
    "distance": 10,
    "priceRange": [],
    "minRating": 0
  }
]

export async function seedBusinessdirectorypage() {
  console.log('Seeding businessdirectorypage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('businessdirectorypage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('businessdirectorypage')
    .insert(businessdirectorypageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding businessdirectorypage:', error)
  } else {
    console.log('✅ Seeded 1 businessdirectorypage')
  }
  
  return { data, error }
}
