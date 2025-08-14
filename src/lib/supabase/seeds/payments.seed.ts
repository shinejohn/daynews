import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const paymentsSeeds = [
  {
    "cardNumber": "",
    "cardName": "",
    "expiryDate": "",
    "cvv": ""
  }
]

export async function seedPayments() {
  console.log('Seeding payments...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('payments').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('payments')
    .insert(paymentsSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding payments:', error)
  } else {
    console.log('✅ Seeded 1 payments')
  }
  
  return { data, error }
}
