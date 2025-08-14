import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const eventcreatorpageSeeds = [
  {
    "title": "",
    "description": "",
    "category": "community",
    "startDate": "",
    "startTime": "",
    "endDate": "",
    "endTime": "",
    "location": "Clearwater, FL",
    "address": "",
    "isVirtual": false,
    "virtualLink": "",
    "ticketPrice": "",
    "ticketType": "free",
    "maxAttendees": "",
    "contactEmail": "",
    "contactPhone": "",
    "organizerName": "",
    "photos": []
  }
]

export async function seedEventcreatorpage() {
  console.log('Seeding eventcreatorpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('eventcreatorpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('eventcreatorpage')
    .insert(eventcreatorpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding eventcreatorpage:', error)
  } else {
    console.log('✅ Seeded 1 eventcreatorpage')
  }
  
  return { data, error }
}
