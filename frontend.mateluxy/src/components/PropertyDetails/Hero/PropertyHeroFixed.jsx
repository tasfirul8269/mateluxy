import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  ExternalLink, 
  Heart, 
  MapPin, 
  Tag, 
  Maximize,
  Share2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoBedOutline } from "react-icons/io5";
import { LiaBathSolid } from "react-icons/lia";
import { FaRegCalendarAlt } from "react-icons/fa";


const PropertyHeroFixed = ({ property }) => {
  // Create images array from property data 
  const getImages = () => {
    const images = [];
    const fallbackImage = 'https://placehold.co/1200x800/red/white?text=Property';
    
    // Add featured image if available
    if (property?.propertyFeaturedImage && property.propertyFeaturedImage.trim() !== '') {
      images.push({
        src: property.propertyFeaturedImage,
        alt: property.propertyTitle || 'Property image'
      });
    }
    
    // Add other property images if available
    if (property?.media && Array.isArray(property.media) && property.media.length > 0) {
      property.media.forEach((img, index) => {
        if (img && img.trim() !== '') {
          images.push({
            src: img,
            alt: `${property.propertyTitle || 'Property'} image ${index + 1}`
          });
        }
      });
    }
    
    // If no valid images found, use fallback
    if (images.length === 0) {
      images.push({
        src: fallbackImage,
        alt: 'Property placeholder'
      });
    }
    
    // Add some demo images for testing if we have less than 3 images
    if (images.length < 3) {
      const demoImages = [
        'https://placehold.co/1200x800/red/white?text=Property+1',
        'https://placehold.co/1200x800/red/white?text=Property+2',
        'https://placehold.co/1200x800/red/white?text=Property+3',
        'https://placehold.co/1200x800/red/white?text=Property+4'
      ];
      
      for (let i = 0; i < demoImages.length && images.length < 5; i++) {
        images.push({
          src: demoImages[i],
          alt: `Demo property image ${i + 1}`
        });
      }
    }
    
    console.log('Images for slider:', images);
    return images;
  };

  const images = getImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Log property data for debugging
  useEffect(() => {
    console.log('Property data:', property);
  }, [property]);
  
  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
    setImageError(false);
  }, [currentIndex]);
  
  // Handle image load error
  const handleImageError = () => {
    console.log('Image loading error');
    setImageError(true);
    setIsLoading(false);
  };

  // Handle image navigation
  const goToPrevious = () => {
    console.log('Going to previous image');
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? images.length - 1 : prevIndex - 1;
      console.log('Previous index:', prevIndex, 'New index:', newIndex);
      return newIndex;
    });
  };
  
  const goToNext = () => {
    console.log('Going to next image');
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
      console.log('Previous index:', prevIndex, 'New index:', newIndex);
      return newIndex;
    });
  };
  
  // Auto-advance the slider every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return; // Don't auto-advance if there's only one image
    
    const interval = setInterval(() => {
      if (!isFullscreen) { // Only auto-advance when not in fullscreen mode
        goToNext();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, isFullscreen, goToNext]);
  
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
    console.log('Toggling fullscreen gallery:', !isFullscreen);
    setIsFullscreen(!isFullscreen);
    // When opening fullscreen, make sure body doesn't scroll
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Toggle favorite
  const toggleFavorite = (e) => {
    if (e) e.stopPropagation();
    console.log('Toggling favorite state:', !isFavorite);
    setIsFavorite(!isFavorite);
    // Here you would typically save this to user preferences in a real app
    // For demo purposes, just show a notification
    if (!isFavorite) {
      alert('Property added to wishlist!');
    } else {
      alert('Property removed from wishlist!');
    }
  };

  // Get all property details dynamically
  const propertyName = property?.propertyTitle;
  const description = property?.propertyDescription;
  const price = property?.propertyPrice ? `AED ${property.propertyPrice.toLocaleString()}` : 'Price on request';
  const area = property?.propertySize ? `${property.propertySize} sq. ft` : 'Area not specified';
  const bedrooms = property?.propertyBedrooms?.toString() || 'Not specified';
  const bathrooms = property?.propertyBathrooms?.toString() || 'Not specified';
  const location = property?.propertyState || property?.propertyAddress || 'Location not specified';
  const propertyType = property?.propertyType || 'Property type not specified';
  const features = property?.features || [];
  const amenities = property?.amenities || [];
  const tags = property?.tags || [];
  
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
            className="fixed inset-0 bg-black z-100 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <h3 className="text-xl font-semibold">{property?.propertyTitle || 'Property Gallery'}</h3>
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-10"
              >
                <ChevronLeft size={32} />
              </button>
              
              <div className="w-full h-full flex items-center justify-center p-4">
                <img 
                  src={images[currentIndex]?.src} 
                  alt={images[currentIndex]?.alt}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    console.log('Error loading fullscreen image, using fallback');
                    e.target.src = 'https://placehold.co/1200x800/red/white?text=Property';
                  }}
                />
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-10"
              >
                <ChevronRight size={32} />
              </button>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="p-4 bg-black/70">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${index === currentIndex ? 'border-red-500' : 'border-transparent'}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-full object-cover cursor-pointer"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/1200x800/red/white?text=Property';
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-white mt-2">
                <div>{currentIndex + 1} / {images.length}</div>
                <div>{property?.propertyType || 'Property'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <section className="relative">
        {/* Main Hero Banner */}
        <div className="relative">
          <div 
            className="relative h-[75vh] overflow-hidden rounded-[30px] group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image Gallery */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="h-full w-full"
                >
                  <img 
                    src={images[currentIndex].src} 
                    alt={images[currentIndex].alt} 
                    className="w-full h-full object-cover"
                    onLoad={() => setIsLoading(false)}
                    onError={handleImageError}
                  />
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/20 backdrop-blur-sm">
                      <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Navigation buttons - only visible on hover and when not in fullscreen */}
            {!isFullscreen && (
              <>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event bubbling
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-all z-50 cursor-pointer opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event bubbling
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-all z-50 cursor-pointer opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            {/* Action buttons - always visible when not in fullscreen */}
            {!isFullscreen && (
              <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Opening fullscreen gallery');
                    toggleFullscreen();
                  }}
                  className="p-3 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors cursor-pointer"
                  aria-label="View all photos"
                >
                  <Maximize size={20} />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Toggling favorite');
                    toggleFavorite(e);
                  }}
                  className={`p-3 rounded-full text-white transition-colors cursor-pointer ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-black/30 hover:bg-black/50'}`}
                  aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={20} fill={isFavorite ? 'white' : 'none'} />
                </button>
              </div>
            )}
            
            {/* Image counter and view all button - only visible on hover and when not in fullscreen */}
            {!isFullscreen && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 z-50 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="bg-black/50 hover:bg-black/70 text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors cursor-pointer"
                  aria-label="View all photos"
                >
                  <Maximize size={16} />
                  <span>View All</span>
                </button>
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            )}
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
              <div className="container mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-white max-w-3xl"
                >
                  {/* Property Type Tag */}
                  <div className="mb-4">
                    <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {propertyType}
                    </span>
                  </div>
                  
                  {/* Property Title */}
                  <h1 className="text-4xl font-bold mb-2">{propertyName}</h1>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin size={18} className="text-red-300" />
                    <span className="text-lg">{location}</span>
                  </div>
                  
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
                        <IoBedOutline className="text-red-300" size={18} />
                        <span className="font-semibold">{bedrooms} Bed</span>
                      </div>
                    )}
                    {bathrooms && (
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-5 py-2.5 rounded-xl shadow-lg border border-red-500/30">
                        <LiaBathSolid className="text-red-300" size={18} />
                        <span className="font-semibold">{bathrooms} Bath</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons - Updated with red color scheme */}
                  <div className="flex flex-wrap gap-5 mt-8">
                    <motion.button 
                      onClick={() => {
                        const bookingForm = document.getElementById('booking-form');
                        if (bookingForm) {
                          bookingForm.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-8 rounded-xl transition-all text-center flex items-center gap-3 shadow-lg font-medium border border-red-400/30"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaRegCalendarAlt size={20} />
                      Book a viewing
                    </motion.button>
                    <motion.button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                      className="cursor-pointer bg-white/10 hover:bg-white/20 text-white py-4 px-8 rounded-xl transition-all flex items-center gap-3 backdrop-blur-md shadow-lg font-medium border border-white/20"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 size={20} />
                      Share
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional tags - Only show if there are tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6 mt-4">
            {tags.map((tag, index) => (
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

export default PropertyHeroFixed;
