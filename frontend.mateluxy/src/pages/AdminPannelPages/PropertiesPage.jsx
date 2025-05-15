import React, { useState, useEffect } from "react";
import { PropertyCard } from "@/components/AdminPannel/properties/PropertyCard";
import { FloatingActionButton } from "@/components/AdminPannel/ui/UIComponents";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/AdminPannel/ui/pagination";
import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/AdminPannel/ui/popover";
import { Label } from "@/components/AdminPannel/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/AdminPannel/ui/select";
import { Slider } from "@/components/AdminPannel/ui/slider";
import { PropertyFormDialog } from "@/components/properties/PropertyFormDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyApi } from "@/services/api";
import { toast } from "@/components/AdminPannel/ui/sonner";

// Categories for the filter tabs
const CATEGORIES = ["All", "Rent", "Buy", "Off Plan", "Commercial for Rent", "Commercial for Buy"];

const PropertiesPage = () => {
  // Get query client for invalidating queries after updates
  const queryClient = useQueryClient();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 4000000]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const itemsPerPage = 6;
  
  // Fetch properties from API - fixed the useQuery hook to use the correct format
  const { data: properties = [], isLoading, error, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getProperties,
    meta: {
      onError: (error) => {
        console.error('Error fetching properties:', error);
      }
    }
  });

  // Listen for search event from Header
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail);
      setCurrentPage(1); // Reset to first page when searching
    };

    window.addEventListener('search', handleSearch);
    return () => window.removeEventListener('search', handleSearch);
  }, []);
  
  // Extract all states/locations from properties
  const locations = Array.from(new Set(properties.map((property) => property.propertyState)));
  
  // Filter properties by category, search query, location and price
  const filteredProperties = properties
    .filter((property) => selectedCategory === "All" || property.category === selectedCategory)
    .filter((property) => 
      !searchQuery || 
      property.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((property) => 
      selectedLocation === "all" || property.propertyState === selectedLocation
    )
    .filter((property) => 
      property.propertyPrice >= priceRange[0] && property.propertyPrice <= priceRange[1]
    );
  
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  
  const currentProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProperty = () => {
    setIsFormDialogOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatPrice = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Transform property data for PropertyCard component
  const transformPropertyForCard = (property) => ({
    id: property._id,
    title: property.propertyTitle,
    address: property.propertyAddress,
    price: property.category === "Rent" ? `AED ${property.propertyPrice}/month` : `AED ${property.propertyPrice}`,
    priceValue: property.propertyPrice,
    type: property.category,
    bedrooms: property.propertyBedrooms,
    bathrooms: property.propertyBathrooms,
    area: `${property.propertySize} sq ft`,
    imageUrl: property.propertyFeaturedImage,
    location: property.propertyState,
    developer: property.developer, // For Off Plan properties
    completionDate: property.completionDate, // For Off Plan properties
    tags: property.tags || [], // Include tags array
    status: property.status || "Active",
    featured: property.featured || false,
  });

  // Handle property edit
  const handleEditProperty = async (propertyId) => {
    try {
      // Find the property in the list
      const property = properties.find(p => p._id === propertyId);
      if (!property) {
        toast.error("Property not found");
        return;
      }
      
      // Set the property to edit
      setPropertyToEdit(property);
      
      // Open the edit dialog
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error preparing property for edit:", error);
      toast.error("Error preparing property for edit");
    }
  };

  // Handle update property
  const handleUpdateProperty = async (updatedPropertyData) => {
    try {
      if (!propertyToEdit || !propertyToEdit._id) {
        toast.error("No property selected for update");
        return;
      }
      
      // Call the API to update the property
      await propertyApi.updateProperty(propertyToEdit._id, updatedPropertyData);
      
      // Show success message
      toast.success("Property updated successfully!");
      
      // Refetch properties to update the list
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Close the edit dialog
      setIsEditDialogOpen(false);
      setPropertyToEdit(null);
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error(error.message || "Failed to update property");
    }
  };

  // Handle property delete
  const handleDeleteProperty = async (propertyId) => {
    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        setIsDeleting(true);
        
        // Find the property details before deletion
        const propertyToDelete = properties.find(p => p._id === propertyId);
        
        // Call the API to delete the property
        await propertyApi.deleteProperty(propertyId);
        
        // Show success message
        toast.success("Property deleted successfully!");
        
        // Refetch properties to update the list
        queryClient.invalidateQueries({ queryKey: ['properties'] });
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error(error.message || "Failed to delete property");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4 sm:mb-0">Properties ({filteredProperties.length})</h2>
          
          {/* Advanced Filter */}
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <Filter size={16} className="mr-2 text-blue-500" />
                  <span>Filters</span>
                  <span className="ml-1.5 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {selectedLocation !== 'all' || priceRange[0] !== 0 || priceRange[1] !== 4000000 ? '2' : '0'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 overflow-hidden" align="end">
                <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center">
                    <Filter size={16} className="mr-2 text-blue-500" />
                    Refine Properties
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Filter properties by location and price range</p>
                </div>
                
                <div className="p-5 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-sm font-medium flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger id="location" className="bg-white border-gray-200 rounded-md h-10 ring-offset-background focus:ring-2 focus:ring-blue-200 focus:ring-offset-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="bg-white shadow-lg border-gray-200">
                        <SelectItem value="all" className="focus:bg-blue-50 focus:text-blue-700">Any location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location} className="focus:bg-blue-50 focus:text-blue-700">{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Price Range
                      </Label>
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </div>
                    </div>
                    
                    <div className="px-1 pt-4 pb-6">
                      <Slider
                        defaultValue={[0, 4000000]}
                        value={priceRange}
                        max={4000000}
                        step={100000}
                        onValueChange={(value) => setPriceRange(value)}
                        className="mb-6"
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500 px-1 relative">
                        <div className="absolute left-0 w-full flex justify-between -top-4">
                          {[0, 1000000, 2000000, 3000000, 4000000].map((value, index) => (
                            <div key={index} className="h-1.5 w-0.5 bg-gray-200"></div>
                          ))}
                        </div>
                        <span className="text-center">$0</span>
                        <span className="text-center">$1M</span>
                        <span className="text-center">$2M</span>
                        <span className="text-center">$3M</span>
                        <span className="text-center">$4M+</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[
                        { label: "< $500K", min: 0, max: 500000 },
                        { label: "$500K-$1M", min: 500000, max: 1000000 },
                        { label: "$1M-$2M", min: 1000000, max: 2000000 },
                        { label: "$2M+", min: 2000000, max: 4000000 }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => setPriceRange([preset.min, preset.max])}
                          className={`text-xs py-1.5 px-2 rounded-md transition border 
                            ${priceRange[0] === preset.min && priceRange[1] === preset.max
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-between space-x-3 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setSelectedLocation('all');
                        setPriceRange([0, 4000000]);
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors flex-1"
                    >
                      Reset All
                    </button>
                    <button 
                      className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-1"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white p-1 rounded-lg shadow-sm inline-flex mb-6 border border-gray-200 overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-lg font-medium text-gray-700">Loading properties...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-lg font-medium text-red-600">Error loading properties</div>
            <p className="text-gray-500 mt-1">Please try refreshing the page.</p>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {currentProperties.map((property) => (
              <PropertyCard 
                key={property._id} 
                property={transformPropertyForCard(property)} 
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        )}
        
        {/* No results */}
        {!isLoading && !error && currentProperties.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">No properties found</h3>
            <p className="text-gray-500 mt-1">Try changing your filter or add new properties.</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Determine which page numbers to show
                let pageNum;
                if (totalPages <= 5) {
                  // If we have 5 or fewer pages, show all
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // If we're near the start, show 1-5
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // If we're near the end, show the last 5
                  pageNum = totalPages - 4 + i;
                } else {
                  // Otherwise show 2 before and 2 after current
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      
      {/* Add Property Button */}
      <FloatingActionButton onClick={handleAddProperty} label="Add Property" />
      
      {/* Add Property Dialog */}
      <PropertyFormDialog 
        isOpen={isFormDialogOpen} 
        onClose={() => setIsFormDialogOpen(false)} 
      />
      
      {/* Edit Property Dialog */}
      {propertyToEdit && (
        <PropertyFormDialog 
          isOpen={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setPropertyToEdit(null);
          }} 
          property={propertyToEdit}
          isEditing={true}
          onPropertyUpdated={handleUpdateProperty}
        />
      )}
    </div>
  );
};

export default PropertiesPage;