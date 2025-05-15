import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';

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
  
  // Get developer info
  const developer = property?.developer || 'Developer not specified';
  const developerImage = property?.developerImage;
  
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
      className="bg-white rounded-[30px] shadow-sm overflow-hidden mb-8 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-red-500" size={24} />
          About This Project
        </h2>
        
        {/* Developer Logo/Name - Now beside the title */}
        {(developerImage || developer) && (
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            {developerImage ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img 
                    src={developerImage}
                    alt={`${developer} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{developer}</p>
                </div>
              </div>
            ) : developer ? (
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-lg text-red-500">
                  <Building size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{developer}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Image - Moved before description */}
      {property?.propertyFeaturedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-xl mb-8 shadow-md"
        >
          <img
            src={property.propertyFeaturedImage}
            alt="Property overview"
            className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      )}
      
      {/* Description */}
      {property?.propertyDescription && (
        <div className="relative mb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className={showFullDescription ? '' : 'max-h-[150px] overflow-hidden relative'}>
              <p className="text-gray-700 leading-relaxed text-lg">
                {property.propertyDescription}
              </p>
              
              {!showFullDescription && property.propertyDescription.length > 300 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </div>
            
            {property.propertyDescription && property.propertyDescription.length > 300 && (
              <motion.button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center gap-1 text-red-600 font-medium mt-4 hover:text-red-600 transition-colors"
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
          </motion.div>
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
      
      {/* Project Highlights */}
      {property?.highlights?.length > 0 && (
        <div className="mt-10 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Project Highlights</h3>
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
      
      {/* License Number at the bottom of About section */}
      {property?.dldPermitNumber && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <Shield size={16} className="text-red-500" />
            License number: <span className="font-medium text-gray-700">{property.dldPermitNumber}</span>
          </p>
        </div>
      )}
    </motion.section>
  );
};

export default AboutSection;