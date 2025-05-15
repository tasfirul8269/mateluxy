import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Download, 
  ExternalLink, 
  Heart, 
  MapPin, 
  Tag, 
  Building, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertS3UrlToProxyUrl } from '../../../utils/s3UrlConverter';

const HeroBanner = ({ property }) => {
  // Create images array from property data
  const getImages = () => {
    const images = [];
    
    if (property?.propertyFeaturedImage) {
      images.push({
        src: processImageUrl(property.propertyFeaturedImage),
        alt: property.propertyTitle || 'Property image'
      });
    }

    if (property?.media?.length > 0) {
      property.media.forEach(img => {
        images.push({
          src: processImageUrl(img),
          alt: property.propertyTitle || 'Property image'
        });
      });
    }

    return images.length > 0 ? images : null;
  };

  // Helper function to process image URLs
  const processImageUrl = (url) => {
    // Check if it's a base64 image
    if (url && url.startsWith('data:')) {
      return url;
    }
    
    // Otherwise convert S3 URL to proxy URL
    return convertS3UrlToProxyUrl(url);
  };

  const images = getImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  // Handle touch events for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left - go to next image
      goToNext();
    }
    
    if (touchEnd - touchStart > 100) {
      // Swipe right - go to previous image
      goToPrevious();
    }
  };
  
  // Toggle fullscreen gallery
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Toggle favorite
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Get all property details dynamically
  const projectName = property?.propertyTitle;
  const description = property?.propertyDescription;
  const price = property?.propertyPrice ? `AED ${property.propertyPrice.toLocaleString()}` : 'Price on request';
  const area = property?.propertySize ? `${property.propertySize} sq. ft` : 'Area not specified';
  const bedrooms = property?.propertyBedrooms?.toString() || 'Not specified';
  const location = property?.propertyState || property?.propertyAddress || 'Location not specified';
  const developer = property?.developer || 'Developer not specified';
  const licenseNumber = property?.dldPermitNumber;
  const brochureFile = property?.brochureFile;
  const completionDate = property?.completionDate;
  const propertyType = property?.propertyType || 'Property type not specified';
  const features = property?.features || [];
  const amenities = property?.amenities || [];
  const exactLocation = property?.exactLocation;
  const tags = property?.tags || [];
  
  // Format completion date if available
  const formattedCompletionDate = completionDate 
    ? new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified';

  // Only render if we have at least some property data
  if (!property) {
    return <div className="text-center py-10">Loading property data...</div>;
  }

  return (
    <>
      {/* Fullscreen Gallery */}
      <AnimatePresence>
        {isFullscreen && images && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4"
          >
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>
            
            <div className="relative w-full max-w-6xl h-[80vh] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentIndex}
                  src={images[currentIndex].src} 
                  alt={images[currentIndex].alt} 
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onLoad={() => setIsLoading(false)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </AnimatePresence>
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center w-full max-w-6xl mt-4">
              <button 
                onClick={goToPrevious}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
              
              <button 
                onClick={goToNext}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            <div className="flex justify-center mt-4 gap-2 overflow-x-auto max-w-full pb-2">
              {images.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative h-16 w-24 rounded-lg overflow-hidden transition-all ${currentIndex === index ? 'ring-2 ring-red-500 scale-105' : 'opacity-70'}`}
                >
                  <img 
                    src={img.src} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modern Hero Banner Design - Similar to Previous */}
      <section className="mb-8 relative">
        {/* Main Hero Section */}
        <div className="relative rounded-[30px] overflow-hidden mb-6 shadow-xl">
          {/* Main Image */}
          {images ? (
            <div className="relative h-[75vh] w-full group">
              <div className="w-full h-full overflow-hidden relative">
                <motion.div
                  className="w-full h-full absolute inset-0 flex"
                  animate={{ x: `-${currentIndex * 100}%` }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  {images.map((image, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        onLoad={() => setIsLoading(false)}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
              
              {/* Gradient Overlay - Enhanced with red accent */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-transparent mix-blend-overlay"></div>
              </div>
              
              {/* Image Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                  {images.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Arrow Navigation Buttons - Appear on Hover */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md border border-white/20 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md border border-white/20 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Top badges area with property category and tags */}
              <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3 z-10">
                {/* Property Category Badge */}
                {property?.category && (
                  <div className={`px-4 py-2 ${property.category === 'Off Plan' ? 'bg-red-600' : 
                                  property.category === 'Ready' ? 'bg-red-500' : 
                                  property.category === 'Secondary' ? 'bg-red-700' : 
                                  'bg-red-500'} text-white font-semibold rounded-full text-sm shadow-lg border border-white/30`}>
                    {property.category === 'Off Plan' ? 'New Launch' : property.category}
                  </div>
                )}
                
                {/* Property Tags beside launch type - Improved visibility */}
                {tags && tags.length > 0 && tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-sm font-medium rounded-full shadow-md border border-white/30">
                    <Tag size={12} className="text-red-400" />
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Control buttons - Improved visibility */}
              <div className="absolute top-6 right-6 flex space-x-3 z-10">
                <button 
                  onClick={toggleFullscreen}
                  className="bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all backdrop-blur-md shadow-lg border border-white/30"
                  aria-label="View fullscreen"
                >
                  <ExternalLink size={18} className="text-red-100" />
                </button>
                <button 
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-all backdrop-blur-md shadow-lg border border-white/30 ${isFavorite ? 'bg-red-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white'}`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} className="text-red-100" />
                </button>
              </div>
              
              {/* Property Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Property Title */}
                  {projectName && (
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                      {projectName}
                    </h1>
                  )}
                  
                  {/* Location removed as requested */}
                  
                  {/* Property Key Info - Enhanced with red accents and blurry background */}
                  <div className="flex flex-wrap gap-x-4 gap-y-3 mb-8">
                    {price && (
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-5 py-2.5 rounded-xl shadow-lg border border-red-500/30">
                        <span className="font-semibold text-lg">{price}</span>
                      </div>
                    )}
                    {area && (
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-5 py-2.5 rounded-xl shadow-lg border border-red-500/30">
                        <span className="font-semibold">{area}</span>
                      </div>
                    )}
                    {bedrooms && (
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-5 py-2.5 rounded-xl shadow-lg border border-red-500/30">
                        <span className="font-semibold">{bedrooms} Bed</span>
                      </div>
                    )}
                    {completionDate && (
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-5 py-2.5 rounded-xl shadow-lg border border-red-500/30">
                        <Calendar size={18} className="text-red-300" />
                        <span className="font-semibold">{formattedCompletionDate}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons - Updated with red color scheme */}
                  <div className="flex flex-wrap gap-5 mt-8">
                    {brochureFile && (
                      <motion.a 
                        href={brochureFile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-8 rounded-xl transition-all text-center flex items-center gap-3 shadow-lg font-medium border border-red-400/30"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download size={20} />
                        Download Brochure
                      </motion.a>
                    )}
                    <motion.button 
                      className="cursor-pointer bg-white/10 hover:bg-white/20 text-white py-4 px-8 rounded-xl transition-all flex items-center gap-3 backdrop-blur-md shadow-lg font-medium border border-white/20"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get a consultation
                      <ArrowRight size={20} className="text-red-300" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="h-[75vh] bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center rounded-[30px]">
              <p className="text-gray-500 font-medium text-lg">No images available</p>
            </div>
          )}
        </div>
        
        {/* Additional tags - Only show if there are more than 3 tags */}
        {tags && tags.length > 3 && (
          <div className="flex flex-wrap gap-3 mb-6 mt-4">
            {tags.slice(3).map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors shadow-sm border border-red-200">
                <Tag size={14} className="text-red-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default HeroBanner;