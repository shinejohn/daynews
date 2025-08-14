import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const communityswitcherSeeds = [
  {
    "id": "clearwater-fl-us",
    "name": "Clearwater",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "dunedin-fl-us",
    "name": "Dunedin",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "tampa-fl-us",
    "name": "Tampa",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "st-petersburg-fl-us",
    "name": "St. Petersburg",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "sarasota-fl-us",
    "name": "Sarasota",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "orlando-fl-us",
    "name": "Orlando",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "miami-fl-us",
    "name": "Miami",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "jacksonville-fl-us",
    "name": "Jacksonville",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "gainesville-fl-us",
    "name": "Gainesville",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "tallahassee-fl-us",
    "name": "Tallahassee",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "pensacola-fl-us",
    "name": "Pensacola",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "fort-lauderdale-fl-us",
    "name": "Fort Lauderdale",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "naples-fl-us",
    "name": "Naples",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "fort-myers-fl-us",
    "name": "Fort Myers",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "key-west-fl-us",
    "name": "Key West",
    "state": "FL",
    "country": "US"
  },
  {
    "id": "atlanta-ga-us",
    "name": "Atlanta",
    "state": "GA",
    "country": "US"
  },
  {
    "id": "new-york-ny-us",
    "name": "New York",
    "state": "NY",
    "country": "US"
  },
  {
    "id": "los-angeles-ca-us",
    "name": "Los Angeles",
    "state": "CA",
    "country": "US"
  },
  {
    "id": "chicago-il-us",
    "name": "Chicago",
    "state": "IL",
    "country": "US"
  },
  {
    "id": "houston-tx-us",
    "name": "Houston",
    "state": "TX",
    "country": "US"
  }
]

export async function seedCommunityswitcher() {
  console.log('Seeding communityswitcher...')
  
  // Clear existing data (optional)
  // await (supabase as any).from('communityswitcher').delete().neq('id' as any, 0 as any)
  
  const { data, error } = await (supabase as any).from('communityswitcher')
    .insert(communityswitcherSeeds)
    .select()
    
  if (error) {
    console.error('Error seeding communityswitcher:', error)
  } else {
    console.log('✅ Seeded 1 communityswitcher')
  }
  
  return { data, error }
}
