// supabase/functions/cache-invalidation/index.ts
// Deploy with: supabase functions deploy cache-invalidation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_URL = Deno.env.get('ISR_WEBHOOK_URL')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!

serve(async (req) => {
  try {
    // Verify webhook secret
    const authHeader = req.headers.get('x-webhook-secret')
    if (authHeader !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { type, action, data } = await req.json()

    // Forward to ISR server
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({ type, action, data })
    })

    // Log for debugging
    console.log(`Cache invalidation: ${type}:${action}`, data)

    return new Response(
      JSON.stringify({ 
        success: response.ok,
        invalidated: `${type}:${action}`
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 500
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
