import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const InvestmentHotspotsSlider = ({ properties }) => {
  const sliderRef = useRef(null);

  // Group properties by location for hotspots
  const locationGroups = properties.reduce((groups, property) => {
    const location = property.propertyAddress?.split(',')[0]?.trim() || 'Other';
    
    if (!groups[location]) {
      groups[location] = {
        location,
        count: 0,
        properties: [],
        image: null
      };
    }
    
    groups[location].count += 1;
    groups[location].properties.push(property);
    
    // Use the first property's image for each location
    if (!groups[location].image && property.propertyFeaturedImage) {
      groups[location].image = property.propertyFeaturedImage;
    }
    
    return groups;
  }, {});

  // Convert to array and sort by property count (most popular first)
  const hotspots = Object.values(locationGroups)
    .filter(group => group.count >= 1) // Only include locations with at least 1 property
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Limit to top 8 locations

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (hotspots.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Top Investment Hotspots</h2>
          <p className="text-sm mt-2 text-gray-600 font-regular">When it comes to off-plan properties, location is everything. Explore Dubai's most in-demand communities for high-potential investments.</p>
          <div className="h-1 w-20 bg-[#FF2626] mt-2 rounded-full"></div>
        </div>
      </div>
      
      <div className="relative group">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-gray-600" />
        </button>
        
        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-gray-600" />
        </button>
        
        {/* Slider Container */}
        <div 
          ref={sliderRef}
          className="overflow-x-auto hide-scrollbar flex gap-4 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hotspots.map((hotspot, index) => (
            <motion.div 
              key={hotspot.location}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="min-w-[280px] rounded-xl overflow-hidden shadow-lg group cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-[180px]">
                <img 
                  src={hotspot.image} 
                  alt={hotspot.location} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-xl mb-1">{hotspot.location}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-white/90 text-sm">{hotspot.count} {hotspot.count === 1 ? 'Property' : 'Properties'}</p>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
                      Trending
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Custom Scrollbar Indicator */}
      <div className="mt-6 flex justify-center">
        <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-[#FF2626] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentHotspotsSlider;
