import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '../App'
import '../index.css'

// Get server data if available
const serverData = window.__SERVER_DATA__ || {}

hydrateRoot(
  document.getElementById('app'),
  <BrowserRouter>
    <App serverData={serverData} />
  </BrowserRouter>
)
