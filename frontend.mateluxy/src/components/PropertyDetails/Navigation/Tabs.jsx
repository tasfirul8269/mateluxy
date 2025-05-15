import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Image, MapPin } from 'lucide-react';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('about');
  
  // Handle scroll to section when tab is clicked
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -100; // Offset for fixed header
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  
  // Update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for highlighting
      
      const aboutSection = document.getElementById('about');
      const gallerySection = document.getElementById('gallery');
      const locationSection = document.getElementById('location');
      
      if (aboutSection && gallerySection && locationSection) {
        const aboutTop = aboutSection.offsetTop;
        const galleryTop = gallerySection.offsetTop;
        const locationTop = locationSection.offsetTop;
        
        if (scrollPosition >= locationTop) {
          setActiveTab('location');
        } else if (scrollPosition >= galleryTop) {
          setActiveTab('gallery');
        } else {
          setActiveTab('about');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 p-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors ${
            activeTab === 'about' 
              ? 'bg-red-50 text-red-600 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => {
            setActiveTab('about');
            scrollToSection('about');
          }}
        >
          <Info size={18} />
          <span>About</span>
        </button>
        
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors ${
            activeTab === 'gallery' 
              ? 'bg-red-50 text-red-600 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => {
            setActiveTab('gallery');
            scrollToSection('gallery');
          }}
        >
          <Image size={18} />
          <span>Gallery</span>
        </button>
        
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors ${
            activeTab === 'location' 
              ? 'bg-red-50 text-red-600 font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => {
            setActiveTab('location');
            scrollToSection('location');
          }}
        >
          <MapPin size={18} />
          <span>Location</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Tabs;
