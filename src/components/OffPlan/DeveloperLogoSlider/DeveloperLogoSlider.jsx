import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeveloperLogoSlider = ({ properties }) => {
  const sliderRef = useRef(null);
  const [developers, setDevelopers] = useState([]);

  // Extract unique developers from all properties
  useEffect(() => {
    if (!properties || !properties.length) return;

    const uniqueDevelopers = properties.reduce((acc, property) => {
      // Skip if no developer info
      if (!property.developer) return acc;

      // Check if developer already exists in our accumulator
      const existingDev = acc.find(dev => dev.name === property.developer);

      if (!existingDev) {
        // Add new developer
        acc.push({
          name: property.developer,
          // Use developer image if available, otherwise use property image
          logo: property.developerImage || property.propertyFeaturedImage,
          count: 1
        });
      } else {
        // Increment count for existing developer
        existingDev.count += 1;

        // Update logo if current property has a developer image and existing one doesn't
        if (property.developerImage && !existingDev.logo) {
          existingDev.logo = property.developerImage;
        }
      }

      return acc;
    }, []);

    // Sort by number of properties (most popular first)
    setDevelopers(uniqueDevelopers.sort((a, b) => b.count - a.count));
  }, [properties]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.5
        : scrollLeft + clientWidth * 0.5;

      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (!developers.length) {
    return null;
  }

  return (
    <div className="relative mb-16 mt-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Meet the Masters Behind the Projects</h2>
          <p className="text-sm mt-2 text-gray-600 font-regular">Get to know Dubai's leading developers and what sets their visions apart.</p>
          <div className="h-1 w-20 bg-[#FF2626] mt-2 rounded-full"></div>
        </div>
      </div>

      <div className="relative group">
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-gray-600" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-gray-600" />
        </button>

        {/* Logo Slider */}
        <div
          ref={sliderRef}
          className="overflow-x-auto hide-scrollbar flex gap-6 pb-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {developers.map((developer, index) => (
            <motion.div
              key={developer.name + index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="min-w-[120px] w-[120px] h-[100px] flex items-center justify-center relative"
            >
              <div className="w-full h-full bg-white rounded-lg border border-gray-200 hover:border-[#FF2626]/30 transition-all duration-300 p-3 flex items-center justify-center overflow-hidden">
                {developer.logo ? (
                  <img
                    src={developer.logo}
                    alt={developer.name}
                    className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-gray-500 font-medium text-center">{developer.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>


            </motion.div>
          ))}
        </div>
      </div>

      {/* Scrollbar Indicator */}
      <div className="mt-6 flex justify-center">
        <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-[#FF2626] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperLogoSlider;
