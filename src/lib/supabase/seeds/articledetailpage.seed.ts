import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const articledetailpageSeeds = [
  {
    "helpful": 127,
    "love": 45,
    "surprising": 23
  },
  {
    "factual": 4.5,
    "likeable": 4.2,
    "bias": 3.8,
    "objective": 4.1
  }
]

export async function seedArticledetailpage() {
  console.log('Seeding articledetailpage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('articledetailpage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('articledetailpage')
    .insert(articledetailpageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding articledetailpage:', error)
  } else {
    console.log('✅ Seeded 2 articledetailpage')
  }
  
  return { data, error }
}
