import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/AdminPannel/ui/dialog";
import { toast } from "sonner";
import { propertyApi } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import TabbedPropertyForm from "@/components/properties/TabbedPropertyForm";

// Create a persistent form state object to store form data between dialog opens/closes
const persistentFormState = {
  formData: null,
  selectedCategory: null
};

export const PropertyFormDialog = ({ 
  isOpen, 
  onClose, 
  property = null, 
  isEditing = false,
  onPropertyUpdated = null,
  onPropertyAdded = null,
  agentData = null
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    isEditing && property ? property.category : persistentFormState.selectedCategory
  );

  // Update selected category if property changes
  useEffect(() => {
    if (isEditing && property) {
      setSelectedCategory(property.category);
    }
  }, [isEditing, property]);

  // Save selected category to persistent state when it changes
  useEffect(() => {
    if (!isEditing) {
      persistentFormState.selectedCategory = selectedCategory;
    }
  }, [selectedCategory, isEditing]);

  const categories = [
    { id: "Buy", label: "Buy", icon: "🏠" },
    { id: "Rent", label: "Rent", icon: "🔑" },
    { id: "Off Plan", label: "Off Plan", icon: "🏗️" },
    { id: "Commercial for Buy", label: "Commercial for Buy", icon: "🏢" },
    { id: "Commercial for Rent", label: "Commercial for Rent", icon: "🏬" },
  ];

  // Successful property submission handler
  const successHandler = (propertyData, isEdit) => {
    const successMessage = isEdit 
      ? "Property updated successfully!" 
      : "Property added successfully!";
      
    // Clear persistent form state after successful submission
    persistentFormState.formData = null;
    persistentFormState.selectedCategory = null;
    
    // Close the dialog
    onClose();
    
    // Show success toast
    toast.success(successMessage);
    
    // Call the appropriate callback
    if (isEdit && onPropertyUpdated) {
      onPropertyUpdated(propertyData);
    } else if (!isEdit && onPropertyAdded) {
      onPropertyAdded(propertyData);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Store form data in persistent state in case submission fails
      if (!isEditing) {
        persistentFormState.formData = data;
      }
      
      // Ensure the agent ID is properly set
      if (!agentData?._id) {
        throw new Error('Agent data is missing or invalid');
      }
      
      // Ensure all required fields are set and associate with the agent
      const propertyData = { 
        ...data,
        category: selectedCategory,
        agent: agentData._id, // Use the agent's ID automatically
        // Ensure these required fields are present
        propertyCountry: data.propertyCountry || "UAE",
        propertyState: data.propertyState || "Dubai",
        propertyZip: data.propertyZip || "00000",
        propertyFeaturedImage: data.propertyFeaturedImage || data.featuredImage || "https://via.placeholder.com/600x400?text=Property",
        brokerFee: data.brokerFee !== undefined ? data.brokerFee : 0,
        dldQrCode: data.dldQrCode || "https://example.com/qrcode.png"
      };
      
      console.log(`${isEditing ? "Updating" : "Creating"} property:`, propertyData);
      console.log("Agent ID being used:", agentData._id);
      
      if (isEditing && property) {
        // Update existing property
        const updatedProperty = await propertyApi.updateProperty(property._id, propertyData);
        console.log("Property updated:", updatedProperty);
        
        // Call the success handler with property data and edit status
        successHandler(updatedProperty, true);
      } else {
        // Create new property
        const newProperty = await propertyApi.createProperty(propertyData);
        console.log("Property added:", newProperty);
        
        // Call the success handler with property data and edit status
        successHandler(newProperty, false);
      }
      
      // Refresh the properties list
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} property:`, error);
      toast.error(error.message || `Failed to ${isEditing ? "update" : "add"} property. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    // Only allow going back if not in edit mode
    if (!isEditing) {
      setSelectedCategory(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white sm:max-w-[1100px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {isEditing 
              ? `Edit ${property?.category || ''} Property` 
              : selectedCategory 
                ? `Add New ${selectedCategory} Property` 
                : "Select Property Category"
            }
          </DialogTitle>
        </DialogHeader>
        
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></span>
            <p className="mt-4 text-gray-600">
              {isEditing ? "Updating property..." : "Submitting property..."}
            </p>
          </div>
        ) : selectedCategory ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isEditing && (
              <div className="mb-4">
                <button 
                  onClick={handleBack}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  <span className="ml-1">Back to categories</span>
                </button>
              </div>
            )}
            <TabbedPropertyForm 
              onSubmit={handleSubmit} 
              onCancel={onClose} 
              selectedCategory={selectedCategory}
              initialData={isEditing ? {
                ...property,
                agent: agentData?._id // Ensure agent ID is set
              } : {
                ...persistentFormState.formData,
                agent: agentData?._id // Ensure agent ID is set
              }}
              isEditing={isEditing}
              onFormChange={(formData) => {
                if (!isEditing) {
                  // Preserve the agent ID when updating form data
                  persistentFormState.formData = {
                    ...formData,
                    agent: agentData?._id
                  };
                }
              }}
              // Pass a flag to indicate this is being used in the agent panel
              isAgentPanel={true}
              agentId={agentData?._id}
            />
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.label}</h3>
                  <p className="text-gray-500 text-sm">
                    Add a new {category.label.toLowerCase()} property listing
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 