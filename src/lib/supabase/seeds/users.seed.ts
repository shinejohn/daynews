import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const usersSeeds = [
  {
    "firstName": "",
    "lastName": "",
    "email": "",
    "password": "",
    "agreeTerms": false,
    "agreeMarketing": false
  }
]

export async function seedUsers() {
  console.log('Seeding users...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('users').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('users')
    .insert(usersSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding users:', error)
  } else {
    console.log('✅ Seeded 1 users')
  }
  
  return { data, error }
}
