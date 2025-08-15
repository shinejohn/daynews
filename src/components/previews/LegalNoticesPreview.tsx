'use client';
// Converted from Magic Patterns
import React, { useState, useEffect } from 'react';;
import { supabase } from '@/lib/supabase/client';
import { Calendar, ChevronRight, FileText, Gavel, Scale } from 'lucide-react';
export const LegalNoticesPreview = ({
  onViewAll,
  onNoticeClick
}) =>{
  // Mock data for legal notices
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setNotices(data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotices();
  }, []);
  return<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Gavel className="h-5 w-5 text-indigo-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Legal Notices
          </h3>
        </div>
        <button onClick={onViewAll} className="text-sm text-indigo-700 font-medium flex items-center hover:underline">
          Browse All <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {notices.map(notice => <div key={notice.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNoticeClick(notice.id)}>
            <div className="p-4">
              <div className={`text-xs font-medium text-${notice.typeColor} mb-1`}>
                {notice.type}
              </div>
              <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">
                {notice.preview}
              </h4>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>#{notice.caseNumber}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{notice.publishDate}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 bg-${notice.statusColor}-100 text-${notice.statusColor}-700 rounded-full`}>
                  {notice.status}
                </span>
                <button className="text-xs text-indigo-700 hover:underline flex items-center">
                  View <ChevronRight className="h-3 w-3 ml-0.5" />
                </button>
              </div>
            </div>
          </div>)}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Scale className="h-4 w-4 mr-2 text-indigo-700" />
            <p>Need to publish a legal notice?{' '}<a href="/legalNoticeCreator" className="text-indigo-700 hover:underline">
                Create one here
              </a>
            </p>
          </div>
          <button onClick={onViewAll} className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-800 transition-colors">
            View All Notices
          </button>
        </div>
      </div>
    </div>;
};