import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const archivebrowserpageSeeds = [
  {
    "totalArticles": 0,
    "earliestDate": null,
    "mostActiveDay": null,
    "popularTopics": []
  }
]

export async function seedArchivebrowserpage() {
  console.log('Seeding archivebrowserpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('archivebrowserpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('archivebrowserpage')
    .insert(archivebrowserpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding archivebrowserpage:', error)
  } else {
    console.log('✅ Seeded 1 archivebrowserpage')
  }
  
  return { data, error }
}
