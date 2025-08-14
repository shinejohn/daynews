import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const createnewspageSeeds = [
  {
    "title": "",
    "subtitle": "",
    "category": "",
    "tags": [],
    "content": "",
    "imageDescription": "",
    "location": "",
    "sourceReference": ""
  },
  {
    "subtitle": 0,
    "content": 0
  },
  {
    "isValidated": false,
    "moderationPassed": false,
    "sourcesValidated": false,
    "finalDecision": "pending",
    "moderationNotes": "The article contains inappropriate language, lacks clarity, and does not provide relevant or detailed information for the local community. The tone is unprofessional, and the content does not clearly relate to a specific event or topic.",
    "suggestedFixes": "Remove offensive language, clarify the main topic or event, provide relevant details about the subject (e.g., why Shine is the best), and ensure the content is appropriate and informative for the local audience.",
    "sourceValid": false,
    "validationNotes": "",
    "confidenceLevel": "low"
  }
]

export async function seedCreatenewspage() {
  console.log('Seeding createnewspage...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('createnewspage').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('createnewspage')
    .insert(createnewspageSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding createnewspage:', error)
  } else {
    console.log('✅ Seeded 3 createnewspage')
  }
  
  return { data, error }
}
