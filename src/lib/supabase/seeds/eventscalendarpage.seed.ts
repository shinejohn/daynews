import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const eventscalendarpageSeeds = []

export async function seedEventscalendarpage() {
  console.log('Seeding eventscalendarpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('eventscalendarpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('eventscalendarpage')
    .insert(eventscalendarpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding eventscalendarpage:', error)
  } else {
    console.log('✅ Seeded 0 eventscalendarpage')
  }
  
  return { data, error }
}
