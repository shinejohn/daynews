// Minimal test server to check imports
import express from 'express'
console.log('✓ Express imported')

import { ISREngine } from './server/isr/engine.js'
console.log('✓ ISREngine imported')

import { ISRMiddleware } from './server/isr/isr-middleware.js'
console.log('✓ ISRMiddleware imported')

const app = express()
const isrEngine = new ISREngine()
console.log('✓ ISREngine created')

const isrMiddleware = new ISRMiddleware(isrEngine)
console.log('✓ ISRMiddleware created')

app.get('/test', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(3001, () => {
  console.log('✓ Test server running on port 3001')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...')
  await isrEngine.shutdown()
  process.exit(0)
})