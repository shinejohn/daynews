#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Read the route config
const configPath = path.join(process.cwd(), 'server/route-config.js')
let content = fs.readFileSync(configPath, 'utf8')

// Convert Next.js style dynamic routes to Express style
// [param] -> :param
content = content.replace(/\[([^\]]+)\]/g, ':$1')

// Write back
fs.writeFileSync(configPath, content)

console.log('✅ Fixed route patterns:')
console.log('   [authorId] -> :authorId')
console.log('   [slug] -> :slug')
console.log('   etc.')