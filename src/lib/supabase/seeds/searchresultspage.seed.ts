import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const searchresultspageSeeds = [
  "farmers market",
  "school board meeting",
  "road construction",
  "local elections",
  "community events"
]

export async function seedSearchresultspage() {
  console.log('Seeding searchresultspage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('searchresultspage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('searchresultspage')
    .insert(searchresultspageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding searchresultspage:', error)
  } else {
    console.log('✅ Seeded 1 searchresultspage')
  }
  
  return { data, error }
}
