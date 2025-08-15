import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

let vite
if (!isProduction) {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })
}

export async function renderRoute(route) {
  let template, render
  
  if (!isProduction) {
    template = fs.readFileSync(
      path.resolve(__dirname, '../index.html'),
      'utf-8'
    )
    template = await vite.transformIndexHtml(route, template)
    render = (await vite.ssrLoadModule('/src/entry/entry-server.jsx')).render
  } else {
    template = fs.readFileSync(
      path.resolve(__dirname, '../dist/client/index.html'),
      'utf-8'
    )
    render = (await import('../dist/server/entry-server.js')).render
  }
  
  // Render the app
  const { html, context } = render(route)
  
  // Replace placeholders
  const finalHtml = template
    .replace('<!--ssr-html-->', html)
    .replace('<!--ssr-title-->', context.title || 'DayNews')
    .replace('<!--ssr-description-->', context.description || '')
    .replace('<!--ssr-data-->', JSON.stringify(context))
  
  return { html: finalHtml, context }
}
