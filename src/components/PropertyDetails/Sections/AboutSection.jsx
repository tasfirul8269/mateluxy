import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Utensils, 
  Music, 
  Dumbbell, 
  Wifi,
  Shield,
  Droplet,
  ParkingSquare,
  Smartphone,
  Leaf,
  ShoppingCart,
  BookOpen,
  Building,
  Heart,
  Plane,
  Bike,
  Bus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Info
} from 'lucide-react';
import { IoBedOutline } from "react-icons/io5";
import { LiaBathSolid } from "react-icons/lia";

// Enhanced icon mapping with available icons
const featureIcons = {
  'Restaurant': <Utensils className="text-red-500" size={24} />,
  'Clubhouse': <Home className="text-red-500" size={24} />,
  'Gym': <Dumbbell className="text-red-500" size={24} />,
  'Spa': <Droplet className="text-red-500" size={24} />,
  'Entertainment': <Music className="text-red-500" size={24} />,
  'Security': <Shield className="text-red-500" size={24} />,
  'Parking': <ParkingSquare className="text-red-500" size={24} />,
  'Smart Home': <Smartphone className="text-red-500" size={24} />,
  'Wifi': <Wifi className="text-red-500" size={24} />,
  'Swimming Pool': <Droplet className="text-red-500" size={24} />,
  'Garden': <Leaf className="text-red-500" size={24} />,
  'Shopping': <ShoppingCart className="text-red-500" size={24} />,
  'School': <BookOpen className="text-red-500" size={24} />,
  'Landmark': <Building className="text-red-500" size={24} />,
  'Healthcare': <Heart className="text-red-500" size={24} />,
  'Airport': <Plane className="text-red-500" size={24} />,
  'Cycling': <Bike className="text-red-500" size={24} />,
  'Public Transport': <Bus className="text-red-500" size={24} />
};

// Feature descriptions
const featureDescriptions = {
  'Gym': 'Fully-equipped fitness center with state-of-the-art equipment',
  'Spa': 'Luxury spa facilities for ultimate relaxation',
  'Swimming Pool': 'Temperature-controlled swimming pools with lounging areas',
  'Restaurant': 'Fine dining restaurants with international cuisine',
  'Clubhouse': 'Exclusive clubhouse for residents with various facilities',
  'Entertainment': 'Entertainment facilities for all age groups',
  'Security': '24/7 security with CCTV surveillance and trained personnel',
  'Parking': 'Dedicated parking spaces for residents and visitors',
  'Smart Home': 'Smart home automation for modern living',
  'Wifi': 'High-speed internet connectivity throughout the premises',
  'Garden': 'Landscaped gardens and green spaces for relaxation',
  'Shopping': 'Retail outlets and shopping facilities within the complex',
  'School': 'Proximity to reputed educational institutions',
  'Landmark': 'Close to major landmarks and attractions',
  'Healthcare': 'Medical facilities and healthcare services nearby',
  'Airport': 'Easy access to international airport',
  'Cycling': 'Cycling tracks and facilities for fitness enthusiasts',
  'Public Transport': 'Well-connected to public transportation network'
};

const AboutSection = ({ property }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Debug the property description
  useEffect(() => {
    if (property?.propertyDescription) {
      console.log('Property description length:', property.propertyDescription.length);
    }
  }, [property]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.section 
      className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Info className="text-red-500" size={24} />
          About This Property
        </h2>
      </div>
      
      {/* Property Overview */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Property Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Property Type */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Property Type</p>
            <p className="font-semibold text-gray-800">{property.propertyType || 'Not specified'}</p>
          </div>
          
          {/* Bedrooms */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Bedrooms</p>
            <div className="flex items-center gap-2">
              <IoBedOutline className="text-red-500" size={18} />
              <p className="font-semibold text-gray-800">{property.propertyBedrooms || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Bathrooms */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Bathrooms</p>
            <div className="flex items-center gap-2">
              <LiaBathSolid className="text-red-500" size={18} />
              <p className="font-semibold text-gray-800">{property.propertyBathrooms || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Size */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Size</p>
            <p className="font-semibold text-gray-800">{property.propertySize ? `${property.propertySize} sq. ft` : 'Not specified'}</p>
          </div>
          
          {/* Price */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Price</p>
            <p className="font-semibold text-gray-800">{property.propertyPrice ? `AED ${property.propertyPrice.toLocaleString()}` : 'Price on request'}</p>
          </div>
          
          {/* Location */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Location</p>
            <p className="font-semibold text-gray-800">{property.propertyState || property.propertyAddress || 'Not specified'}</p>
          </div>
        </div>
      </div>
      
      {/* Property Description */}
      {property?.propertyDescription && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
          <div className="relative">
            <div className={`prose max-w-none relative ${!showFullDescription && property.propertyDescription && property.propertyDescription.length > 300 ? 'max-h-40 overflow-hidden' : ''}`}>
              <p className="text-gray-700">
                {property.propertyDescription}
              </p>
              
              {!showFullDescription && property.propertyDescription && property.propertyDescription.length > 300 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              )}
            </div>
            
            {property.propertyDescription && property.propertyDescription.length > 300 && (
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Toggle description:', !showFullDescription);
                  setShowFullDescription(prevState => {
                    console.log('Previous state:', prevState, 'New state:', !prevState);
                    return !prevState;
                  });
                }}
                className="flex items-center gap-1 text-red-600 font-medium mt-4 hover:text-red-700 transition-colors cursor-pointer z-50 relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp size={18} />
                    <span>Read Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={18} />
                    <span>Read More</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      )}
      
      {/* Features */}
      {property?.features?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Key Features & Amenities</h3>
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-6"
          >
            {property.features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="flex items-start gap-2 group p-3 rounded-xl hover:bg-red-50/50 transition-all border border-transparent hover:border-red-300"
              >
                <div className="bg-red-50 p-2 rounded-lg text-red-500 group-hover:bg-red-100 transition-colors">
                  {featureIcons[feature] || <CheckCircle size={18} />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-red-600 transition-colors">{feature}</h4>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
      
      {/* Property Highlights */}
      {property?.highlights?.length > 0 && (
        <div className="mt-10 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Property Highlights</h3>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-100">
            <motion.ul 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {property.highlights.map((highlight, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 hover:bg-white/80 p-2 rounded-lg transition-colors"
                >
                  <div className="bg-red-100 p-1 rounded-full text-red-600 mt-1">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-gray-700">{highlight}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default AboutSection;
