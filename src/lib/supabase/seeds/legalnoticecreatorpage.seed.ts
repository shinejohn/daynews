import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const legalnoticecreatorpageSeeds = [
  {
    "legal": false,
    "public": false,
    "authority": false
  }
]

export async function seedLegalnoticecreatorpage() {
  console.log('Seeding legalnoticecreatorpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('legalnoticecreatorpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('legalnoticecreatorpage')
    .insert(legalnoticecreatorpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding legalnoticecreatorpage:', error)
  } else {
    console.log('✅ Seeded 1 legalnoticecreatorpage')
  }
  
  return { data, error }
}
