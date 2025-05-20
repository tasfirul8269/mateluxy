import { useEffect, useState } from "react";
import CommunitySlider from "../../components/CommunitySlider/CommunitySlider";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import PropertySearchBar from "../../components/PropertySearchBar/PropertySearchBar";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import { useLocation, useNavigate } from "react-router-dom";

const Buy = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(false);
  const [sortOrder, setSortOrder] = useState('recent');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/properties`)
      .then((res) => {
        // Filter by category first based on route
        const category = location.pathname.includes('/rent') ? 'Rent' : 'Buy';
        const categoryFiltered = res.data.filter(property => property.category === category);
        
        setProperties(categoryFiltered);
        setFilteredProperties(categoryFiltered);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [location.pathname]);

  useEffect(() => {
    if (properties.length === 0) return;

    const queryParams = new URLSearchParams(location.search);
    const filtered = properties.filter(property => {
      // Location filter (using propertyAddress and other location fields)
      if (queryParams.get('location')) {
        const searchLocation = queryParams.get('location').toLowerCase();
        const addressMatch = property.propertyAddress?.toLowerCase().includes(searchLocation);
        const cityMatch = property.propertyState?.toLowerCase().includes(searchLocation);
        const countryMatch = property.propertyCountry?.toLowerCase().includes(searchLocation);
        const titleMatch = property.propertyTitle?.toLowerCase().includes(searchLocation);
        
        // If none of the location fields match, exclude this property
        if (!(addressMatch || cityMatch || countryMatch || titleMatch)) {
          return false;
        }
      }
      
      // Property type filter
      if (queryParams.get('propertyType') && 
          property.propertyType !== queryParams.get('propertyType')) {
        return false;
      }
      
      // Price range filter
      const minPrice = queryParams.get('minPrice') ? Number(queryParams.get('minPrice')) : null;
      const maxPrice = queryParams.get('maxPrice') ? Number(queryParams.get('maxPrice')) : null;
      
      if (minPrice !== null && property.propertyPrice < minPrice) return false;
      if (maxPrice !== null && property.propertyPrice > maxPrice) return false;
      
      // Beds filter
      if (queryParams.get('beds')) {
        const bedsFilter = queryParams.get('beds');
        if (bedsFilter === 'Studio') {
          if (property.propertyBedrooms !== 0) return false;
        } else if (bedsFilter.endsWith('+')) {
          const minBeds = parseInt(bedsFilter, 10);
          if (property.propertyBedrooms < minBeds) return false;
        } else if (bedsFilter !== 'All') {
          if (property.propertyBedrooms !== parseInt(bedsFilter, 10)) return false;
        }
      }
      
      // Baths filter
      if (queryParams.get('baths')) {
        const bathsFilter = queryParams.get('baths');
        if (bathsFilter.endsWith('+')) {
          const minBaths = parseInt(bathsFilter, 10);
          if (property.propertyBathrooms < minBaths) return false;
        } else if (bathsFilter !== 'All') {
          if (property.propertyBathrooms !== parseInt(bathsFilter, 10)) return false;
        }
      }
      
      return true;
    });
    
    // Apply sorting
    const sortParam = queryParams.get('sort');
    const sortedProperties = sortProperties([...filtered], sortParam);
    setFilteredProperties(sortedProperties);
  }, [location.search, properties]);

  const sortProperties = (propertiesToSort, sortParam) => {
    if (!sortParam) return propertiesToSort;

    return [...propertiesToSort].sort((a, b) => {
      switch (sortParam) {
        case 'price-desc':
          return b.propertyPrice - a.propertyPrice;
        case 'price-asc':
          return a.propertyPrice - b.propertyPrice;
        case 'bedrooms-desc':
          return b.propertyBedrooms - a.propertyBedrooms;
        case 'bedrooms-asc':
          return a.propertyBedrooms - b.propertyBedrooms;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  };

  const handleCommunityClick = (communityName) => {
    const searchTerm = communityName.toLowerCase();
    const filtered = properties.filter(property => 
      property.propertyAddress.toLowerCase().includes(searchTerm) || 
      (property.community && property.community.toLowerCase().includes(searchTerm)) ||
      (property.neighborhood && property.neighborhood.toLowerCase().includes(searchTerm))
    );
    setFilteredProperties(filtered);
  };

  const handleFilterChange = (filterValue) => {
    setSortOrder(filterValue);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('sort', filterValue);
    window.history.pushState({}, '', `${location.pathname}?${queryParams.toString()}`);
    
    // Apply sorting directly
    const sortedProperties = sortProperties([...filteredProperties], filterValue);
    setFilteredProperties(sortedProperties);
  };
  
  // Navigate to map view
  const handleMapViewClick = () => {
    navigate('/map-view/buy');
  };

  // Update the heading based on route
  const headingText = location.pathname.includes('/rent') 
    ? "Properties for rent in Dubai" 
    : "Properties for sale in Dubai";

  return (
    <div>
      <div className="pt-0 px-4 md:px-0">
        <PropertySearchBar />
        <CommunitySlider onCommunityClick={handleCommunityClick} />

        <div className="container mt-5 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-5 md:mb-5 bg-white p-4 rounded-lg  border border-[#e6e6e6]">
            <div className="w-full md:w-auto">
              <h3 className="text-xl text-black font-bold text-center md:text-left">
                {headingText}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-gray-700 font-medium mr-1">Results:</span>
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-sm font-medium">
                  {filteredProperties.length}
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
              <div className="w-full md:w-auto relative">
                <FilterDropdown onFilterChange={handleFilterChange} />
              </div>

              <div 
                onClick={handleMapViewClick}
                className="w-[46%] md:w-auto flex items-center px-4 py-2.5 bg-white text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:border-red-200 cursor-pointer"
              >
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                <span className="font-medium text-sm md:text-base">
                  View on Map
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-4 md:px-0">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              loading={loading}
              error={error}
              checked={checked}
              setChecked={setChecked}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Buy;