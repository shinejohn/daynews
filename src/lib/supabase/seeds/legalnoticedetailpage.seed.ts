import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const legalnoticedetailpageSeeds = []

export async function seedLegalnoticedetailpage() {
  console.log('Seeding legalnoticedetailpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('legalnoticedetailpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('legalnoticedetailpage')
    .insert(legalnoticedetailpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding legalnoticedetailpage:', error)
  } else {
    console.log('✅ Seeded 0 legalnoticedetailpage')
  }
  
  return { data, error }
}
