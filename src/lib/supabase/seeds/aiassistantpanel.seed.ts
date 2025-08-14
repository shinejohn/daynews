import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const aiassistantpanelSeeds = []

export async function seedAiassistantpanel() {
  console.log('Seeding aiassistantpanel...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('aiassistantpanel').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('aiassistantpanel')
    .insert(aiassistantpanelSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding aiassistantpanel:', error)
  } else {
    console.log('✅ Seeded 0 aiassistantpanel')
  }
  
  return { data, error }
}
