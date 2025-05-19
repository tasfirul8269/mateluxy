import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LatestLaunchesSlider = ({ properties }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Sort properties by creation date (newest first)
  const sortedProperties = [...properties].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }).slice(0, 10); // Take only the 10 most recent properties

  // Check if scroll arrows should be shown
  useEffect(() => {
    const checkScroll = () => {
      if (!sliderRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    // Initial check
    checkScroll();
    
    // Add event listener
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScroll);
      return () => slider.removeEventListener('scroll', checkScroll);
    }
  }, [sortedProperties]);

  // Handle scroll
  const scroll = (direction) => {
    if (!sliderRef.current) return;
    
    const { clientWidth } = sliderRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
    
    sliderRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Navigate to property details
  const handlePropertyClick = (propertyId) => {
    navigate(`/off-plan-single/${propertyId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="relative mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Latest Project Launches</h2>
          <p className="text-sm mt-2 text-gray-600 font-regular">Explore the latest off-plan projects making waves in UAE!</p>
          <div className="h-1 w-20 bg-[#FF2626] mt-2 rounded-full"></div>
        </div>
      </div>
      
      <div className="relative group">
        {/* Left scroll arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 opacity-90 hover:opacity-100 transition-all hover:bg-[#FF2626] hover:text-white group"
            aria-label="Scroll left"
          >
            <FaChevronLeft size={18} className="text-gray-700 group-hover:text-white transition-colors" />
          </button>
        )}
        
        {/* Right scroll arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 opacity-90 hover:opacity-100 transition-all hover:bg-[#FF2626] hover:text-white group"
            aria-label="Scroll right"
          >
            <FaChevronRight size={18} className="text-gray-700 group-hover:text-white transition-colors" />
          </button>
        )}
        
        {/* Slider container */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 pt-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedProperties.map((property) => (
            <div 
              key={property._id}
              onClick={() => handlePropertyClick(property._id)}
              className="w-[300px] bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl border border-gray-100 cursor-pointer transition-all duration-300 flex-shrink-0 transform hover:-translate-y-1 hover:border-[#FF2626]/20"
            >
              {/* Property image */}
              <div className="relative h-[180px] overflow-hidden">
                <img 
                  src={property.propertyFeaturedImage} 
                  alt={property.propertyTitle}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute top-0 left-0 bg-[#FF2626] text-white text-xs px-3 py-1 m-3 rounded-full font-medium tracking-wide shadow-md">
                  NEW LAUNCH
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                  <div className="text-white font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(property.createdAt)}
                  </div>
                </div>
              </div>
              
              {/* Property details */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 mb-2 truncate text-lg">{property.propertyTitle}</h3>
                <div className="flex items-center gap-2 mb-3 max-w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-gray-600 text-sm whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: 'calc(100% - 20px)' }}>
                    {property.propertyAddress}
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-xs font-medium">{property.propertyType}</div>
                  <div className="text-[#FF2626] font-bold">AED {property.propertyPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LatestLaunchesSlider;
