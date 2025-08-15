import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Placeholder components - will be replaced with Magic Patterns components
const HomePage = () => <div>Home Page</div>
const NewsPage = () => <div>News Page</div>
const EventsPage = () => <div>Events Page</div>
const BusinessPage = () => <div>Business Directory</div>
const NotFound = () => <div>404 - Page Not Found</div>

function App({ serverData = {} }) {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/businesses" element={<BusinessPage />} />
        <Route path="/:community/*" element={<CommunityRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

// Handle community-scoped routes
function CommunityRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/businesses" element={<BusinessPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App