import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import PropertyCard from './PropertyCard';
import Banner from '../Banner/OffPlanBanner';
import LatestLaunchesSlider from './LatestLaunchesSlider/LatestLaunchesSlider';
import InvestmentHotspotsSlider from './InvestmentHotspotsSlider';
import DeveloperLogoSlider from './DeveloperLogoSlider';

const PropertyListing = ({ offPlanProjects }) => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const projectsPerPage = 6;

  // Filter off-plan projects (category === "Off Plan")
  const allOffPlanProjects = offPlanProjects.filter(
    project => project.category === "Off Plan"
  );
  
  // Calculate min and max prices from real property data
  const priceRange = useMemo(() => {
    let minPrice = Number.MAX_SAFE_INTEGER;
    let maxPrice = 0;
    
    allOffPlanProjects.forEach(property => {
      if (property.propertyPrice && !isNaN(property.propertyPrice)) {
        const price = Number(property.propertyPrice);
        if (price > 0) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      }
    });
    
    // If no valid prices found, use default range
    if (minPrice === Number.MAX_SAFE_INTEGER || maxPrice === 0) {
      return { minPrice: 500000, maxPrice: 50000000 };
    }
    
    // Round to nicer values
    minPrice = Math.floor(minPrice / 100000) * 100000; // Round down to nearest 100K
    maxPrice = Math.ceil(maxPrice / 1000000) * 1000000; // Round up to nearest million
    
    return { minPrice, maxPrice };
  }, [allOffPlanProjects]);
  
  // Initialize data
  useEffect(() => {
    setLoading(true);
    // Simulate loading time
    const timer = setTimeout(() => {
      setFilteredProjects(allOffPlanProjects);
      setDisplayedProjects(allOffPlanProjects.slice(0, projectsPerPage));
      setHasMore(allOffPlanProjects.length > projectsPerPage);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [offPlanProjects]);
  
  // Apply category filtering and search filters
  useEffect(() => {
    let result = [...allOffPlanProjects];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(property => {
        // Exact match with the propertyType field from the database
        return property.propertyType === selectedCategory;
      });
    }
    
    // Apply search filters
    if (searchFilters.searchTerm) {
      const searchTerm = searchFilters.searchTerm.toLowerCase();
      result = result.filter(property => {
        return (
          (property.propertyTitle && property.propertyTitle.toLowerCase().includes(searchTerm)) ||
          (property.propertyAddress && property.propertyAddress.toLowerCase().includes(searchTerm)) ||
          (property.propertyState && property.propertyState.toLowerCase().includes(searchTerm)) ||
          (property.propertyCountry && property.propertyCountry.toLowerCase().includes(searchTerm)) ||
          (property.developer && property.developer.toLowerCase().includes(searchTerm)) ||
          (property.project && property.project.toLowerCase().includes(searchTerm))
        );
      });
    }
    
    // Apply price range filter
    if (searchFilters.minPrice !== null && searchFilters.minPrice !== undefined) {
      result = result.filter(property => {
        return property.propertyPrice >= searchFilters.minPrice;
      });
    }
    
    if (searchFilters.maxPrice !== null && searchFilters.maxPrice !== undefined) {
      result = result.filter(property => {
        return property.propertyPrice <= searchFilters.maxPrice;
      });
    }
    
    // Apply bedroom filter
    if (searchFilters.beds !== null && searchFilters.beds !== undefined) {
      result = result.filter(property => {
        if (searchFilters.beds === 0) {
          // For studio (0 bedrooms)
          return property.propertyBedrooms === 0;
        } else if (searchFilters.beds === '4+') {
          // For 4+ bedrooms
          return property.propertyBedrooms >= 4;
        } else {
          // For specific number of bedrooms
          return property.propertyBedrooms === parseInt(searchFilters.beds);
        }
      });
    }
    
    // Apply completion date filter
    if (searchFilters.completion !== null && searchFilters.completion !== undefined) {
      const currentYear = new Date().getFullYear();
      
      result = result.filter(property => {
        // If property doesn't have a completion date, skip it for most filters
        if (!property.completionDate && searchFilters.completion !== 'future') {
          return false;
        }
        
        // Handle special completion values
        if (searchFilters.completion === 'ready') {
          // For "Ready Now" - check if completion date is in the past or current year
          return property.completionStatus === 'Completed' || 
                 (property.completionDate && parseInt(property.completionDate) <= currentYear);
        } else if (searchFilters.completion === 'future') {
          // For "Future Projects" - check if completion date is beyond current year + 3
          return !property.completionDate || 
                 (property.completionDate && parseInt(property.completionDate) > currentYear + 3);
        } else {
          // For specific years (currentYear, currentYear+1, etc.)
          return property.completionDate && property.completionDate.includes(searchFilters.completion);
        }
      });
    }
    
    setFilteredProjects(result);
    setDisplayedProjects(result.slice(0, projectsPerPage));
    setHasMore(result.length > projectsPerPage);
  }, [selectedCategory, searchFilters, allOffPlanProjects]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  // Handle search
  const handleSearch = (params) => {
    console.log('Search params:', params);
    setSearchFilters(params);
  };
  
  // Load more properties
  const handleLoadMore = () => {
    const currentlyDisplayed = displayedProjects.length;
    const newProjects = filteredProjects.slice(0, currentlyDisplayed + projectsPerPage);
    setDisplayedProjects(newProjects);
    setHasMore(newProjects.length < filteredProjects.length);
  };

  return (
    <div>
      <div className="relative">
          <Banner></Banner>
          <div className="sm:absolute sm:-bottom-16 sm:left-1/2 sm:transform sm:-translate-x-1/2 w-full max-w-4xl z-40 ">
          <SearchBar onSearch={handleSearch} priceRange={priceRange} />
          </div>
        </div>
      <div className="mt-16 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Start your <span className="text-[#FF2626]">Off Plan </span>Property Journey with Mateluxy 
        </h1>
        <p className="text-gray-600 max-w-[80%] mt-4">
        From stunning waterfront developments and iconic luxury towers to vibrant family-friendly communities - Dubai's off-plan market has it all. 
        </p>
        <h3 className="text-2xl font-bold text-gray-800 mt-2">
        Let Mateluxy help you find the perfect one.        </h3>
      </div>
     
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange} 
      />
      
     
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 p-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))
        ) : displayedProjects.length > 0 ? (
          displayedProjects.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <p className="text-gray-500 text-lg">No off-plan properties found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setSearchFilters({});
              }}
              className="mt-4 text-[#FF2626] hover:text-[#FF4040] underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      

      {hasMore && !loading && (
        <div className="text-center">
          <button 
            onClick={handleLoadMore}
            className="text-[#FF2626] hover:text-[#FF4040] text-lg font-medium"
          >
            More projects
          </button>

          
        </div>



        
        
      )}
        {/* Latest Project Launches Slider */}
        {!loading && allOffPlanProjects.length > 0 && (
          <LatestLaunchesSlider properties={allOffPlanProjects} />
        )}
        
        {/* Top Investment Hotspots Slider */}
        {/* {!loading && allOffPlanProjects.length > 0 && (
          <InvestmentHotspotsSlider properties={allOffPlanProjects} />
        )} */}
        
        {/* Developer Logo Slider - using all properties, not just Off Plan */}
        {!loading && offPlanProjects.length > 0 && (
          <DeveloperLogoSlider properties={offPlanProjects} />
        )}
      </div>
    );
  };

export default PropertyListing;