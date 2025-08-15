'use client';
// Converted from Magic Patterns
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '../hero/HeroSection';
import { useLocationDetection } from '../location/LocationDetector';
import { ArrowDownAZ, ArrowUpAZ, Calendar, ChevronRight, Clock, ExternalLink, MapPin, Search, SlidersHorizontal, Tag, User, Users, X } from 'lucide-react';
import { EventTypeFilters, EventType } from './EventTypeFilters';
// Mock events data
export const mockEvents = [{
  id: 1,
  title: 'Clearwater Jazz Holiday',
  date: '2025-08-15',
  time: '2025-08-15T18:00:00',
  endTime: '2025-08-15T23:00:00',
  location: 'Coachman Park',
  address: '301 Drew St, Clearwater, FL 33755',
  coordinates: {
    lat: 27.9659,
    lng: -82.8001
  },
  description: 'The Clearwater Jazz Holiday is a world-class music festival featuring jazz, blues, and rock performances.',
  image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 45,
  category: 'music',
  featured: true,
  attendees: 17,
  organizer: 'Clearwater Jazz Holiday Foundation'
}, {
  id: 2,
  title: 'Farmers Market',
  date: '2025-08-10',
  time: '2025-08-10T09:00:00',
  endTime: '2025-08-10T14:00:00',
  location: 'Downtown Clearwater',
  address: '400 Cleveland St, Clearwater, FL 33755',
  coordinates: {
    lat: 27.9651,
    lng: -82.8003
  },
  description: 'Shop local produce, artisanal foods, and handcrafted goods at the weekly farmers market.',
  image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'food',
  featured: false,
  attendees: 42,
  organizer: 'City of Clearwater'
}, {
  id: 3,
  title: 'Beach Cleanup Day',
  date: '2025-08-12',
  time: '2025-08-12T08:00:00',
  endTime: '2025-08-12T12:00:00',
  location: 'Clearwater Beach',
  address: '160 Gulfview Blvd, Clearwater, FL 33767',
  coordinates: {
    lat: 27.9775,
    lng: -82.8271
  },
  description: 'Join your neighbors in keeping our beaches clean and beautiful. Equipment provided.',
  image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'community',
  featured: false,
  attendees: 28,
  organizer: 'Keep Clearwater Beautiful'
}, {
  id: 4,
  title: 'Art Walk',
  date: '2025-08-20',
  time: '2025-08-20T18:00:00',
  endTime: '2025-08-20T21:00:00',
  location: 'Cleveland Street District',
  address: 'Cleveland St, Clearwater, FL 33755',
  coordinates: {
    lat: 27.9654,
    lng: -82.8009
  },
  description: 'Explore local art galleries and meet the artists during this monthly event.',
  image: 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'arts',
  featured: false,
  attendees: 35,
  organizer: 'Clearwater Arts Alliance'
}, {
  id: 5,
  title: 'Summer Concert Series',
  date: '2025-08-22',
  time: '2025-08-22T19:00:00',
  endTime: '2025-08-22T22:00:00',
  location: 'Pier 60',
  address: '1 Causeway Blvd, Clearwater, FL 33767',
  coordinates: {
    lat: 27.9769,
    lng: -82.8277
  },
  description: 'Enjoy live music by local bands with a beautiful sunset backdrop.',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'music',
  featured: true,
  attendees: 64,
  organizer: 'City of Clearwater'
}, {
  id: 6,
  title: 'Youth Soccer Tournament',
  date: '2025-09-05',
  time: '2025-09-05T10:00:00',
  endTime: '2025-09-05T16:00:00',
  location: 'Eddie C. Moore Complex',
  address: '3050 Drew St, Clearwater, FL 33759',
  coordinates: {
    lat: 27.9686,
    lng: -82.7136
  },
  description: 'Annual youth soccer tournament featuring teams from across the region.',
  image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'sports',
  featured: false,
  attendees: 120,
  organizer: 'Clearwater Youth Soccer Association'
}, {
  id: 7,
  title: 'Food Truck Rally',
  date: '2025-09-10',
  time: '2025-09-10T17:00:00',
  endTime: '2025-09-10T22:00:00',
  location: 'Coachman Park',
  address: '301 Drew St, Clearwater, FL 33755',
  coordinates: {
    lat: 27.9659,
    lng: -82.8005
  },
  description: "Sample cuisine from the area's best food trucks with live music and family activities.",
  image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'food',
  featured: true,
  attendees: 85,
  organizer: 'Tampa Bay Food Truck Rally'
}, {
  id: 8,
  title: 'Family Movie Night',
  date: '2025-09-15',
  time: '2025-09-15T20:00:00',
  endTime: '2025-09-15T22:30:00',
  location: 'Countryside Recreation Center',
  address: '2640 Sabal Springs Dr, Clearwater, FL 33761',
  coordinates: {
    lat: 28.0097,
    lng: -82.7371
  },
  description: 'Bring blankets and chairs for an outdoor screening of a family-friendly movie.',
  image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'family',
  featured: false,
  attendees: 47,
  organizer: 'Clearwater Parks & Recreation'
}, {
  id: 9,
  title: 'Business Networking Breakfast',
  date: '2025-09-18',
  time: '2025-09-18T07:30:00',
  endTime: '2025-09-18T09:00:00',
  location: 'Clearwater Chamber of Commerce',
  address: '600 Cleveland St, Clearwater, FL 33755',
  coordinates: {
    lat: 27.9654,
    lng: -82.8
  },
  description: 'Connect with local business leaders and entrepreneurs at this monthly networking event.',
  image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 15,
  category: 'business',
  featured: false,
  attendees: 32,
  organizer: 'Clearwater Chamber of Commerce'
}, {
  id: 10,
  title: 'Adult Education Workshop: Digital Skills',
  date: '2025-09-22',
  time: '2025-09-22T18:00:00',
  endTime: '2025-09-22T20:00:00',
  location: 'Clearwater Public Library',
  address: '100 N Osceola Ave, Clearwater, FL 33755',
  coordinates: {
    lat: 27.9661,
    lng: -82.8008
  },
  description: 'Free workshop teaching essential digital skills for career advancement and personal use.',
  image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  price: 0,
  category: 'education',
  featured: false,
  attendees: 25,
  organizer: 'Clearwater Public Library System'
}];
export const EventsCalendarPage = () =>{
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [activeReaders, setActiveReaders] = useState(247);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [activeEventType, setActiveEventType] = useState<EventType>('all');
  const {
    locationData
  } = useLocationDetection();
  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour< 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
    // Simulate fluctuating reader count
    const interval = setInterval(() =>{
      setActiveReaders(prev => Math.floor(Math.random() * 20) - 10 + prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  // Handle navigation to event detail page
  const handleEventClick = eventId => {
    router.push(`/eventDetail?id=${eventId}`);
  };
  // Handle ad click
  const handleAdClick = () => {
    router.push('/advertisingDetail');
  };
  // Load events data
  useEffect(() => {
    // Simulate loading events from API
    setLoading(true);
    setTimeout(() => {
      // Sort events by date
      const sortedEvents = [...mockEvents].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
      setLoading(false);
    }, 800);
  }, []);
  // Handle search, sort, and filter
  useEffect(() => {
    if (!events.length) return;
    // Filter events based on search query and event type
    let filtered = [...events];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query) || event.location.toLowerCase().includes(query) || event.category.toLowerCase().includes(query));
    }
    // Filter by event type
    if (activeEventType !== 'all') {
      filtered = filtered.filter(event => event.category === activeEventType);
    }
    // Sort filtered events
    switch (sortOption) {
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.attendees - a.attendees);
        break;
      default:
        break;
    }
    setFilteredEvents(filtered);
  }, [events, searchQuery, sortOption, activeEventType]);
  // Format date for display
  const formatEventDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  // Format time for display
  const formatEventTime = timeString => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  // Handle search input change
  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };
  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };
  // Handle sort option change
  const handleSortChange = option => {
    setSortOption(option);
    setShowSortOptions(false);
  };
  // Handle event type change
  const handleEventTypeChange = (type: EventType) => {
    setActiveEventType(type);
  };
  // Get sort option display text
  const getSortOptionText = () => {
    switch (sortOption) {
      case 'date-asc':
        return 'Date (Earliest First)';
      case 'date-desc':
        return 'Date (Latest First)';
      case 'title-asc':
        return 'Title (A-Z)';
      case 'title-desc':
        return 'Title (Z-A)';
      case 'price-asc':
        return 'Price (Low to High)';
      case 'price-desc':
        return 'Price (High to Low)';
      case 'popularity':
        return 'Popularity';
      default:
        return 'Sort By';
    }
  };
  return<div className="flex-1 overflow-auto bg-gray-50">
      <HeroSection greeting={greeting} location={locationData?.city || 'Clearwater'} activeReaders={activeReaders} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        </div>

        {/* Event Type Visual Filters */}
        <EventTypeFilters activeType={activeEventType} onTypeChange={handleEventTypeChange} />

        {/* Search and Sort Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <input type="text" placeholder="Search events by title, location, category..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-news-primary" data-testid="event-search-input" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                  <X className="h-5 w-5" />
                </button>}
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <button onClick={() =>setShowSortOptions(!showSortOptions)} className="flex items-center justify-between w-full md:w-64 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" aria-label="Sort options" aria-expanded={showSortOptions} data-testid="sort-button"><div className="flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{getSortOptionText()}</span>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform ${showSortOptions ? 'rotate-90' : ''}`} />
              </button>
              {showSortOptions && <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200" data-testid="sort-options">
                  <div className="py-1">
                    <button onClick={() =>handleSortChange('date-asc')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'date-asc' ? 'bg-gray-100 font-medium' : ''}`}><Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Date (Earliest First)
                    </button>
                    <button onClick={() =>handleSortChange('date-desc')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'date-desc' ? 'bg-gray-100 font-medium' : ''}`}><Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Date (Latest First)
                    </button>
                    <button onClick={() =>handleSortChange('title-asc')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'title-asc' ? 'bg-gray-100 font-medium' : ''}`}><ArrowDownAZ className="h-4 w-4 mr-2 text-gray-500" />
                      Title (A-Z)
                    </button>
                    <button onClick={() =>handleSortChange('title-desc')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'title-desc' ? 'bg-gray-100 font-medium' : ''}`}><ArrowUpAZ className="h-4 w-4 mr-2 text-gray-500" />
                      Title (Z-A)
                    </button>
                    <button onClick={() =>handleSortChange('price-asc')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'price-asc' ? 'bg-gray-100 font-medium' : ''}`}><Tag className="h-4 w-4 mr-2 text-gray-500" />
                      Price (Low to High)
                    </button>
                    <button onClick={() =>handleSortChange('price-desc')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'price-desc' ? 'bg-gray-100 font-medium' : ''}`}><Tag className="h-4 w-4 mr-2 text-gray-500" />
                      Price (High to Low)
                    </button>
                    <button onClick={() =>handleSortChange('popularity')} className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === 'popularity' ? 'bg-gray-100 font-medium' : ''}`}><Users className="h-4 w-4 mr-2 text-gray-500" />
                      Popularity
                    </button>
                  </div>
                </div>}
            </div>
          </div>{/* Search results info */}
          {(searchQuery || activeEventType !== 'all') &&<div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">Found {filteredEvents.length}{' '}
              {filteredEvents.length === 1 ? 'event' : 'events'}
              {searchQuery &&<>matching "{searchQuery}"</>}
              {activeEventType !== 'all' &&<>in category "{activeEventType}"</>}
            </div>}
        </div>

        {/* Advertisement Banner */}
        <div className="mb-8">
          <div className="text-xs text-gray-500 text-center mb-1">
            ADVERTISEMENT
          </div>
          <div className="bg-gray-100 rounded-lg p-4 border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors" onClick={handleAdClick}>
            <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">
                Support Local Businesses - Learn More About Advertising
              </span>
            </div>
          </div>
        </div>

        {loading ? <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-news-primary" aria-label="loading"></div>
          </div> : filteredEvents.length > 0 ? <div className="space-y-6" data-testid="events-list">
            {filteredEvents.map(event => <div key={event.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleEventClick(event.id)}>
                <div className="flex flex-col md:flex-row">
                  {/* Event image */}
                  <div className="md:w-1/4 h-48 md:h-auto relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                      <ExternalLink className="h-5 w-5 text-news-primary" />
                    </div>
                  </div>
                  {/* Event details */}
                  <div className="p-6 md:w-3/4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                      {event.featured && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Featured
                        </span>}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatEventTime(event.time)} -{' '}
                          {formatEventTime(event.endTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                      </div>
                      <button className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded hover:bg-news-primary-dark transition-colors" onClick={e => {
                  e.stopPropagation();
                  handleEventClick(event.id);
                }}>
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>)}
          </div> : <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 mb-4">{searchQuery || activeEventType !== 'all' ? `We couldn't find any events matching your criteria` : 'There are no upcoming events at this time'}</p>{(searchQuery || activeEventType !== 'all') &&<div className="flex justify-center gap-3">
                {searchQuery && <button onClick={clearSearch} className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                    Clear Search
                    <X className="h-4 w-4 ml-1" />
                  </button>}
                {activeEventType !== 'all' &&<button onClick={() =>setActiveEventType('all')} className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded hover:bg-news-primary-dark transition-colors">
                    Show All Events<Calendar className="h-4 w-4 ml-1" />
                  </button>}
              </div>}
          </div>}

        {/* Bottom Advertisement */}
        <div className="mt-12">
          <div className="text-xs text-gray-500 text-center mb-1">
            ADVERTISEMENT
          </div>
          <div className="bg-gray-100 rounded-lg p-6 border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors" onClick={handleAdClick}>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-gray-500">Ad</span>
                </div>
              </div>
              <div className="md:w-3/4 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Promote Your Local Event
                </h3>
                <p className="text-gray-600 mb-4">
                  Reach thousands of readers in the Clearwater area with our
                  affordable advertising options.
                </p>
                <button className="px-6 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};