import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const announcementcreatorpageSeeds = [
  {
    "title": "",
    "content": "",
    "category": "",
    "location": "",
    "eventDate": "",
    "image": null
  }
]

export async function seedAnnouncementcreatorpage() {
  console.log('Seeding announcementcreatorpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('announcementcreatorpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('announcementcreatorpage')
    .insert(announcementcreatorpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding announcementcreatorpage:', error)
  } else {
    console.log('✅ Seeded 1 announcementcreatorpage')
  }
  
  return { data, error }
}
