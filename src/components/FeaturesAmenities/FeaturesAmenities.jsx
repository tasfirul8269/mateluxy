import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSwimmingPool, FaDumbbell, FaParking, FaWifi, FaShieldAlt, FaTree, FaFilter } from 'react-icons/fa';
import { MdBalcony, MdOutlineElevator, MdPets, MdLocalLaundryService } from 'react-icons/md';
import { GiTennisCourt, GiSoccerField } from 'react-icons/gi';
import { BsSmartwatch } from 'react-icons/bs';
import { TbAirConditioning } from 'react-icons/tb';
import { BiSolidWasher } from 'react-icons/bi';
import { IoIosArrowForward } from 'react-icons/io';

const FeaturesAmenities = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredItem, setHoveredItem] = useState(null);

  // Define common features and amenities with icons
  const featuresAmenities = [
    { name: 'Swimming Pool', icon: <FaSwimmingPool className="text-2xl" />, type: 'amenities', description: 'Properties with swimming pools for recreation and relaxation' },
    { name: 'Gym', icon: <FaDumbbell className="text-2xl" />, type: 'amenities', description: 'Fitness centers for your daily workout routines' },
    { name: 'Parking', icon: <FaParking className="text-2xl" />, type: 'amenities', description: 'Secure parking spaces for your vehicles' },
    { name: 'Security', icon: <FaShieldAlt className="text-2xl" />, type: 'amenities', description: '24/7 security systems for your peace of mind' },
    { name: 'Balcony', icon: <MdBalcony className="text-2xl" />, type: 'features', description: 'Private outdoor spaces with scenic views' },
    { name: 'Tennis Court', icon: <GiTennisCourt className="text-2xl" />, type: 'amenities', description: 'Professional tennis courts for sports enthusiasts' },
    { name: 'Garden', icon: <FaTree className="text-2xl" />, type: 'amenities', description: 'Lush green spaces for outdoor relaxation' },
    { name: 'Elevator', icon: <MdOutlineElevator className="text-2xl" />, type: 'amenities', description: 'Modern elevators for convenient access' },
    { name: 'Pet Friendly', icon: <MdPets className="text-2xl" />, type: 'features', description: 'Properties that welcome your furry companions' },
    { name: 'Smart Home', icon: <BsSmartwatch className="text-2xl" />, type: 'features', description: 'Cutting-edge technology for modern living' },
    { name: 'Air Conditioning', icon: <TbAirConditioning className="text-2xl" />, type: 'features', description: 'Climate control for year-round comfort' },
    { name: 'Laundry', icon: <MdLocalLaundryService className="text-2xl" />, type: 'amenities', description: 'On-site laundry facilities for convenience' },
    { name: 'WiFi', icon: <FaWifi className="text-2xl" />, type: 'amenities', description: 'High-speed internet connectivity throughout' },
    { name: 'Football Field', icon: <GiSoccerField className="text-2xl" />, type: 'amenities', description: 'Soccer fields for sports and recreation' },
    { name: 'Washer', icon: <BiSolidWasher className="text-2xl" />, type: 'features', description: 'In-unit washing machines for convenience' },
  ];

  // Filter items based on active filter
  const filteredItems = activeFilter === 'all' 
    ? featuresAmenities 
    : featuresAmenities.filter(item => item.type === activeFilter);

  // Handle click to navigate to properties page with filter
  const handleFeatureClick = (feature, type) => {
    navigate(`/properties?${type}=${encodeURIComponent(feature)}`);
  };
  
  // View all properties with a specific filter type
  const handleViewAll = (type) => {
    if (type === 'all') {
      navigate('/properties');
    } else {
      navigate(`/properties?filter=${type}`);
    }
  };

  return (
    <div className="py-10 container mx-auto overflow-hidden">
      {/* Background gradient element */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent -z-10 rounded-3xl"></div>
      
      {/* Header with animated underline */}
      <motion.div 
        className="text-center mb-8 relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-3">Features & Amenities</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-4">
          Discover properties with your desired features and amenities to find your perfect home
        </p>
      </motion.div>

      {/* Filter tabs */}
      <motion.div 
        className="flex justify-center mb-6 gap-2 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {['all', 'features', 'amenities'].map((filter) => (
          <motion.button
            key={filter}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeFilter === filter 
              ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            onClick={() => setActiveFilter(filter)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter === 'all' && <FaFilter className="ml-2 inline-block" />}
          </motion.button>
        ))}
      </motion.div>

      {/* Features and amenities grid with staggered animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeFilter}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={`${activeFilter}-${index}`}
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -8 }}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => handleFeatureClick(item.name, item.type)}
            >
              {/* Card content */}
              <div className="p-6 flex flex-col items-center">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-md group-hover:shadow-gray-200"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="text-red-600">{item.icon}</div>
                </motion.div>
                
                <h3 className="font-semibold text-gray-800 text-center text-lg mb-2 group-hover:text-red-600 transition-colors">
                  {item.name}
                </h3>
                
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                  {item.type === 'features' ? 'Feature' : 'Amenity'}
                </span>
                
                {/* Hover description - shows on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-red-600/90 to-red-500/90 flex flex-col justify-center items-center p-4 text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredItem === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-xl mb-2">{item.icon}</div>
                  <h4 className="font-bold mb-2 text-center">{item.name}</h4>
                  <p className="text-sm text-center text-white/90">{item.description}</p>
                  <div className="mt-3 flex items-center text-xs font-medium">
                    <span>View Properties</span>
                    <IoIosArrowForward className="ml-1" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* View all button */}
      <motion.div 
        className="flex justify-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <motion.button
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium shadow-lg shadow-red-200 flex items-center group transition-all"
          onClick={() => handleViewAll(activeFilter)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          View All {activeFilter !== 'all' ? activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) : 'Properties'}
          <motion.span 
            className="ml-2"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
          >
            <IoIosArrowForward />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FeaturesAmenities;
