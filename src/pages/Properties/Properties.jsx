import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { propertyApi } from '../../services/api';
import ProCard from '../../components/ProCard/ProCard';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(6); // Number of properties to display initially
  const [filters, setFilters] = useState({
    category: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    features: [],
    amenities: [],
    location: ''
  });

  // Common features and amenities for filter options
  const commonFeatures = [
    'Balcony', 'Smart Home', 'Air Conditioning', 'Pet Friendly', 'Washer', 'Furnished'
  ];
  
  const commonAmenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Security', 'Tennis Court', 'Garden', 
    'Elevator', 'Laundry', 'WiFi', 'Football Field'
  ];

  // Get initial filter values from URL parameters
  useEffect(() => {
    const featureParam = searchParams.get('features');
    const amenityParam = searchParams.get('amenities');
    
    if (featureParam) {
      setFilters(prev => ({
        ...prev,
        features: [featureParam]
      }));
    }
    
    if (amenityParam) {
      setFilters(prev => ({
        ...prev,
        amenities: [amenityParam]
      }));
    }

    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam
      }));
    }

    const locationParam = searchParams.get('location');
    if (locationParam) {
      setFilters(prev => ({
        ...prev,
        location: locationParam
      }));
    }
  }, [searchParams]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyApi.getProperties();
        
        // Format properties for ProCard component
        const formattedProperties = data.map(property => {
          // Check if agent data is populated
          const hasAgentData = property.agent && typeof property.agent === 'object';
          
          return {
            id: property._id,
            name: property.propertyTitle,
            location: property.propertyState,
            deliveryDate: property.category === 'Off Plan' ? formatDeliveryDate(property.completionDate) : 'Ready to Move',
            price: `AED ${formatPrice(property.propertyPrice)}`,
            developer: property.developer || '',
            developerImage: property.developerImage || '',
            image: property.propertyFeaturedImage,
            propertyType: property.propertyType,
            beds: property.propertyBedrooms,
            baths: property.propertyBathrooms,
            kitchens: property.propertyKitchen,
            features: property.features || [],
            amenities: property.amenities || [],
            languages: hasAgentData && property.agent.languages ? property.agent.languages : ["English", "Arabic"],
            agentName: hasAgentData ? property.agent.fullName : (property.agent || 'Agent'),
            agentPosition: hasAgentData ? property.agent.position : '',
            agentImage: hasAgentData && property.agent.profileImage ? 
              property.agent.profileImage : 
              "https://randomuser.me/api/portraits/" + (Math.random() > 0.5 ? 'women/' : 'men/') + Math.floor(Math.random() * 10) + '.jpg',
            agentWhatsapp: hasAgentData && property.agent.whatsapp ? property.agent.whatsapp : '+971501234567',
            agentPhone: hasAgentData && property.agent.contactNumber ? property.agent.contactNumber : '+971501234567',
            category: property.category
          };
        });
        
        setProperties(formattedProperties);
        setError(null);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Helper function to format delivery date
  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'TBA';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString; // If parsing fails, return the original string
    }
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return price ? price.toLocaleString() : 'Price on Request';
  };

  // Apply filters to properties
  useEffect(() => {
    if (properties.length === 0) return;
    
    let filtered = [...properties];
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(property => 
        property.category === filters.category
      );
    }
    
    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter(property => 
        property.propertyType === filters.propertyType
      );
    }
    
    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(property => {
        const price = parseFloat(property.price.replace(/[^0-9.-]+/g, ''));
        return price >= parseFloat(filters.minPrice);
      });
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(property => {
        const price = parseFloat(property.price.replace(/[^0-9.-]+/g, ''));
        return price <= parseFloat(filters.maxPrice);
      });
    }
    
    // Filter by beds
    if (filters.beds) {
      filtered = filtered.filter(property => 
        property.beds >= parseInt(filters.beds)
      );
    }
    
    // Filter by baths
    if (filters.baths) {
      filtered = filtered.filter(property => 
        property.baths >= parseInt(filters.baths)
      );
    }
    
    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filter by features
    if (filters.features.length > 0) {
      filtered = filtered.filter(property => {
        if (!property.features || !Array.isArray(property.features)) return false;
        return filters.features.every(feature => 
          property.features.some(propFeature => 
            propFeature.toLowerCase().includes(feature.toLowerCase())
          )
        );
      });
    }
    
    // Filter by amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(property => {
        if (!property.amenities || !Array.isArray(property.amenities)) return false;
        return filters.amenities.every(amenity => 
          property.amenities.some(propAmenity => 
            propAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
      });
    }
    
    setFilteredProperties(filtered);
  }, [properties, filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle feature or amenity filter
  const toggleFilter = (item, type) => {
    setFilters(prev => {
      const currentItems = [...prev[type]];
      const index = currentItems.indexOf(item);
      
      if (index > -1) {
        currentItems.splice(index, 1);
      } else {
        currentItems.push(item);
      }
      
      return {
        ...prev,
        [type]: currentItems
      };
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      beds: '',
      baths: '',
      features: [],
      amenities: [],
      location: ''
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Discover Your Perfect Property
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our extensive collection of properties and find your dream home with the features and amenities you desire
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row justify-between items-center">
          <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search by location..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button 
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={resetFilters}
            >
              <FaTimes />
              Reset
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                  <option value="Off Plan">Off Plan</option>
                  <option value="Commercial for Buy">Commercial for Buy</option>
                  <option value="Commercial for Rent">Commercial for Rent</option>
                </select>
              </div>
              
              {/* Property Type Filter */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Property Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Office">Office</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Min Price (AED)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Min Price"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Max Price (AED)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Max Price"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
              
              {/* Beds & Baths */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Bedrooms</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  name="beds"
                  value={filters.beds}
                  onChange={handleFilterChange}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Bathrooms</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  name="baths"
                  value={filters.baths}
                  onChange={handleFilterChange}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>
            
            {/* Features */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Features</h4>
              <div className="flex flex-wrap gap-2">
                {commonFeatures.map((feature, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.features.includes(feature) 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => toggleFilter(feature, 'features')}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Amenities */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.amenities.includes(amenity) 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => toggleFilter(amenity, 'amenities')}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {loading ? 'Loading properties...' : 
             error ? 'Error loading properties' : 
             `${filteredProperties.length} Properties Found`}
          </h2>
          
          {/* Active Filters Display */}
          {(filters.features.length > 0 || filters.amenities.length > 0) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.features.map((feature, index) => (
                  <span 
                    key={`feature-${index}`}
                    className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    {feature}
                    <button 
                      className="hover:text-red-900"
                      onClick={() => toggleFilter(feature, 'features')}
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
                
                {filters.amenities.map((amenity, index) => (
                  <span 
                    key={`amenity-${index}`}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    {amenity}
                    <button 
                      className="hover:text-blue-900"
                      onClick={() => toggleFilter(amenity, 'amenities')}
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Loading properties...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Properties</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-5xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
            <button 
              onClick={resetFilters}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(0, displayCount).map((property, index) => (
                <motion.div
                  key={property.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <ProCard property={property} />
                </motion.div>
              ))}
            </div>
            
            {/* View More Button */}
            {filteredProperties.length > displayCount && (
              <div className="text-center mt-10">
                <motion.button
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View More Properties
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
