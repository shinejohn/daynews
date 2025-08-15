'use client';
// Converted from Magic Patterns
import React, { useState, Component } from 'react';
import { X, Copy, Check } from 'lucide-react';
export const ShareModal = ({
  onClose,
  article
}) =>{
  const [copied, setCopied] = useState(false);
  const shareOptions = [{
    name: 'Email',
    icon:<svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>,
    bgColor: 'bg-gray-100'
  }, {
    name: 'Facebook',
    icon:<svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>,
    bgColor: 'bg-blue-100'
  }, {
    name: 'Twitter',
    icon:<svg className="h-6 w-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>,
    bgColor: 'bg-gray-100'
  }, {
    name: 'WhatsApp',
    icon:<svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>,
    bgColor: 'bg-green-100'
  }, {
    name: 'Copy Link',
    icon:<svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>,
    bgColor: 'bg-gray-100'
  }];
  const handleCopyLink = () => {
    // In a real app, we would copy the actual URL to clipboard
    navigator.clipboard.writeText('https://day.news/article/' + encodeURIComponent(article.title.toLowerCase().replace(/\s+/g, '-')));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = option => {
    if (option.name === 'Copy Link') {
      handleCopyLink();
    } else {
      // In a real app, we would implement actual sharing functionality
      console.log(`Sharing via ${option.name}`);
      // For demo purposes, we'll just close the modal after a delay
      setTimeout(onClose, 500);
    }
  };
  return<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Share This Story</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4 mb-6">
            {shareOptions.map((option, index) => <button key={index} className="flex flex-col items-center" onClick={() => handleShare(option)}>
                <div className={`h-12 w-12 rounded-full ${option.bgColor} flex items-center justify-center mb-1`}>
                  {option.icon}
                </div>
                <span className="text-xs text-gray-600">{option.name}</span>
              </button>)}
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">
              Or share with link:
            </div>
            <div className="flex">
              <input type="text" value={`day.news/article/${article.title.toLowerCase().replace(/\s+/g, '-')}`} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50" />
              <button className={`px-4 py-2 rounded-r-md text-sm font-medium flex items-center ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`} onClick={handleCopyLink}>
                {copied ? <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </> : <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};