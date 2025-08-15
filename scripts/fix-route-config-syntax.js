import fs from 'fs'

const content = fs.readFileSync('server/route-config.js', 'utf8')

// Fix all the syntax issues
let fixed = content
  // Fix route objects that got messed up
  .replace(/"\/"\]: {/g, '"/": {')
  .replace(/"\/"\]/g, '"/"')
  // Fix arrays in isrRoutes
  .replace(/"\/"],/g, '"/",')
  // Fix ttlConfig
  .replace(/"\/"\]: 300/g, '"/": 300')
  // Fix category arrays - close them properly
  .replace(/    ,\n    "general": \[/g, '    ],\n    "general": [')
  .replace(/    ,\n    "forms": \[/g, '    ],\n    "forms": [')
  .replace(/    ,\n    "events": \[/g, '    ],\n    "events": [')
  .replace(/    ,\n    "business": \[/g, '    ],\n    "business": [')
  .replace(/    ,\n    "auth": \[/g, '    ],\n    "auth": [')
  .replace(/    ,\n    "news": \[/g, '    ],\n    "news": [')
  .replace(/    ,\n    "marketplace": \[/g, '    ],\n    "marketplace": [')
  // Close final arrays
  .replace(/      "\/"\n    ,/g, '      "/"\n    ],')
  .replace(/      "\/auth\/userregistration"\n    ,/g, '      "/auth/userregistration"\n    ],')
  .replace(/      "\/article\/:slug"\n    ,/g, '      "/article/:slug"\n    ],')
  .replace(/      "\/create\/news"\n    ,/g, '      "/create/news"\n    ],')
  .replace(/      "\/events\/eventcreator"\n    ,/g, '      "/events/eventcreator"\n    ],')
  .replace(/      "\/businesses"\n    ,/g, '      "/businesses"\n    ],')
  // Fix the invalidation rules
  .replace(/'news:publish': :/g, "'news:publish': [")
  .replace(/'event:update': :/g, "'event:update': [")
  .replace(/'business:review': :/g, "'business:review': [")
  .replace(/'deal:activate': :/g, "'deal:activate': [")
  .replace(/'announcement:create': :/g, "'announcement:create': [")
  .replace(/'hub:post': :/g, "'hub:post': [")
  // Close invalidation rule arrays
  .replace(/\/:authorId,$/gm, "/:authorId'],")
  .replace(/\/events\/calendar,$/gm, "/events/calendar'],")
  .replace(/\/reviews,$/gm, "/reviews'],")
  .replace(/\/:slug,$/gm, "/:slug'],")
  .replace(/\/',$/gm, "/'],")
  // Fix the for...of loop
  .replace(/for \(const :pattern, config of/, 'for (const [pattern, config] of')
  // Fix object access
  .replace(/routeConfig.routes:route/g, 'routeConfig.routes[route]')
  .replace(/invalidationRules:key/g, 'invalidationRules[key]')
  .replace(/data:param/g, 'data[param]')
  // Fix regex replace
  .replace(/pattern.replace\(\/::/, 'pattern.replace(/:')
  
fs.writeFileSync('server/route-config.js', fixed)
console.log('✅ Fixed route config syntax')