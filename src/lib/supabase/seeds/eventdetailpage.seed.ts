import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const eventdetailpageSeeds = [
  {
    "helpful": 42,
    "love": 27,
    "attending": 68
  }
]

export async function seedEventdetailpage() {
  console.log('Seeding eventdetailpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('eventdetailpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('eventdetailpage')
    .insert(eventdetailpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding eventdetailpage:', error)
  } else {
    console.log('✅ Seeded 1 eventdetailpage')
  }
  
  return { data, error }
}
