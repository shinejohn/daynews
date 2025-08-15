// Example Express middleware for webhook authentication

export function webhookAuth(req, res, next) {
  const secret = req.headers['x-webhook-secret']
  
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret' })
  }
  
  // Optional: Verify source IP
  const sourceIP = req.ip || req.connection.remoteAddress
  const allowedIPs = process.env.ALLOWED_WEBHOOK_IPS?.split(',') || []
  
  if (allowedIPs.length > 0 && !allowedIPs.includes(sourceIP)) {
    console.warn(`Webhook from unauthorized IP: ${sourceIP}`)
    // You might want to allow in dev but block in production
  }
  
  // Log webhook
  console.log(`Webhook received: ${req.body.type}:${req.body.action}`)
  
  next()
}

// Example webhook handler with validation
export async function handleWebhook(req, res) {
  const { type, action, data } = req.body
  
  // Validate payload
  if (!type || !action || !data) {
    return res.status(400).json({ 
      error: 'Invalid payload: type, action, and data required' 
    })
  }
  
  // Validate entity type
  const validTypes = ['news', 'event', 'business', 'deal', 'announcement', 'hub']
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: `Invalid type: ${type}` 
    })
  }
  
  try {
    // Process webhook based on type and action
    const routes = getInvalidationTargets(type, action, data)
    
    // Queue invalidations
    const results = await Promise.allSettled(
      routes.map(route => isrEngine.revalidate(route))
    )
    
    // Log results
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`Invalidation complete: ${succeeded} succeeded, ${failed} failed`)
    
    res.json({
      success: true,
      invalidated: routes.length,
      succeeded,
      failed
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Failed to process webhook' 
    })
  }
}
