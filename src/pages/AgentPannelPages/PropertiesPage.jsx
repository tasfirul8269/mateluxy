import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PropertyCard } from "@/components/AgentPannel/PropertyCard";
import { toast } from "sonner";
import { PropertyFormDialog } from '@/components/AgentPannel/PropertyFormDialog';

const PropertiesPage = () => {
  const location = useLocation(); // Get location to detect URL changes
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentData, setAgentData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);

  useEffect(() => {
    fetchProperties();
    // Re-fetch when the URL query parameters change (refresh param)
  }, [location.search]);
  
  // Function to fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Get agent data first
      const agentRes = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/auth-status`, {
        credentials: 'include',
      });
      
      if (!agentRes.ok) {
        throw new Error('Failed to fetch agent data');
      }
      
      const agentData = await agentRes.json();
      setAgentData(agentData);
      
      // Then fetch properties for this agent
      const propertiesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${agentData._id}`, {
        credentials: 'include',
      });
      
      if (!propertiesRes.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const propertiesData = await propertiesRes.json();
      
      // Don't filter again - just use the properties returned by the API
      // This avoids issues where property.agent might be an object instead of just the ID
      setProperties(propertiesData);
      console.log("Fetched properties:", propertiesData.length);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter properties based on search term and category
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || property.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Properties count
  const propertyCount = properties.length;

  // Handle edit property
  const handleEditProperty = (propertyId) => {
    const property = properties.find(p => p._id === propertyId);
    if (property) {
      setPropertyToEdit(property);
      setIsEditDialogOpen(true);
    } else {
      toast.error("Property not found");
    }
  };

  // Handle property update
  const handlePropertyUpdated = (updatedProperty) => {
    fetchProperties(); // Refresh the properties list
    toast.success("Property updated successfully");
  };

  // Handle property deletion
  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        setIsLoading(true);
        
        // Find the property details before deletion
        const propertyToDelete = properties.find(p => p._id === propertyId);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          // Successfully deleted, refetch properties
          fetchProperties();
          toast.success("Property deleted successfully");
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to delete property");
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        toast.error("An error occurred while deleting the property");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
          <p className="text-gray-500">Total: {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}</p>
        </div>
        
        <Link 
          to="/agent-pannel/add-property"
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Property
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Buy">Buy</option>
              <option value="Rent">Rent</option>
              <option value="Off Plan">Off Plan</option>
              <option value="Commercial for Buy">Commercial for Buy</option>
              <option value="Commercial for Rent">Commercial for Rent</option>
            </select>
          </div>
        </div>
        
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No properties found</p>
            <Link 
              to="/agent-pannel/add-property"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard 
                key={property._id} 
                property={property} 
                onDelete={handleDeleteProperty}
                onEdit={() => handleEditProperty(property._id)}
              />
            ))}
          </div>
        )}
      </div>

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
          agentData={agentData}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </div>
  );
};

export default PropertiesPage; 