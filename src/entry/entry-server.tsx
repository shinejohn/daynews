import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from '../App'

export function render(url, context = {}) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App serverData={context} />
    </StaticRouter>
  )
  
  return { html, context }
}
