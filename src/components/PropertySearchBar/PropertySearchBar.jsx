import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiSliders, FiMapPin, FiHome, FiDollarSign } from "react-icons/fi";
import * as DropdownMenu from "../AdminPannel/ui/dropdown-menu";
import { Slider } from "../AdminPannel/ui/slider";
import DIRHAM from "@/assets/uae-dirham.png"; // Assuming you have a dirham icon

const PropertySearchBar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    priceRange: [100, 5000000], // Consistent range that works for both buy and rent
    beds: "",
    baths: "",
    amenities: [],
  });
  const [minMaxPrices, setMinMaxPrices] = useState({ min: 100, max: 5000000 });
  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set the active tab based on the current path
  useEffect(() => {
    if (location.pathname.includes('/rent') || location.pathname.includes('/commercial/rent')) {
      setActiveTab(1);
    } else if (location.pathname.includes('/buy') || location.pathname.includes('/commercial/buy')) {
      setActiveTab(0);
    }
  }, [location.pathname]);
  
  // Fetch dynamic amenities and price ranges from all properties
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        // Check if we're on a commercial page
        const isCommercial = location.pathname.includes('/commercial');
        
        // Determine which property category to fetch based on the active tab and page type
        let category;
        if (isCommercial) {
          category = activeTab === 0 ? 'Commercial for Buy' : 'Commercial for Rent';
        } else {
          category = activeTab === 0 ? 'Buy' : 'Rent';
        }
        console.log('Fetching properties for category:', category);
        
        // Fetch properties with the correct category filter
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`);
        if (!response.ok) {
          throw new Error(`Failed to fetch properties`);
        }
        
        const allProperties = await response.json();
        
        // Filter properties by category
        const properties = allProperties.filter(property => property.category === category);
        console.log(`Filtered ${properties.length} properties with category: ${category}`);
        
        // Extract unique amenities
        const allAmenities = new Set();
        properties.forEach(property => {
          if (property.amenities && Array.isArray(property.amenities)) {
            property.amenities.forEach(amenity => allAmenities.add(amenity));
          }
        });
        
        // Format amenities for display
        const formattedAmenities = Array.from(allAmenities).map(amenity => ({
          id: amenity.toLowerCase().replace(/\\s+/g, '_'),
          label: amenity
        }));
        
        if (formattedAmenities.length > 0) {
          setAmenitiesOptions(formattedAmenities);
        }
        
        // Find min and max prices
        let minPrice = Number.MAX_SAFE_INTEGER;
        let maxPrice = 0;
        let pricesFound = false;
        
        console.log('All property data:', properties);
        console.log('Property price fields:', properties.map(p => p.price));
        
        // Check if we need to look for a different price field
        // Sometimes the API might return prices in a different format or field name
        const sampleProperty = properties[0];
        console.log('Sample property:', sampleProperty);
        
        // Extract price information from the properties
        const validPrices = [];
        
        properties.forEach(property => {
          if (property.propertyPrice !== undefined && property.propertyPrice !== null) {
            // Handle price as number
            const price = Number(property.propertyPrice);
            
            console.log('Processing property price:', property.propertyPrice, '→', price);
            
            if (!isNaN(price) && price > 0) {
              validPrices.push(price);
              pricesFound = true;
            }
          }
        });
        
        console.log('Found valid prices:', validPrices);
        
        // If we found valid prices, determine min and max
        if (validPrices.length > 0) {
          minPrice = Math.min(...validPrices);
          maxPrice = Math.max(...validPrices);
          console.log('Found valid prices:', validPrices);
          console.log('Current min/max:', minPrice, maxPrice);
        }
        
        console.log('Final min/max prices:', minPrice, maxPrice);
        
        // Set min/max prices if found, otherwise use sample values
        if (pricesFound && minPrice !== Number.MAX_SAFE_INTEGER && maxPrice > 0) {
          // Round to nearest whole numbers for better UX
          const roundedMin = Math.floor(minPrice);
          const roundedMax = Math.ceil(maxPrice);
          
          console.log('Setting price range:', roundedMin, roundedMax);
          
          // Force UI update by setting state
          setMinMaxPrices({
            min: roundedMin,
            max: roundedMax
          });
          
          // Update search params with the new range
          setSearchParams(prev => ({
            ...prev,
            priceRange: [roundedMin, roundedMax]
          }));
          
          console.log('Price range set to:', roundedMin, roundedMax);
        } else {
          // Use consistent fallback values
          const fallbackMin = 100;
          const fallbackMax = 5000000;
          
          console.warn('No valid prices found in properties data, using fallback values');
          console.log('Setting fallback price range:', fallbackMin, fallbackMax);
          
          setMinMaxPrices({
            min: fallbackMin,
            max: fallbackMax
          });
          
          setSearchParams(prev => ({
            ...prev,
            priceRange: [fallbackMin, fallbackMax]
          }));
        }
      } catch (error) {
        console.error("Error fetching property data:", error);
      }
    };
    
    fetchPropertyData();
  }, [activeTab]); // Re-fetch when activeTab changes

  // Property types for dropdown - different for commercial and residential
  const residentialPropertyTypes = [
    "Apartment",
    "Penthouse",
    "Villa",
    "Land",
    "Townhouse",
    "Duplex",
  ];
  
  const commercialPropertyTypes = [
    "Office",
    "Retail",
    "Warehouse",
    "Industrial",
    "Shop",
    "Showroom",
    "Commercial Building",
    "Business Center",
    "Land",
  ];
  
  // Always use the residential property types for all pages
  const propertyTypes = residentialPropertyTypes;

  // Bed and bath options
  const bedOptions = ["Any", "Studio", "1", "2", "3", "4", "5", "6+"];
  const bathOptions = ["Any", "1", "2", "3", "4", "5", "6+"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePriceRangeChange = (values) => {
    setSearchParams((prev) => ({
      ...prev,
      priceRange: values,
    }));
  };
  
  const handleAmenityToggle = (amenityId) => {
    setSearchParams((prev) => {
      const currentAmenities = [...prev.amenities];
      if (currentAmenities.includes(amenityId)) {
        return {
          ...prev,
          amenities: currentAmenities.filter(id => id !== amenityId),
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenityId],
        };
      }
    });
  };

  const handleSearch = () => {
    // Construct the search query based on the search parameters
    const searchQuery = new URLSearchParams();
    
    // Add all non-empty parameters to the search query
    if (searchParams.location) searchQuery.append('location', searchParams.location);
    if (searchParams.propertyType) searchQuery.append('propertyType', searchParams.propertyType);
    if (searchParams.beds && searchParams.beds !== 'Any') searchQuery.append('beds', searchParams.beds);
    if (searchParams.baths && searchParams.baths !== 'Any') searchQuery.append('baths', searchParams.baths);
    
    // Add price range if it's not the default
    if (searchParams.priceRange[0] > minMaxPrices.min) {
      searchQuery.append('minPrice', searchParams.priceRange[0]);
    }
    if (searchParams.priceRange[1] < minMaxPrices.max) {
      searchQuery.append('maxPrice', searchParams.priceRange[1]);
    }
    
    // Add amenities if any are selected
    if (searchParams.amenities.length > 0) {
      searchQuery.append('amenities', searchParams.amenities.join(','));
    }
    
    // Determine the base path based on whether we're on a commercial page
    let basePath;
    const isCommercial = location.pathname.includes('/commercial');
    
    if (isCommercial) {
      basePath = activeTab === 0 ? '/commercial/buy' : '/commercial/rent';
    } else {
      basePath = activeTab === 0 ? '/buy' : '/rent';
    }
    
    // Navigate to the appropriate page with the search query
    navigate(`${basePath}?${searchQuery.toString()}`);
  };
  
  const clearFilters = () => {
    // Reset only the more filters parameters (beds, baths, amenities)
    setSearchParams(prev => ({
      ...prev,
      beds: "",
      baths: "",
      amenities: [],
    }));
    
    // Remove only beds, baths, and amenities filter parameters from the URL
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.delete('beds');
    currentURL.searchParams.delete('baths');
    currentURL.searchParams.delete('amenities');
    
    // Update the URL without reloading the page
    navigate(currentURL.pathname + currentURL.search, { replace: true });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchParams.propertyType) count++;
    if (searchParams.beds) count++;
    if (searchParams.baths) count++;
    if (searchParams.priceRange[0] > minMaxPrices.min) count++;
    if (searchParams.priceRange[1] < minMaxPrices.max) count++;
    count += searchParams.amenities.length;
    return count;
  };
  
  const formatPrice = (price) => {
    // Format price with commas and dollar sign
    return `$${Math.round(price).toLocaleString()}`;
  };

  return (
    <div className="relative bg-gray-50 flex justify-center  w-full mx-auto">
      {/* Main Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 max-w-6xl rounded-xl  p-5 "
      >
        {/* Search Fields */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Buy/Rent Selector */}
          <div className="flex bg-white border border-[#e6e6e6] p-1 rounded-lg md:w-auto w-full md:self-auto self-stretch">
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 0
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setActiveTab(0);
                // Check if we're on a commercial page
                if (location.pathname.includes('/commercial')) {
                  navigate("/commercial/buy");
                } else {
                  navigate("/buy");
                }
              }}
            >
              Buy
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 1
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setActiveTab(1);
                // Check if we're on a commercial page
                if (location.pathname.includes('/commercial')) {
                  navigate("/commercial/rent");
                } else {
                  navigate("/rent");
                }
              }}
            >
              Rent
            </button>
          </div>
          
          {/* Location Input */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiMapPin className="text-red-500" />
            </div>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={searchParams.location}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Property Type Field */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiHome className="text-red-500" />
            </div>
            <select
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">Property Type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          {/* Price Dropdown Menu */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <DropdownMenu.DropdownMenu>
              <DropdownMenu.DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                  <div className="flex items-center">
                    <img src={DIRHAM} className="w-5 absolute left-3 text-red-500" />
                    <span className="text-gray-700">
                      {(searchParams.priceRange[0] > minMaxPrices.min || searchParams.priceRange[1] < minMaxPrices.max) 
                        ? `${formatPrice(searchParams.priceRange[0])} - ${formatPrice(searchParams.priceRange[1])}` 
                        : "Price (Any)"}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </DropdownMenu.DropdownMenuTrigger>
              
              <DropdownMenu.DropdownMenuContent className="w-72 p-4" sideOffset={5}>
                <div className="flex justify-between items-center">
                  <DropdownMenu.DropdownMenuLabel>Price Range</DropdownMenu.DropdownMenuLabel>
                  {(searchParams.priceRange[0] > minMaxPrices.min || searchParams.priceRange[1] < minMaxPrices.max) && (
                    <button 
                      onClick={() => {
                        // Reset price range to min/max values
                        setSearchParams(prev => ({
                          ...prev,
                          priceRange: [minMaxPrices.min, minMaxPrices.max]
                        }));
                        
                        // Only remove price filter params from the URL
                        const currentURL = new URL(window.location.href);
                        currentURL.searchParams.delete('minPrice');
                        currentURL.searchParams.delete('maxPrice');
                        navigate(currentURL.pathname + currentURL.search, { replace: true });
                      }}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Reset price filter"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  )}
                </div>
                <DropdownMenu.DropdownMenuSeparator />
                
                <div className="mt-4 mb-8">
                  <div className="flex justify-between text-xs text-gray-700 mb-2">
                    <span>{formatPrice(searchParams.priceRange[0])}</span>
                    <span>{formatPrice(searchParams.priceRange[1])}</span>
                  </div>
                  
                  <Slider
                    defaultValue={searchParams.priceRange}
                    min={minMaxPrices.min}
                    max={minMaxPrices.max}
                    step={(minMaxPrices.max - minMaxPrices.min) / 100}
                    color="red"
                    onValueChange={handlePriceRangeChange}
                    className="mt-6"
                  />
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </DropdownMenu.DropdownMenuContent>
            </DropdownMenu.DropdownMenu>
          </div>
          
          {/* Filters Dropdown Menu */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <DropdownMenu.DropdownMenu>
              <DropdownMenu.DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                  <div className="flex items-center">
                    <FiSliders className="absolute left-3 text-red-500" />
                    <span className="text-gray-700">Filters</span>
                  </div>
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </DropdownMenu.DropdownMenuTrigger>
              
              <DropdownMenu.DropdownMenuContent className="w-72 p-4 max-h-[80vh] overflow-y-auto" sideOffset={5} align="end">
                <div className="sticky top-0 bg-white pb-2 z-10">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <DropdownMenu.DropdownMenuLabel>Bedrooms</DropdownMenu.DropdownMenuLabel>
                  <DropdownMenu.DropdownMenuSeparator />
                </div>
                
                <div className="flex flex-wrap gap-2 my-2">
                  {bedOptions.map((bed) => (
                    <button
                      key={bed}
                      onClick={() => handleInputChange({ target: { name: 'beds', value: bed === 'Any' ? '' : bed } })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        (bed === 'Any' && !searchParams.beds) || searchParams.beds === bed
                          ? "bg-red-100 text-red-600 border border-red-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {bed}
                    </button>
                  ))}
                </div>
                
                <div className="sticky top-0 bg-white pt-3 pb-2 z-10">
                  <DropdownMenu.DropdownMenuLabel>Bathrooms</DropdownMenu.DropdownMenuLabel>
                  <DropdownMenu.DropdownMenuSeparator />
                </div>
                
                <div className="flex flex-wrap gap-2 my-2">
                  {bathOptions.map((bath) => (
                    <button
                      key={bath}
                      onClick={() => handleInputChange({ target: { name: 'baths', value: bath === 'Any' ? '' : bath } })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        (bath === 'Any' && !searchParams.baths) || searchParams.baths === bath
                          ? "bg-red-100 text-red-600 border border-red-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {bath}
                    </button>
                  ))}
                </div>
                
                {amenitiesOptions.length > 0 && (
                  <>
                    <div className="sticky top-0 bg-white pt-3 pb-2 z-10">
                      <DropdownMenu.DropdownMenuLabel>Amenities</DropdownMenu.DropdownMenuLabel>
                      <DropdownMenu.DropdownMenuSeparator />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 my-2">
                      {amenitiesOptions.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => handleAmenityToggle(amenity.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                            searchParams.amenities.includes(amenity.id)
                              ? "bg-red-100 text-red-600 border border-red-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          <span>{amenity.label}</span>
                          {searchParams.amenities.includes(amenity.id) && (
                            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                <div className="sticky bottom-0 bg-white pt-3 mt-2 z-10">
                  <DropdownMenu.DropdownMenuSeparator />
                </div>
              </DropdownMenu.DropdownMenuContent>
            </DropdownMenu.DropdownMenu>
          </div>
          
          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="flex-shrink-0 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center shadow-md"
          >
            <FiSearch className="text-xl" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertySearchBar;
