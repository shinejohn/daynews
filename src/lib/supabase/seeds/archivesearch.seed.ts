import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const archivesearchSeeds = [
  {
    "start": "",
    "end": ""
  }
]

export async function seedArchivesearch() {
  console.log('Seeding archivesearch...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('archivesearch').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('archivesearch')
    .insert(archivesearchSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding archivesearch:', error)
  } else {
    console.log('✅ Seeded 1 archivesearch')
  }
  
  return { data, error }
}
