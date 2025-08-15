import express from 'express'
import { createServer as createViteServer } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()
  
  let vite
  if (!isProduction) {
    // Create Vite server in middleware mode
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    
    // Use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    // Serve static files in production
    app.use(express.static('dist/client'))
  }
  
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl
    
    try {
      let template, render
      
      if (!isProduction) {
        // Load files in dev
        template = fs.readFileSync(
          path.resolve(__dirname, '../index.html'),
          'utf-8'
        )
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry/entry-server.jsx')).render
      } else {
        // Load built files in production
        template = fs.readFileSync(
          path.resolve(__dirname, '../dist/client/index.html'),
          'utf-8'
        )
        render = (await import('../dist/server/entry-server.js')).render
      }
      
      // Render the app
      const { html, context } = render(url)
      
      // Replace placeholders
      const finalHtml = template
        .replace('<!--ssr-html-->', html)
        .replace('<!--ssr-title-->', context.title || 'DayNews')
        .replace('<!--ssr-description-->', context.description || '')
        .replace('<!--ssr-data-->', JSON.stringify(context))
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
    } catch (e) {
      !isProduction && vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })
  
  return app
}

createServer().then(app => {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
})
