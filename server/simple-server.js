import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Serve static files
app.use(express.static(join(__dirname, '../dist/client')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() })
})

// Catch all - serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/client/index.html'))
})

app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`)
})