'use client';
// Converted from Magic Patterns
import React, { useState, useEffect } from 'react';;
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Camera, ChevronRight, User } from 'lucide-react';
export const PhotoGallerySection = () =>{
  const router = useRouter();
  // Mock photo gallery data
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPhotos(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, []);
  const handleViewAllPhotos = () => {
    router.push('/photos');
  };
  const handlePhotoClick = photoId => {
    router.push(`/photos/${photoId}`);
  };
  return<div>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo, index) => <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden group cursor-pointer" onClick={() => handlePhotoClick(photo.id)}>
            <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h4 className="text-white text-sm font-medium truncate">
                {photo.title}
              </h4>
              <div className="flex items-center text-white text-xs mt-1">
                <User className="h-3 w-3 mr-1" />
                <span>{photo.photographer}</span>
              </div>
            </div>
          </div>)}
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="text-xs text-gray-500 flex items-center">
          <Camera className="h-3.5 w-3.5 mr-1" />
          <span>Community Photos</span>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors" onClick={handleViewAllPhotos}>
          View All Photos
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>;
};