import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

const GallerySection = ({ property }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get images from property data
  const getImages = () => {
    const images = [];
    
    if (property?.propertyFeaturedImage) {
      images.push({
        src: property.propertyFeaturedImage,
        alt: property.propertyTitle || 'Property image'
      });
    }

    if (property?.media?.length > 0) {
      property.media.forEach(img => {
        images.push({
          src: img,
          alt: property.propertyTitle || 'Property image'
        });
      });
    }

    return images.length > 0 ? images : [];
  };

  const images = getImages();
  
  // Open lightbox
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };
  
  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };
  
  // Navigate to next image in lightbox
  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };
  
  // Navigate to previous image in lightbox
  const goToPrevious = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);
  
  // If no images, don't render the section
  if (images.length === 0) {
    return null;
  }
  
  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <h3 className="text-xl font-semibold">Gallery</h3>
              <button 
                onClick={closeLightbox}
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
                  src={selectedImage.src} 
                  alt={selectedImage.alt}
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
                      setSelectedImage(image);
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
      
      {/* Gallery Section */}
      <motion.section 
        id="gallery"
        className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Image className="text-red-500" size={24} />
            Property Gallery
          </h2>
          
          <p className="text-gray-500 mt-2 md:mt-0">{images.length} Photos</p>
        </div>
        
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Featured image (larger) */}
          {images.length > 0 && (
            <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden h-80 cursor-pointer relative group" onClick={() => openLightbox(0)}>
              <img 
                src={images[0].src} 
                alt={images[0].alt} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-full">
                  <Grid size={20} className="text-gray-800" />
                </div>
              </div>
            </div>
          )}
          
          {/* Other images */}
          {images.slice(1, 7).map((image, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden h-40 cursor-pointer relative group"
              onClick={() => openLightbox(index + 1)}
            >
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-full">
                  <Grid size={20} className="text-gray-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View all photos button (if more than 7 images) */}
        {images.length > 7 && (
          <div className="mt-6 text-center">
            <motion.button 
              onClick={() => openLightbox(0)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Grid size={18} />
              View All Photos ({images.length})
            </motion.button>
          </div>
        )}
      </motion.section>
    </>
  );
};

export default GallerySection;
