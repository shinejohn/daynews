import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const selectcommunitiespageSeeds = []

export async function seedSelectcommunitiespage() {
  console.log('Seeding selectcommunitiespage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('selectcommunitiespage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('selectcommunitiespage')
    .insert(selectcommunitiespageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding selectcommunitiespage:', error)
  } else {
    console.log('✅ Seeded 0 selectcommunitiespage')
  }
  
  return { data, error }
}
