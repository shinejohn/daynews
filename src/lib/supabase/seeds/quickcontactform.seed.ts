import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const quickcontactformSeeds = [
  {
    "name": "",
    "email": "",
    "subject": "",
    "message": "",
    "attachment": null
  }
]

export async function seedQuickcontactform() {
  console.log('Seeding quickcontactform...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('quickcontactform').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('quickcontactform')
    .insert(quickcontactformSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding quickcontactform:', error)
  } else {
    console.log('✅ Seeded 1 quickcontactform')
  }
  
  return { data, error }
}
