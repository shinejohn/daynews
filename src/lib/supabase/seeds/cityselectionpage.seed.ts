import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const cityselectionpageSeeds = []

export async function seedCityselectionpage() {
  console.log('Seeding cityselectionpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('cityselectionpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('cityselectionpage')
    .insert(cityselectionpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding cityselectionpage:', error)
  } else {
    console.log('✅ Seeded 0 cityselectionpage')
  }
  
  return { data, error }
}
