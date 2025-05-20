import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFullScreen } from '../../../context/FullScreenContext';

const tabs = [
  { id: 'exteriors', label: 'Exteriors', active: true },
  { id: 'interiors', label: 'Interiors' }
];

const GallerySection = ({ property }) => {
  const [activeTab, setActiveTab] = useState('exteriors');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { setFullScreen } = useFullScreen();

  // Get exteriors and interiors galleries from property data
  const exteriorsImages = property?.exteriorsGallery?.length > 0 
    ? property.exteriorsGallery.map(img => ({ src: img, alt: `${property.propertyTitle || 'Property'} exterior` }))
    : [];
    
  const interiorsImages = property?.interiorsGallery?.length > 0 
    ? property.interiorsGallery.map(img => ({ src: img, alt: `${property.propertyTitle || 'Property'} interior` }))
    : [];

  // Fallback to media array if specific galleries are not available
  if (exteriorsImages.length === 0 && property?.media?.length > 0) {
    // Assume first half of media is exteriors
    const halfIndex = Math.ceil(property.media.length / 2);
    for (let i = 0; i < halfIndex; i++) {
      exteriorsImages.push({ 
        src: property.media[i], 
        alt: `${property.propertyTitle || 'Property'} exterior` 
      });
    }
  }

  if (interiorsImages.length === 0 && property?.media?.length > 0) {
    // Assume second half of media is interiors
    const halfIndex = Math.ceil(property.media.length / 2);
    for (let i = halfIndex; i < property.media.length; i++) {
      interiorsImages.push({ 
        src: property.media[i], 
        alt: `${property.propertyTitle || 'Property'} interior` 
      });
    }
  }
    
  // Use the appropriate gallery based on active tab
  const images = activeTab === 'exteriors' ? exteriorsImages : interiorsImages;

  // Reset current index when tab changes
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);
  
  const goToNext = () => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const goToPrevious = () => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // Toggle fullscreen gallery
  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    // Update the global full-screen state
    setFullScreen(newState);
  };

  return (
    <>
      {/* Fullscreen Gallery */}
      <AnimatePresence>
        {isFullscreen && images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <h3 className="text-xl font-semibold">{activeTab === 'exteriors' ? 'Exteriors' : 'Interiors'} Gallery</h3>
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative">
              {/* Navigation arrows */}
              <button 
                className="absolute left-4 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-10"
                onClick={goToPrevious}
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                className="absolute right-4 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-10"
                onClick={goToNext}
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Main image */}
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[currentIndex].src} 
                  alt={images[currentIndex].alt}
                  className="max-h-[80vh] max-w-[90vw] object-contain"
                />
              </AnimatePresence>
            </div>
            
            {/* Thumbnails */}
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-2">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${index === currentIndex ? 'border-red-500' : 'border-transparent'}`}
                    onClick={() => {
                      setCurrentIndex(index);
                    }}
                  >
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <section className="bg-white rounded-[30px] border border-[#e6e6e6] overflow-hidden mb-8 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Gallery</h2>
          {images.length > 0 && (
            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <Maximize size={18} />
              <span className="text-sm font-medium">View Fullscreen</span>
            </button>
          )}
        </div>
        
        {/* Tab Navigation - unchanged */}
        <div className="flex mb-6 border-b border-[#e6e6e6]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentIndex(0);
              }}
              className={`py-3 px-8 text-center transition-colors ${
                activeTab === tab.id
                  ? 'text-red-500 border-b-2 border-red-500 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Image Gallery - now using property.media */}
        {images.length > 0 ? (
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[15px] overflow-hidden group cursor-pointer" onClick={toggleFullscreen}>
            <div className="w-full h-full relative overflow-hidden">
              <div 
                className="w-full h-full absolute inset-0 flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0">
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full text-gray-700 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full text-gray-700 transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button 
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-white w-4' : 'bg-white/60'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[400px] md:h-[500px] lg:h-[600px] rounded-[15px] bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
    </section>
    </>
  );
};

export default GallerySection;