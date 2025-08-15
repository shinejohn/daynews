#!/bin/bash

# Version B - Step 1: Setup Vite SSR Project
# This leaves Magic Patterns components intact and adds SSR infrastructure

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Version B: Vite SSR + Custom ISR Setup                ║${NC}"
echo -e "${BLUE}║     Step 1: Initialize Vite SSR Project                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create project structure
echo -e "${YELLOW}Creating project structure...${NC}"
mkdir -p {server,src/entry,cache,public}

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --save express vite @vitejs/plugin-react
npm install --save react react-dom react-router-dom
npm install --save-dev @types/node @types/express nodemon

# Create Vite config
echo -e "${YELLOW}Creating Vite configuration...${NC}"
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  build: {
    // Generate manifest for production
    manifest: true,
    rollupOptions: {
      input: '/src/entry/entry-client.jsx'
    }
  },
  ssr: {
    noExternal: ['react-router-dom']
  }
})
EOF

# Create server entry point
echo -e "${YELLOW}Creating server entry point...${NC}"
cat > src/entry/entry-server.jsx << 'EOF'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../App'

export function render(url, context = {}) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App serverData={context} />
    </StaticRouter>
  )
  
  return { html, context }
}
EOF

# Create client entry point
echo -e "${YELLOW}Creating client entry point...${NC}"
cat > src/entry/entry-client.jsx << 'EOF'
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Get server data if available
const serverData = window.__SERVER_DATA__ || {}

hydrateRoot(
  document.getElementById('app'),
  <BrowserRouter>
    <App serverData={serverData} />
  </BrowserRouter>
)
EOF

# Create HTML template
echo -e "${YELLOW}Creating HTML template...${NC}"
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><!--ssr-title--></title>
    <meta name="description" content="<!--ssr-description-->" />
    <!--ssr-head-->
  </head>
  <body>
    <div id="app"><!--ssr-html--></div>
    <script>
      window.__SERVER_DATA__ = <!--ssr-data-->
    </script>
    <script type="module" src="/src/entry/entry-client.jsx"></script>
  </body>
</html>
EOF

# Create basic Express server
echo -e "${YELLOW}Creating Express server...${NC}"
cat > server/index.js << 'EOF'
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
EOF

# Create package.json scripts
echo -e "${YELLOW}Updating package.json scripts...${NC}"
node -e "
const pkg = require('./package.json');
pkg.type = 'module';
pkg.scripts = {
  ...pkg.scripts,
  'dev:ssr': 'nodemon server/index.js',
  'build:client': 'vite build --outDir dist/client',
  'build:server': 'vite build --ssr src/entry/entry-server.jsx --outDir dist/server',
  'build:ssr': 'npm run build:client && npm run build:server',
  'serve:ssr': 'NODE_ENV=production node server/index.js'
};
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Create nodemon config
echo -e "${YELLOW}Creating nodemon configuration...${NC}"
cat > nodemon.json << 'EOF'
{
  "watch": ["server"],
  "ext": "js",
  "ignore": ["dist/*", "cache/*"],
  "env": {
    "NODE_ENV": "development"
  }
}
EOF

echo -e "${GREEN}✅ Vite SSR setup complete!${NC}"
echo -e "${BLUE}Next: Run ./02-create-isr-engine.sh${NC}"