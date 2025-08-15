// Home page - Server Component
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DayNews - Your Local News Source',
  description: 'Stay connected with your community through local news, events, and classifieds',
};

// Simple server component that renders basic content
export default function HomePage() {
  // Get server-side data
  const greeting = getTimeBasedGreeting();
  const location = 'Clearwater'; // Default location
  const activeReaders = 247; // Static initial value
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {greeting}, {location}!
        </h1>
        <p className="text-gray-600 mb-8">
          {activeReaders} readers online
        </p>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-4">Latest News</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">News content will be loaded here...</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Community</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Events and announcements...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}