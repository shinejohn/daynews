import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const articlecommentsSeeds = []

export async function seedArticlecomments() {
  console.log('Seeding articlecomments...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('articlecomments').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('articlecomments')
    .insert(articlecommentsSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding articlecomments:', error)
  } else {
    console.log('✅ Seeded 0 articlecomments')
  }
  
  return { data, error }
}
