import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaWhatsapp, FaHeart, FaRegHeart, FaRulerCombined } from 'react-icons/fa';
import { LiaBedSolid, LiaBathSolid } from 'react-icons/lia';
import { MdOutlineKitchen } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';

const PropertyCardModern = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Handle card click for navigation
  const handleCardClick = (e) => {
    // Prevent navigation if clicking on buttons or links
    if (
      e.target.tagName === 'BUTTON' || 
      e.target.tagName === 'A' || 
      e.target.closest('button') || 
      e.target.closest('a')
    ) {
      return;
    }
    
    // Check if we have a valid property ID
    const propertyId = property?.id || property?._id;
    
    if (!propertyId) {
      console.error('Property ID is undefined', property);
      return;
    }
    
    // Navigate based on property category
    if (property?.category === 'Off Plan') {
      navigate(`/off-plan-single/${propertyId}`);
    } else {
      // For Buy, Rent and other categories
      navigate(`/property-details/${propertyId}`);
    }
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    if (!price) return 'Price on Request';
    
    // If price is already formatted as a string with currency
    if (typeof price === 'string' && price.includes('AED')) {
      return price;
    }
    
    // Format number with commas
    return `AED ${Number(price).toLocaleString()}`;
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{ y: -5 }}
    >
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full">
          {property?.category}
        </span>
        
        {property?.category === 'Off Plan' && property?.deliveryDate && (
          <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            {property?.deliveryDate}
          </span>
        )}
      </div>
      
      {/* Favorite Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFavorite ? 'favorite' : 'not-favorite'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isFavorite ? (
              <FaHeart className="text-red-600 text-lg" />
            ) : (
              <FaRegHeart className="text-gray-400 text-lg" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
      
      {/* Property Image */}
      <div className="relative overflow-hidden h-64">
        <motion.img
          src={property?.image}
          alt={property?.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
        
        {/* Property Price */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <h3 className="text-white font-bold text-xl drop-shadow-md line-clamp-1">
              {formatPrice(property?.price)}
            </h3>
            <p className="text-white/80 text-xs">
              {property?.category === 'Off Plan' ? 'Starting from' : 
               property?.category === 'Rent' ? 'Per year' : ''}
            </p>
          </div>
          
          {/* Property Type Badge */}
          <span className={`py-1 px-3 rounded-lg text-xs font-semibold ${
            property?.propertyType === 'Villa' 
              ? 'bg-amber-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {property?.propertyType}
          </span>
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {property?.name}
        </h2>
        
        {/* Location */}
        <div className="flex items-center text-gray-500 mb-4">
          <FaMapMarkerAlt className="text-red-500 mr-2" />
          <p className="text-sm">{property?.location}</p>
        </div>
        
        {/* Features */}
        <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mb-4">
          <div className="flex items-center">
            <LiaBedSolid className="text-gray-400 mr-1" />
            <span className="text-sm font-medium">{property?.beds} Beds</span>
          </div>
          
          <div className="flex items-center">
            <LiaBathSolid className="text-gray-400 mr-1" />
            <span className="text-sm font-medium">{property?.baths} Baths</span>
          </div>
          
          <div className="flex items-center">
            <MdOutlineKitchen className="text-gray-400 mr-1" />
            <span className="text-sm font-medium">{property?.kitchens} Kitchen</span>
          </div>
          
          {property?.size && (
            <div className="flex items-center">
              <FaRulerCombined className="text-gray-400 mr-1" />
              <span className="text-sm font-medium">{property?.size} sqft</span>
            </div>
          )}
        </div>
        
        {/* Agent/Developer Info */}
        <div className="flex justify-between items-center">
          {property?.category === 'Off Plan' ? (
            // Developer Info
            <div className="flex items-center">
              <img 
                src={property?.developerImage || 'https://via.placeholder.com/40?text=D'} 
                alt={property?.developer || 'Developer'}
                className="h-10 w-auto mr-3 object-contain"
              />
              <div>
                <p className="text-xs text-gray-500">Developed by</p>
                <p className="text-sm font-medium">{property?.developer || 'Developer'}</p>
              </div>
            </div>
          ) : (
            // Agent Info
            <div className="flex items-center">
              <div className="relative mr-3">
                <img 
                  src={property?.agentImage} 
                  alt={property?.agentName}
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm font-medium line-clamp-1">{property?.agentName}</p>
                <p className="text-xs text-gray-500">{property?.agentPosition || 'Real Estate Agent'}</p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {property?.category !== 'Off Plan' && (
              <motion.a
                href={`tel:${property?.agentPhone}`}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <FaPhone />
              </motion.a>
            )}
            
            <motion.a
              href={`https://wa.me/${property?.agentWhatsapp?.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FaWhatsapp />
            </motion.a>
            
            <motion.button
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                const propertyId = property?.id || property?._id;
                if (property?.category === 'Off Plan') {
                  navigate(`/off-plan-single/${propertyId}`);
                } else {
                  navigate(`/property-details/${propertyId}`);
                }
              }}
            >
              <BsArrowRight />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCardModern;
