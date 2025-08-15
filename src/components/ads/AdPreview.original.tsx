// Converted from Magic Patterns
import React from 'react';
import { Clock, ExternalLink, Heart, MapPin, MessageSquare, User } from 'lucide-react';
interface AdPreviewProps {
  adFormat: string;
  adData: {
    title: string;
    image: any;
    bodyText: string;
    callToAction: string;
    destinationUrl: string;
  };
  device: 'desktop' | 'mobile';
}
export const AdPreview: React.FC<AdPreviewProps> = ({
  adFormat,
  adData,
  device
}) => {
  const renderCompactAd = () => <div className="bg-white rounded-md border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Sponsored</div>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{adData.title || 'Your ad title'}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{adData.bodyText || 'Your ad description'}</p>
        </div>
        <button className="ml-3 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {adData.callToAction}
        </button>
      </div>
    </div>;
  const renderStandardAd = () => <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
      <div className="text-xs text-gray-500 p-2 bg-gray-50 border-b border-gray-200">
        Sponsored
      </div>
      {adData.image ? <div className="h-32 overflow-hidden">
          <img src={adData.image} alt="Ad" className="w-full h-full object-cover" />
        </div> : <div className="h-32 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Ad Image</span>
          </div>
        </div>}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{adData.title || 'Your ad title'}</h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-3">{adData.bodyText || 'Your ad description'}</p>
        <button className="w-full bg-blue-600 text-white text-xs py-1.5 rounded">
          {adData.callToAction}
        </button>
      </div>
    </div>;
  const renderBannerAd = () => <div className="bg-white rounded-md border border-gray-200 p-3 shadow-sm flex items-center">
      {adData.image ? <div className="h-10 w-10 mr-3 overflow-hidden rounded">
          <img src={adData.image} alt="Ad" className="w-full h-full object-cover" />
        </div> : <div className="h-10 w-10 mr-3 bg-gray-100 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>}
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-0.5">Sponsored</div>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{adData.title || 'Your ad title'}</h3>
        <p className="text-xs text-gray-600 line-clamp-1">{adData.bodyText || 'Your ad description'}</p>
      </div>
      <button className="ml-3 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {adData.callToAction}
      </button>
    </div>;
  const renderPremiumAd = () => <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
      <div className="text-xs text-gray-500 p-2 bg-gray-50 border-b border-gray-200">
        Sponsored
      </div>
      {adData.image ? <div className="h-48 overflow-hidden">
          <img src={adData.image} alt="Ad" className="w-full h-full object-cover" />
        </div> : <div className="h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Ad Image</span>
          </div>
        </div>}
      <div className="p-4">
        <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">{adData.title || 'Your premium ad title goes here'}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-4">{adData.bodyText || 'A comprehensive description of your product or service with ample room for details about features, benefits, and value proposition.'}</p>
        <div className="text-sm text-gray-600 mb-4">
          • Feature point one about your offering
          <br />
          • Feature point two about your offering
          <br />• Feature point three about your offering
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded font-medium">
          {adData.callToAction}
        </button>
      </div>
    </div>;
  const renderAd = () => {
    switch (adFormat) {
      case 'compact':
        return renderCompactAd();
      case 'standard':
        return renderStandardAd();
      case 'banner':
        return renderBannerAd();
      case 'premium':
        return renderPremiumAd();
      default:
        return renderStandardAd();
    }
  };
  const renderMockPost = () =><div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">Community Member</div>
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> 2h ago •
            <MapPin className="h-3 w-3 mx-1" /> Local Community
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-3">
        Just wanted to share my experience with the local park cleanup
        yesterday. Amazing turnout! We collected over 20 bags of trash and made
        a real difference.
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            <span>24</span>
          </button>
          <button className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>8 comments</span>
          </button>
        </div>
      </div>
    </div>;
  return <div className={`overflow-hidden ${device === 'mobile' ? 'max-w-[320px]' : ''} mx-auto`}>
      <div className={`bg-gray-100 rounded-lg overflow-hidden border border-gray-300 ${device === 'mobile' ? 'w-[320px]' : 'w-full max-w-2xl'}`}>
        {/* Mock community header */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
          <div className="font-semibold">Community Feed</div>{device === 'desktop' &&<div className="text-xs">
              <span className="mr-4">Home</span>
              <span className="mr-4">Popular</span>
              <span>Notifications</span>
            </div>}
        </div>
        {/* Mock feed content */}
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {renderMockPost()}
          {/* Ad */}
          <div className="mb-4">{renderAd()}</div>
          {renderMockPost()}
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        This is a preview of how your ad will appear in community feeds.
      </div>
    </div>;
};