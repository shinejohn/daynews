import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const donotsellpageSeeds = [
  {
    "firstName": "",
    "lastName": "",
    "email": "",
    "requestType": "doNotSell",
    "details": "",
    "verifyIdentity": false
  }
]

export async function seedDonotsellpage() {
  console.log('Seeding donotsellpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('donotsellpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('donotsellpage')
    .insert(donotsellpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding donotsellpage:', error)
  } else {
    console.log('✅ Seeded 1 donotsellpage')
  }
  
  return { data, error }
}
