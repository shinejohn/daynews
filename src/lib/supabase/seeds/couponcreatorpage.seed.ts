import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const couponcreatorpageSeeds = [
  {
    "title": "",
    "description": "",
    "businessName": "",
    "location": "",
    "discount": "",
    "discountType": "percentage",
    "startDate": "",
    "endDate": "",
    "terms": "",
    "image": null
  }
]

export async function seedCouponcreatorpage() {
  console.log('Seeding couponcreatorpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('couponcreatorpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('couponcreatorpage')
    .insert(couponcreatorpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding couponcreatorpage:', error)
  } else {
    console.log('✅ Seeded 1 couponcreatorpage')
  }
  
  return { data, error }
}
