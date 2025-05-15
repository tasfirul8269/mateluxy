import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaWhatsapp, FaHeart, FaRegHeart } from 'react-icons/fa';
import { FaKitchenSet } from 'react-icons/fa6';
import { LiaBedSolid, LiaBathSolid } from 'react-icons/lia';
import "animate.css";
import { useNavigate } from 'react-router-dom';

import locationImg from "../../assets/group-39519-2.svg";
import bath from "../../assets/ic_bath.svg";
import bed from "../../assets/ic_bed.svg";
import kitchen from "../../assets/vector-1.svg";
import divider from "../../assets/line-2.svg";

const ProCard = ({ property }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  
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

  return (
    <motion.div 
      className="w-full h-[580px] p-[15px] my-5 md:my-0 border border-[#e6e6e6] rounded-[20px] bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-[15px] group">
        <motion.img 
          src={property?.image} 
          alt={property?.name} 
          className="w-full h-[214px] object-cover transition-transform duration-500 group-hover:scale-105" 
          whileHover={{ scale: 1.05 }}
        />
        <div className="absolute top-3 right-3 z-10">
          <motion.button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            {isFavorite ? (
              <FaHeart className="text-red-600" />
            ) : (
              <FaRegHeart className="text-gray-400" />
            )}
          </motion.button>
        </div>
        <div className="absolute bottom-3 left-3 z-10">
        {property?.category === 'Off Plan' ?
        <div>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            {property?.category}
          </span>
          <span className="ml-5 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            {property?.deliveryDate ? new Date(property.deliveryDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'TBA'}
          </span>
          </div>
          
          
          : <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {property?.category}
        </span>}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <h3 className="truncate text-[20px] font-semibold text-gray-800 hover:text-red-600 transition-colors">
          {property?.name}
        </h3>
        <motion.span 
          className={`py-[5px] px-[10px] ml-[10px] ${property.propertyType =="Villa" ? 'bg-[#FFF5E7] text-[#FF9B17]' : 'bg-[#EBF8FF] text-[#256FFF]'} rounded-[10px] font-medium text-sm`}
          whileHover={{ scale: 1.05 }}
        >
          {property?.propertyType}
        </motion.span>
      </div>

      {/* location container */}
      <div className="flex justify-start items-center gap-2 mt-2">
        <FaMapMarkerAlt className="text-red-500" />
        <p className="text-[#999999] font-medium text-[14px]">{property?.location}</p>
        
      </div>

      {/* features container */}
      <div className="flex justify-start gap-[20px] items-center my-2 bg-gray-50 p-3 rounded-xl">
        <div className="text-gray-700 flex justify-start items-center gap-2">
          <LiaBedSolid className="w-[20px] h-[20px] text-gray-600" />
          <p className="font-medium text-[16px]">{property?.beds} <span className="text-xs text-gray-500">Beds</span></p>
        </div>

        <div className="h-4 w-[1.5px] bg-[#e6e6e6]"></div>

        <div className="text-gray-700 flex justify-start items-center gap-2">
          <LiaBathSolid className="w-[20px] h-[20px] text-gray-600" />
          <p className="font-medium text-[16px]">{property?.baths} <span className="text-xs text-gray-500">Baths</span></p>
        </div>

        <div className="h-4 w-[1.5px] bg-[#e6e6e6]"></div>

        <div className="text-gray-700 flex justify-start items-center gap-2">
          <FaKitchenSet className="w-[20px] h-[20px] text-gray-600" />
          <p className="font-medium text-[16px]">{property?.kitchens} <span className="text-xs text-gray-500">Kitchen</span></p>
        </div>
      </div>

      {/* Agent container or Developer container for Off Plan */}
      <div className="flex justify-between items-center my-2 gap-3 mb-2 bg-gray-50 p-3 rounded-xl">
        {property?.category === 'Off Plan' ? (
          // Developer information for Off Plan properties
          <div className="flex justify-between items-center w-full">
            <div className="relative">
              <img
                className="w-30 h-12 object-contain"
                src={property?.developerImage || 'https://via.placeholder.com/48?text=D'}
                alt={property?.developer}
              />
            </div>

            {/* Developer name - positioned on the right */}
            <div className="text-right">
              <h3 className="text-md font-semibold text-gray-800">
                Developed by
              </h3>
              <p className="text-[14px] text-gray-700 font-medium">
                {property?.developer || 'Developer'}
              </p>
            </div>
          </div>
        ) : (
          // Agent information for other property types
          <div className="flex gap-3 items-center">
            <div className="relative">
              <img
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                src={property?.agentImage}
                alt={property?.agentName}
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
            </div>

            {/* agent name and languages container */}
            <div>
              <div className="relative">
                {/* Agent name with custom tooltip */}
                <h3 
                  className="text-md font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] cursor-pointer group"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {property?.agentName}
                  {/* Custom tooltip */}
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div 
                        className="absolute z-50 left-0 -top-10 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-max"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {property?.agentName}
                        <div className="absolute bottom-[-6px] left-3 w-3 h-3 bg-gray-800 transform rotate-45"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </h3>
              </div>
              {property?.agentPosition && (
                <p className="text-[12px] text-gray-700 font-medium">
                  {property?.agentPosition}
                </p>
              )}
              <p className="text-[12px] text-gray-600">
                Speaks {property?.languages?.slice(0,2).join(", ")}
              </p>
            </div>
          </div>
        )}
        {/* Only show call button for non-off-plan properties */}
        {property?.category !== 'Off Plan' && (
          <motion.a 
            href={`tel:${property?.agentPhone}`}
            className="w-[auto] flex justify-center items-center gap-2 text-gray-700 bg-white border border-gray-200 px-[15px] py-[10px] rounded-[10px] shadow-sm hover:shadow-md transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPhone className="text-[16px] text-gray-600" />
          </motion.a>
        )}
      </div>

      <div className="h-[1px] w-full bg-[#e6e6e6] my-4"></div>

      {/* buttons container */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-gray-900">{property?.price}</h2>
          {property?.category === 'Off Plan' ? (
            <p className="text-xs text-gray-500">Starting from</p>
          ) : property?.category === 'Rent' || property?.category === 'Commercial for Rent' ? (
            <p className="text-xs text-gray-500">Per year</p>
          ) : (
            <p className="text-xs text-gray-500">Price</p>
          )}
        </div>
        <motion.a 
          href={`https://wa.me/${property?.agentWhatsapp?.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-2 text-[#FF2626] bg-[#FFF0F0] hover:bg-[#FFE5E5] px-[20px] py-[10px] rounded-[15px] shadow-sm hover:shadow-md transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaWhatsapp className="text-xl" />
          <span className="font-medium">WhatsApp</span>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default ProCard;