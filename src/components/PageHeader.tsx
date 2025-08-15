import React from 'react';
import { ArrowLeft } from 'lucide-react';
export const PageHeader = () => {
  const goBack = () => {
    window.history.back();
  };
  return <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>;
};