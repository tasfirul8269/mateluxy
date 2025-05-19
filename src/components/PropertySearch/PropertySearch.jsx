import { useState, useEffect, useRef } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Property types array from the codebase
const propertyTypes = [
  "Apartment", "Villa", "Townhouse", "Penthouse", "Duplex", 
  "Studio", "Office", "Retail", "Warehouse", "Land"
];

const PropertySearch = () => {
    const [activeTab, setActiveTab] = useState('rent');
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isPropertyTypeFocused, setIsPropertyTypeFocused] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleSearch = () => {
      // Build query parameters for the search
      const params = new URLSearchParams();
      
      if (location.trim()) {
        // Using location parameter which is expected by the Buy/Rent components
        params.append('location', location.trim());
      }
      
      if (propertyType) {
        params.append('propertyType', propertyType);
      }
      
      // Navigate to the appropriate page with search parameters
      navigate(`/${activeTab}?${params.toString()}`);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };
    
    // Handle click outside to close dropdown and remove focus
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
          setIsPropertyTypeFocused(false);
        }
      };
      
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between bg-white items-center gap-4">
      {/* Toggle Buttons */}
      <div className="flex p-1 gap-2">
        <button 
          className={`flex-1 py-2 px-4 transition-colors ${activeTab === 'rent' ? 'bg-white text-red-600 border-b-2 border-[#FF2626]' : 'text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('rent')}
        >
          Rent
        </button>
        <button 
          className={`flex-1 py-2 px-4 transition-colors ${activeTab === 'buy' ? 'bg-white text-red-600 border-b-2 border-[#FF2626]' : 'text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setActiveTab('buy')}
        >
          Buy
        </button>
      </div>

      {/* Search Fields */}
      <div className="grid md:grid-cols-3 gap-8 md:text-center w-full">
        {/* Location Field */}
        <div className="relative">
          <label className="block text-sm font-[600] text-left text-black mb-1">
            Locations
          </label>
          <div className="relative">
            <motion.div 
              className="w-full relative rounded-md overflow-hidden group"
              initial={false}
              animate={{
                boxShadow: isFocused ? '0 0 0 2px #ef4444' : '0 0 0 1px transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: isFocused ? 1.1 : 1, 
                    color: isFocused ? '#ef4444' : '#9ca3af' 
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400 bg-red-50 p-1.5 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaLocationCrosshairs />
                </motion.div>
              </div>
              <input
                type="text"
                placeholder="Enter city, address or area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full py-2 pl-10 pr-3 border-0 focus:outline-none bg-gray-50 rounded-md"
              />
            </motion.div>
          </div>
        </div>

        {/* Property Type Field */}
        <div className="relative">
          <label className="block text-sm text-black text-left font-[600] mb-1">
            Property type
          </label>
          <div className="relative" ref={dropdownRef}>
            <motion.div 
              className="w-full relative rounded-md overflow-hidden"
              initial={false}
              animate={{
                boxShadow: isPropertyTypeFocused || isDropdownOpen ? '0 0 0 2px #ef4444' : '0 0 0 1px transparent',
              }}
              transition={{ duration: 0.3 }}
            >
              <div 
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsPropertyTypeFocused(!isPropertyTypeFocused);
                }}
                onFocus={() => setIsPropertyTypeFocused(true)}
                onBlur={() => !isDropdownOpen && setIsPropertyTypeFocused(false)}
                className="w-full py-2 px-3 pr-10 text-gray-700 bg-gray-50 rounded-md cursor-pointer flex justify-between items-center whitespace-nowrap overflow-hidden"
              >
                <div className="flex items-center">
                  <div className="mr-2 bg-red-50 p-1.5 rounded-full">
                    <FaChevronDown className={`text-sm ${isPropertyTypeFocused || isDropdownOpen ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <span>{propertyType || "Select property type"}</span>
                </div>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-3"
                >
                </motion.div>
              </div>
            </motion.div>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto border border-gray-100"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Clear selection option */}
                  {propertyType && (
                    <motion.div 
                      className="px-4 py-2 hover:bg-red-50 cursor-pointer text-left text-gray-700 border-b border-gray-100"
                      onClick={() => {
                        setPropertyType('');
                        setIsDropdownOpen(false);
                        setIsPropertyTypeFocused(false);
                      }}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: '#fef2f2' }}
                    >
                      <div className="flex items-center justify-between">
                        <span>Clear selection</span>
                        <span className="text-red-500 text-sm">✕</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Property type options */}
                  {propertyTypes.map((type, index) => (
                    <motion.div 
                      key={type} 
                      className="px-4 py-2 hover:bg-red-50 cursor-pointer text-left text-gray-700"
                      onClick={() => {
                        setPropertyType(type);
                        setIsDropdownOpen(false);
                        setIsPropertyTypeFocused(false);
                      }}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (propertyType ? index + 1 : index) * 0.03, duration: 0.2 }}
                      whileHover={{ backgroundColor: '#fef2f2' }}
                    >
                      {type}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-end">
          <motion.button 
            onClick={handleSearch}
            className="px-6 bg-red-600 w-[200px] cursor-pointer hover:bg-red-700 text-white py-4 rounded-[10px] flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              initial={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 700 }}
            >
              <FaSearch className="mr-2" />
            </motion.div>
            <span>Search</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;