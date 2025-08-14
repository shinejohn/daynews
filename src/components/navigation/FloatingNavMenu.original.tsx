'use client';
// Converted from Magic Patterns
import React, { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Home, MessageSquare, Calendar, Search, Menu, X, User, Newspaper, Building2, Tag, Archive, Megaphone, Heart, Scissors, FileText, Briefcase, Phone, Gavel, ChevronLeft, ChevronRight } from 'lucide-react';
export const FloatingNavMenu = ({
  currentPage
}) => {
  const router = useRouter();
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleNavigation = path => {
    router.push(path);
    setShowFullMenu(false);
  };
  return <>
      {/* Bottom navigation for mobile - keep this for mobile devices */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden">
        <div className={`bg-white rounded-full shadow-lg flex items-center justify-between pointer-events-auto transition-all duration-300 ${showFullMenu ? 'w-11/12 max-w-4xl px-4 py-3' : 'w-auto max-w-xs px-2 py-2'}`}>
          {/* Compact menu - always visible */}
          {!showFullMenu && <>
              <button onClick={() => handleNavigation('/')} className={`p-3 rounded-full ${currentPage === 'home' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} aria-label="Home">
                <Home className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/announcements')} className={`p-3 rounded-full ${currentPage === 'announcements' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} aria-label="Announcements">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/eventsCalendar')} className={`p-3 rounded-full ${currentPage === 'eventsCalendar' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} aria-label="Events Calendar">
                <Calendar className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/search')} className={`p-3 rounded-full ${currentPage === 'search' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
              <button onClick={() => setShowFullMenu(true)} className="p-3 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Expand Menu">
                <Menu className="h-5 w-5" />
              </button>
            </>}
          {/* Expanded menu */}
          {showFullMenu && <div className="grid grid-cols-6 md:grid-cols-10 gap-2 w-full">
              <button onClick={() => handleNavigation('/')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'home' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Home className="h-5 w-5 mb-1" />
                <span className="text-xs">Home</span>
              </button>
              <button onClick={() => handleNavigation('/announcements')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'announcements' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Megaphone className="h-5 w-5 mb-1" />
                <span className="text-xs">Announce</span>
              </button>
              <button onClick={() => handleNavigation('/eventsCalendar')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'eventsCalendar' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-xs">Events</span>
              </button>
              <button onClick={() => handleNavigation('/classifieds')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'classifieds' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Tag className="h-5 w-5 mb-1" />
                <span className="text-xs">Classifieds</span>
              </button>
              <button onClick={() => handleNavigation('/businessDirectory')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'businessDirectory' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Building2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Business</span>
              </button>
              <button onClick={() => handleNavigation('/coupons')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'coupons' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Scissors className="h-5 w-5 mb-1" />
                <span className="text-xs">Coupons</span>
              </button>
              <button onClick={() => handleNavigation('/legalNoticesList')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'legalNoticesList' || currentPage === 'legalNoticeDetail' || currentPage === 'legalNoticeCreator' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Gavel className="h-5 w-5 mb-1" />
                <span className="text-xs">Legal</span>
              </button>
              <button onClick={() => handleNavigation('/memorials')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'memorials' || currentPage === 'memorialDetail' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">Memorials</span>
              </button>
              <button onClick={() => handleNavigation('/archive')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'archive' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Archive className="h-5 w-5 mb-1" />
                <span className="text-xs">Archive</span>
              </button>
              {/* Second row for larger screens */}
              <div className="hidden md:flex col-span-10 justify-center space-x-2 mt-2 w-full">
                <button onClick={() => handleNavigation('/search')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'search' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Search className="h-5 w-5 mb-1" />
                  <span className="text-xs">Search</span>
                </button>
                <button onClick={() => handleNavigation('/trending')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'trending' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Newspaper className="h-5 w-5 mb-1" />
                  <span className="text-xs">Trending</span>
                </button>
                <button onClick={() => handleNavigation('/about')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'about' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">About</span>
                </button>
                <button onClick={() => handleNavigation('/contact')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'contact' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Phone className="h-5 w-5 mb-1" />
                  <span className="text-xs">Contact</span>
                </button>
                <button onClick={() => handleNavigation('/profile')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'profile' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <User className="h-5 w-5 mb-1" />
                  <span className="text-xs">Profile</span>
                </button>
              </div>
              <button onClick={() => setShowFullMenu(false)} className="absolute top-3 right-4 text-gray-500 hover:text-gray-700" aria-label="Close Menu">
                <X className="h-5 w-5" />
              </button>
            </div>}
        </div>
      </div>
      {/* Right-side floating menu for all devices */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {isCollapsed ? <button onClick={() => setIsCollapsed(false)} className="bg-white rounded-full shadow-lg p-3 text-gray-500 hover:text-news-primary hover:bg-gray-50 transition-colors" aria-label="Expand Menu">
              <ChevronLeft className="h-6 w-6" />
            </button> : <div className="bg-white rounded-lg shadow-lg p-3 flex flex-col items-center space-y-4">
              <button onClick={() => setIsCollapsed(true)} className="text-gray-500 hover:text-news-primary self-end mb-2" aria-label="Collapse Menu">
                <ChevronRight className="h-6 w-6" />
              </button>
              <button onClick={() => handleNavigation('/')} className={`p-3 rounded-full ${currentPage === 'home' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Home" aria-label="Home">
                <Home className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/announcements')} className={`p-3 rounded-full ${currentPage === 'announcements' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Announcements" aria-label="Announcements">
                <Megaphone className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/eventsCalendar')} className={`p-3 rounded-full ${currentPage === 'eventsCalendar' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Events" aria-label="Events">
                <Calendar className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/search')} className={`p-3 rounded-full ${currentPage === 'search' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Search" aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
              <button onClick={() => handleNavigation('/profile')} className={`p-3 rounded-full ${currentPage === 'profile' ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Profile" aria-label="Profile">
                <User className="h-5 w-5" />
              </button>
            </div>}
        </div>
      </div>
    </>;
};