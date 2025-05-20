import React from 'react';

const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      
      <div className="p-5">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        
        {/* Location skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        
        {/* Features skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
        </div>
        
        {/* Completion date skeleton */}
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;