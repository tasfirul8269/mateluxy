import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/AdminPannel/ui/dialog";
import TabbedPropertyForm from "./TabbedPropertyForm";
import { toast } from "sonner";
import { propertyApi } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/AdminPannel/ui/loading-spinner";

// Create a persistent form state for Off Plan properties
const persistentOffPlanFormState = {
  formData: null
};

export const OffPlanPropertyFormDialog = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Store form data in persistent state in case submission fails
      persistentOffPlanFormState.formData = data;

      // Ensure all required fields are present
      const ensureRequiredFields = {
        // If a field might be missing, provide a default value
        propertyCountry: data.propertyCountry || "UAE",
        propertyState: data.propertyState || (data.location || "Dubai"),
        propertyZip: data.propertyZip || "00000",
        dldQrCode: data.dldQrCode || "https://example.com/qrcode.png",
        brokerFee: data.brokerFee !== undefined ? data.brokerFee : 0,
        propertyRooms: data.propertyRooms || (data.bedrooms ? data.bedrooms + 1 : 1),
        propertyBathrooms: data.propertyBathrooms || data.bedrooms || 1,
        propertyKitchen: data.propertyKitchen || 1,
        agent: data.agent || "1", // Default agent
      };
      
      // Transform the form data to match the backend model
      const propertyData = { 
        // Base required fields
        propertyTitle: data.propertyTitle,
        propertyDescription: data.projectDescription || data.shortDescription,
        propertyAddress: data.location || data.exactLocation,
        propertyFeaturedImage: data.exteriorsGallery?.[0] || data.propertyFeaturedImage || "https://via.placeholder.com/600x400?text=Property",
        media: [...(data.exteriorsGallery || []), ...(data.interiorsGallery || [])],
        
        // Explicitly add the galleries as separate arrays
        exteriorsGallery: data.exteriorsGallery || [],
        interiorsGallery: data.interiorsGallery || [],
        
        // Category and type
        category: "Off Plan",
        propertyType: data.propertyType, // Use selected property type
        
        // Price details
        propertyPrice: data.startingPrice,
        
        // Off-plan specific
        developer: data.developerName,
        developerImage: data.developerImage,
        launchType: data.launchType,
        brochureFile: data.brochureFile,
        shortDescription: data.shortDescription,
        exactLocation: data.exactLocation,
        tags: data.tags || [],
        completionDate: data.completionDate,
        paymentPlan: data.paymentPlan,
        duringConstructionPercentage: parseInt(data.duringConstructionPercentage || 50, 10),
        onCompletionPercentage: parseInt(data.onCompletionPercentage || 50, 10),
        
        // Property features
        propertySize: data.area,
        propertyBedrooms: data.bedrooms,
        
        // Legal
        dldPermitNumber: data.dldPermitNumber,
        
        // Location
        latitude: data.latitude,
        longitude: data.longitude,

        // Include the ensured required fields
        ...ensureRequiredFields
      };
      
      console.log("Submitting Off Plan property:", propertyData);
      
      // Ensure all required fields from Property model are present
      if (!propertyData.propertyCountry) {
        throw new Error("Country is required");
      }
      if (!propertyData.propertyState) {
        throw new Error("State is required");
      }
      if (!propertyData.propertyZip) {
        throw new Error("ZIP code is required");
      }
      if (!propertyData.dldQrCode) {
        throw new Error("DLD QR code is required");
      }
      if (propertyData.brokerFee === undefined) {
        throw new Error("Broker fee is required");
      }
      
      // Send data to the API
      await propertyApi.createProperty(propertyData);
      
      // Clear persistent form state after successful submission
      persistentOffPlanFormState.formData = null;
      
      // Show success message
      toast.success("Off Plan property added successfully!");
      
      // Invalidate and refetch the properties query
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error adding Off Plan property:", error);
      toast.error(error.message || "Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white sm:max-w-[1100px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Add New Off Plan Property</DialogTitle>
        </DialogHeader>
        
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Submitting property...</p>
          </div>
        ) : (
          <TabbedPropertyForm 
            onSubmit={handleSubmit}
            onCancel={onClose}
            selectedCategory="Off Plan"
            initialData={persistentOffPlanFormState.formData}
            onFormChange={(formData) => {
              persistentOffPlanFormState.formData = formData;
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};