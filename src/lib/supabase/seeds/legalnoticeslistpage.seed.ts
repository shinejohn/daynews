import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const legalnoticeslistpageSeeds = [
  {
    "type": "",
    "status": "",
    "dateRange": "all",
    "location": ""
  }
]

export async function seedLegalnoticeslistpage() {
  console.log('Seeding legalnoticeslistpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('legalnoticeslistpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('legalnoticeslistpage')
    .insert(legalnoticeslistpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding legalnoticeslistpage:', error)
  } else {
    console.log('✅ Seeded 1 legalnoticeslistpage')
  }
  
  return { data, error }
}
