// Ultra simple server with NO imports from our code
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Serve static files from dist directory
const distPath = join(__dirname, '../dist')
app.use(express.static(distPath))

// Health check - simple
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Build files not found. Run npm run build first.')
  }
})

app.listen(PORT, () => {
  console.log(`✅ Ultra simple server running on port ${PORT}`)
  console.log(`Serving files from: ${distPath}`)
})