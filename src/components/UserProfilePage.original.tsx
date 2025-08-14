'use client';
// Converted from Magic Patterns
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Edit, Settings, FileText, Bell, Bookmark, Heart, Tag, Pen, Users, Award } from 'lucide-react';
export const UserProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  // Mock user data - in a real app, this would come from an API or auth context
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(727) 555-1234',
    location: 'Clearwater, FL',
    joinDate: 'January 2023',
    bio: 'Community member interested in local events and news.',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };
  // Mock user activity data
  const userActivity = {
    articles: [],
    savedArticles: [{
      id: 1,
      title: 'Clearwater Beach Named Best in Florida',
      date: 'August 5, 2024',
      category: 'Local News'
    }, {
      id: 2,
      title: 'New Community Center Opening Next Month',
      date: 'July 28, 2024',
      category: 'Community'
    }],
    announcements: [{
      id: 1,
      title: 'Neighborhood Cleanup This Weekend',
      date: 'August 10, 2024'
    }],
    events: [{
      id: 1,
      title: 'Farmers Market',
      date: 'Every Saturday',
      location: 'Downtown Clearwater'
    }],
    comments: [{
      id: 1,
      articleTitle: 'City Council Approves New Park',
      comment: 'This is great news for our community!',
      date: 'July 15, 2024'
    }]
  };
  return <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-news-primary h-32 relative"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md z-10">
                <img src={userData.profileImage} alt={userData.name} className="w-full h-full object-cover" />
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 md:pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name}
                </h1>
                <p className="text-gray-600">{userData.location}</p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                <button onClick={() => router.push('/settings')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center">
                  <Settings className="h-4 w-4 mr-1.5" />
                  Edit Profile
                </button>
              </div>
            </div>
            <div className="text-gray-600">
              <p>{userData.bio}</p>
              <div className="flex flex-wrap gap-y-2 mt-4 text-sm">
                <div className="flex items-center mr-6">
                  <Mail className="h-4 w-4 text-gray-500 mr-1.5" />
                  {userData.email}
                </div>
                <div className="flex items-center mr-6">
                  <Phone className="h-4 w-4 text-gray-500 mr-1.5" />
                  {userData.phone}
                </div>
                <div className="flex items-center mr-6">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
                  {userData.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
                  Member since {userData.joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button onClick={() => setActiveTab('profile')} className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'profile' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              Activity
            </button>
            <button onClick={() => setActiveTab('saved')} className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'saved' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              Saved Articles
            </button>
            <button onClick={() => setActiveTab('comments')} className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'comments' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              Comments
            </button>
            <button onClick={() => setActiveTab('announcements')} className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'announcements' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              Your Announcements
            </button>
            <button onClick={() => setActiveTab('events')} className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'events' ? 'text-news-primary border-b-2 border-news-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              Your Events
            </button>
          </div>
        </div>

        {/* Become an Author Banner */}
        {userActivity.articles.length === 0 && <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="px-6 py-6 text-white flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h2 className="text-xl font-bold mb-2">
                  Become a Community Author/Reporter
                </h2>
                <p className="text-blue-100 max-w-xl">
                  Share your unique perspective, report on local events, and
                  build your reputation as a trusted voice in our community.
                </p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => router.push('/author/profile-creator')} className="px-4 py-2 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors flex items-center">
                  <Pen className="h-4 w-4 mr-1.5" />
                  Create Author Profile
                </button>
                <button onClick={() => router.push('/create-article')} className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-400 border border-blue-400 transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Write First Article
                </button>
              </div>
            </div>
          </div>}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'profile' && <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              {/* Activity summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Articles</h3>
                    <FileText className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.articles.length}
                  </p>
                  <p className="text-sm text-gray-600">Published articles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Saved</h3>
                    <Bookmark className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.savedArticles.length}
                  </p>
                  <p className="text-sm text-gray-600">Saved articles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Announcements</h3>
                    <Bell className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.announcements.length}
                  </p>
                  <p className="text-sm text-gray-600">Your announcements</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Events</h3>
                    <Calendar className="h-5 w-5 text-news-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {userActivity.events.length}
                  </p>
                  <p className="text-sm text-gray-600">Your events</p>
                </div>
              </div>
              {/* Call to action cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Write an Article
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Share news and stories with your community
                  </p>
                  <button onClick={() => router.push('/create-article')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">
                    Start Writing
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Post an Announcement
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Share important updates with the community
                  </p>
                  <button onClick={() => router.push('/announcementCreator')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">
                    Create Announcement
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Post a Listing
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sell items or services to the community
                  </p>
                  <button onClick={() => router.push('/postListing')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">
                    Create Listing
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-news-primary hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-news-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-news-primary" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Become an Author
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create your author profile and share your expertise
                  </p>
                  <button onClick={() => router.push('/create-article')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors text-sm">
                    Create Profile
                  </button>
                </div>
              </div>
            </div>}

          {activeTab === 'saved' && <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Saved Articles
              </h2>
              {userActivity.savedArticles.length > 0 ? <div className="space-y-4">
                  {userActivity.savedArticles.map(article => <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:border-news-primary hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {article.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{article.date}</span>
                            <span className="mx-2">•</span>
                            <span>{article.category}</span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-red-500">
                          <Bookmark className="h-5 w-5 fill-current" />
                        </button>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No saved articles yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Articles you save will appear here
                  </p>
                  <button onClick={() => router.push('/')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">
                    Browse Articles
                  </button>
                </div>}
            </div>}

          {activeTab === 'comments' && <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Comments
              </h2>
              {userActivity.comments.length > 0 ? <div className="space-y-4">
                  {userActivity.comments.map(comment => <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-1">
                        On: {comment.articleTitle}
                      </h3>
                      <p className="text-gray-700 mb-2">"{comment.comment}"</p>
                      <div className="text-xs text-gray-500">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        <span>{comment.date}</span>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No comments yet
                  </h3>
                  <p className="text-gray-600">
                    Join the conversation by commenting on articles
                  </p>
                </div>}
            </div>}

          {activeTab === 'announcements' && <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Announcements
              </h2>
              {userActivity.announcements.length > 0 ? <div className="space-y-4">
                  {userActivity.announcements.map(announcement => <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:border-news-primary hover:shadow-sm transition-all">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {announcement.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{announcement.date}</span>
                          </div>
                        </div>
                        <div>
                          <button className="text-gray-500 hover:text-gray-700 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No announcements yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share important updates with your community
                  </p>
                  <button onClick={() => router.push('/announcementCreator')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">
                    Create Announcement
                  </button>
                </div>}
            </div>}

          {activeTab === 'events' && <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Events
              </h2>
              {userActivity.events.length > 0 ? <div className="space-y-4">
                  {userActivity.events.map(event => <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-news-primary hover:shadow-sm transition-all">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {event.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{event.date}</span>
                            <span className="mx-2">•</span>
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div>
                          <button className="text-gray-500 hover:text-gray-700 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No events yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage community events
                  </p>
                  <button onClick={() => router.push('/eventCreator')} className="px-4 py-2 bg-news-primary text-white rounded-md font-medium hover:bg-news-primary-dark transition-colors">
                    Create Event
                  </button>
                </div>}
            </div>}
        </div>
      </div>
    </div>;
};