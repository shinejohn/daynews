import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const citysearchSeeds = []

export async function seedCitysearch() {
  console.log('Seeding citysearch...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('citysearch').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('citysearch')
    .insert(citysearchSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding citysearch:', error)
  } else {
    console.log('✅ Seeded 0 citysearch')
  }
  
  return { data, error }
}
