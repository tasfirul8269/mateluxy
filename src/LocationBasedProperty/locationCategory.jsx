import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaBuilding, FaChevronRight, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Static location data with images and unique colors
const locationData = {
  "Dubai": {
    image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg",
    color: "from-[#FF4B2B]/90 to-[#FF416C]/90",
    hoverColor: "from-[#FF3B1B]/90 to-[#FF316C]/90"
  },
  "Abu Dhabi": {
    image: "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg",
    color: "from-[#00B4DB]/90 to-[#0083B0]/90",
    hoverColor: "from-[#00A4CB]/90 to-[#0073A0]/90"
  },
  "Sharjah": {
    image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg",
    color: "from-[#11998e]/90 to-[#38ef7d]/90",
    hoverColor: "from-[#10897e]/90 to-[#28df6d]/90"
  },
  "Ajman": {
    image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg",
    color: "from-[#8E2DE2]/90 to-[#4A00E0]/90",
    hoverColor: "from-[#7E1DD2]/90 to-[#3A00D0]/90"
  },
  "Ras Al Khaimah": {
    image: "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg",
    color: "from-indigo-600/90 to-blue-500/90",
    hoverColor: "from-indigo-700/90 to-blue-600/90"
  },
  "Umm Al Quwain": {
    image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg",
    color: "from-teal-600/90 to-green-500/90",
    hoverColor: "from-teal-700/90 to-green-600/90"
  },
  "Fujairah": {
    image: "https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg",
    color: "from-red-600/90 to-orange-500/90",
    hoverColor: "from-red-700/90 to-orange-600/90"
  }
};

// Card styles array with a dark-themed color scheme that complements the site's red theme
const cardStyles = [
  {
    color: "from-red-600/90 to-red-700/90", // Deep red
    hoverColor: "from-red-700/95 to-red-800/95",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1296&auto=format&fit=crop",
    textColor: "text-gray-100",
    iconBg: "bg-red-500/30",
    iconHoverBg: "hover:bg-red-500/40"
  },
  {
    color: "from-gray-900/90 to-gray-800/90", // Dark theme
    hoverColor: "from-gray-900/95 to-gray-800/95",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1470&auto=format&fit=crop",
    textColor: "text-gray-100",
    iconBg: "bg-red-500/30",
    iconHoverBg: "hover:bg-red-500/40"
  },
  {
    color: "from-gray-700/90 to-gray-800/90", // Medium gray theme
    hoverColor: "from-gray-800/95 to-gray-900/95",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1548&auto=format&fit=crop",
    textColor: "text-gray-100",
    iconBg: "bg-red-500/30",
    iconHoverBg: "hover:bg-red-500/40"
  },
  {
    color: "from-red-500/90 to-red-900/90", // Red gradient
    hoverColor: "from-red-600/95 to-red-900/95",
    image: "https://images.unsplash.com/photo-1533422902779-aff35862e462?q=80&w=1470&auto=format&fit=crop",
    textColor: "text-gray-100",
    iconBg: "bg-red-400/30",
    iconHoverBg: "hover:bg-red-400/40"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 50,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5,
      duration: 0.5
    }
  }
};

function LocationCategory() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties`);
        const properties = response.data;
        
        // Group properties by state and count them
        const stateGroups = properties.reduce((acc, property) => {
          const state = property.propertyState;
          if (!state) return acc; // Skip if no state is defined
          
          if (!acc[state]) {
            acc[state] = {
              count: 0,
              properties: []
            };
          }
          acc[state].count++;
          acc[state].properties.push(property);
          return acc;
        }, {});

        // Convert to array and sort by count
        const locationArray = Object.entries(stateGroups)
          .map(([state, data]) => ({
            id: state,
            name: state,
            count: data.count,
            image: locationData[state]?.image || locationData["Dubai"].image,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4); // Limit to 4 locations

        setLocations(locationArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setError("Failed to load locations. Showing default values.");
        // Set default locations if API fails
        setLocations(Object.entries(locationData).map(([state, data]) => ({
          id: state,
          name: state,
          count: 0,
          image: data.image,
        })).slice(0, 4));
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationClick = (locationName) => {
    // Navigate to properties page with location filter
    navigate(`/properties?location=${encodeURIComponent(locationName)}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1335px] mx-auto px-4 py-0 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1335px] mx-auto px-4 py-16 my-4">
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-16"
      >
        <h1 className="font-['Montserrat',Helvetica] font-bold text-gray-900 text-4xl md:text-5xl leading-tight mb-4">
          Discover Properties by <span className="text-red-600 relative inline-block">
            Location
            <span className="absolute bottom-0 left-0 w-full h-1 bg-red-600/30 rounded-full"></span>
          </span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Explore our curated selection of premium properties across the UAE's most desirable locations
        </p>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-2 py-8"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Dynamic staggered layout - limited to 4 locations */}
        <div className="relative grid grid-cols-12 gap-4 md:gap-6">
          {locations.slice(0, 4).map((location, index) => {
            // Create a staggered layout with different sizes and positions
            const layouts = [
              "col-span-12 md:col-span-6 lg:col-span-8 h-[350px]", // Large card
              "col-span-12 md:col-span-6 lg:col-span-4 h-[350px]", // Medium card
              "col-span-12 md:col-span-6 lg:col-span-5 h-[350px]", // Medium-large card
              "col-span-12 md:col-span-6 lg:col-span-7 h-[350px]"  // Large-medium card
            ];
            
            return (
              <motion.div
                key={location.id}
                variants={cardVariants}
                whileHover="hover"
                className={`relative group cursor-pointer ${layouts[index % 4]}`}
                onClick={() => handleLocationClick(location.name)}
              >
                <div className="h-full rounded-2xl overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${cardStyles[index % 4].image})` }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${cardStyles[index % 4].color} group-hover:${cardStyles[index % 4].hoverColor} transition-all duration-300`} />
                  
                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className={`flex items-center gap-2 ${cardStyles[index % 4].textColor}`}
                      >
                        <div className="bg-red-500 p-2 rounded-lg shadow-md">
                          <FaMapMarkerAlt className="text-xl text-gray-100" />
                        </div>
                        <h3 className="text-2xl font-bold drop-shadow-md">{location.name}</h3>
                      </motion.div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 ${cardStyles[index % 4].textColor} backdrop-blur-sm ${cardStyles[index % 4].iconBg} px-3 py-2 rounded-lg shadow-sm w-fit`}>
                        <FaBuilding className="text-lg" />
                        <span className="font-medium">{location.count} Properties</span>
                      </div>
                      
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`flex items-center gap-2 ${cardStyles[index % 4].textColor} group-hover:gap-3 transition-all duration-300 ${cardStyles[index % 4].iconBg} backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-sm ${cardStyles[index % 4].iconHoverBg} w-fit`}
                      >
                        <span className="font-medium">Explore Properties</span>
                        <FaChevronRight className="transform group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </div>

                    {/* Decorative blur element */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-center mt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/properties')}
          className="px-8 py-4 bg-transparent text-red-600 rounded-[20px] font-medium hover:bg-red-600 hover:text-white hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto "
        >
          <div className="bg-red-500 p-2 rounded-[20px]">
            <FaSearch className="text-lg text-gray-100" />
          </div>
          <span>View All Properties</span>
        </motion.button>
      </motion.div>
    </section>
  );
}

export default LocationCategory;