import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/AdminPannel/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/AdminPannel/ui/form";
import { Input } from "@/components/AdminPannel/ui/input";
import { Textarea } from "@/components/AdminPannel/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/AdminPannel/ui/select";
import { Checkbox } from "@/components/AdminPannel/ui/UIComponents";
import SimpleMap from "@/components/SimpleMap/SimpleMap";
import { ArrowLeft, Save, Upload, MapPin } from 'lucide-react';

// Common schema fields for all property types
const basePropertySchema = {
  propertyTitle: z.string().min(5, "Title must be at least 5 characters"),
  propertyDescription: z.string().min(20, "Description must be at least 20 characters"),
  propertyAddress: z.string().min(5, "Address is required"),
  propertyCountry: z.string().min(1, "Country is required"),
  propertyState: z.string().min(1, "State is required"),
  propertyZip: z.string().min(1, "ZIP code is required"),
  propertyFeaturedImage: z.string().min(1, "Featured image is required"),
  media: z.array(z.string()).default([]),
  
  propertyType: z.string().min(1, "Property type is required"),
  propertyPrice: z.coerce.number().positive("Price must be positive"),
  brokerFee: z.coerce.number().min(0, "Broker fee cannot be negative"),
  
  propertySize: z.coerce.number().positive("Size must be positive"),
  propertyRooms: z.coerce.number().int().positive("Number of rooms must be positive"),
  propertyBedrooms: z.coerce.number().int().positive("Number of bedrooms must be positive"),
  propertyKitchen: z.coerce.number().int().positive("Number of kitchens must be positive"),
  propertyBathrooms: z.coerce.number().positive("Number of bathrooms must be positive"),
  
  dldPermitNumber: z.string().min(1, "DLD permit number is required"),
  agent: z.string(),
  dldQrCode: z.string().min(1, "DLD QR code is required"),
  
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  
  features: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
};

// Category-specific schema extensions
const buyPropertySchema = z.object({
  ...basePropertySchema,
  numberOfCheques: z.coerce.number().int().min(1, "Number of cheques must be at least 1"),
});

const rentPropertySchema = z.object({
  ...basePropertySchema,
  numberOfCheques: z.coerce.number().int().min(1, "Number of cheques must be at least 1"),
  roiPercentage: z.coerce.number().min(0, "ROI percentage cannot be negative"),
});

const commercialPropertySchema = z.object({
  ...basePropertySchema,
  numberOfCheques: z.coerce.number().int().min(1, "Number of cheques must be at least 1"),
  commercialType: z.string().min(1, "Commercial type is required"),
});

// Property types
const propertyTypes = [
  "Apartment", "Villa", "Townhouse", "Penthouse", "Duplex", 
  "Studio", "Office", "Retail", "Warehouse", "Land"
];
  
// Commercial types
const commercialTypes = [
  "Office", "Retail", "Warehouse", "Industrial", 
  "Shop", "Showroom", "Land", "Hotel"
];

// Amenities list
const amenitiesList = [
  'Swimming Pool', 'Gym', 'Sauna', 'Jacuzzi', 'BBQ Area', 'Kids Play Area', 
  'Security', '24/7 Concierge', 'Parking', 'Garden', 'Beach Access'
];

// Features list
const featuresList = [
  'Balcony', 'Built-in Wardrobes', 'Central A/C', 'Maids Room', 'Study Room', 
  'Walk-in Closet', 'Furnished', 'Pets Allowed', 'Shared Pool'
];

export const RegularPropertyForm = ({ category, agentData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [mediaPreview, setMediaPreview] = useState([]);

  // Select the appropriate schema based on category
  let formSchema;
  switch (category) {
    case "Buy":
      formSchema = buyPropertySchema;
      break;
    case "Rent":
      formSchema = rentPropertySchema;
      break;
    case "Commercial for Buy":
    case "Commercial for Rent":
      formSchema = commercialPropertySchema;
      break;
    default:
      formSchema = buyPropertySchema;
  }

  // Set up form with the selected schema
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyTitle: "",
      propertyDescription: "",
      propertyAddress: "",
      propertyCountry: "UAE",
      propertyState: "Dubai",
      propertyZip: "",
      propertyFeaturedImage: "",
    media: [],
      propertyType: "Apartment",
      propertyPrice: 0,
      brokerFee: 0,
      propertySize: 0,
      propertyRooms: 0,
      propertyBedrooms: 0,
      propertyKitchen: 0,
      propertyBathrooms: 0,
      dldPermitNumber: "",
      agent: agentData?._id || "",
      dldQrCode: "",
    latitude: 25.2048,
    longitude: 55.2708,
    features: [],
    amenities: [],
      ...(category === "Rent" ? { roiPercentage: 0 } : {}),
      ...(category === "Buy" || category === "Rent" || category.includes("Commercial") ? { numberOfCheques: 1 } : {}),
      ...(category.includes("Commercial") ? { commercialType: "Office" } : {}),
    },
  });

  const isCommercial = category.includes("Commercial");
  const isRent = category === "Rent" || category === "Commercial for Rent";
  const isBuy = category === "Buy" || category === "Commercial for Buy";

  // Watch the latitude and longitude fields
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  const compressImage = async (imageDataURL, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageDataURL;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * ratio;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataURL = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataURL);
      };
    });
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          form.setValue('propertyFeaturedImage', compressedImage);
          setFeaturedImagePreview(compressedImage);
        } catch (error) {
          console.error("Error compressing image:", error);
          setError("Error processing image. Please try a smaller image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        const newMedia = [];
        
        for (const file of files) {
          const result = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const compressedImage = await compressImage(reader.result);
                resolve(compressedImage);
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          newMedia.push(result);
        }
        
        const currentMedia = form.getValues('media') || [];
        form.setValue('media', [...currentMedia, ...newMedia]);
        setMediaPreview([...mediaPreview, ...newMedia]);
      } catch (error) {
        console.error("Error processing images:", error);
        setError("Error processing images. Please try smaller images.");
      }
    }
  };

  const handleSubmitForm = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!agentData) {
        throw new Error('Agent data not available');
      }
      
      // Validate images
      if (!values.propertyFeaturedImage) {
        throw new Error('Featured image is required');
      }
      
      // Create the property data to send
      const propertyData = {
        ...values,
        agent: agentData._id, // Use the agent's ID to link the property to this agent
        category
      };
      
      // Log the size of the request for debugging
      const jsonSize = JSON.stringify(propertyData).length / (1024 * 1024);
      console.log(`Request size: ${jsonSize.toFixed(2)} MB`);
      
      if (jsonSize > 45) {
        throw new Error('Request size too large. Please use smaller images or fewer images.');
      }

      onSubmit(propertyData);
    } catch (error) {
      console.error('Error preparing property data:', error);
      setError(error.message || 'An error occurred while preparing the property data');
      setLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="bg-white space-y-6">
      {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600">
            {error}
        </div>
      )}
      
        <div className="space-y-4">
          <h3 className="text-lg font-medium">General Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
                name="propertyTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(isCommercial ? commercialTypes : propertyTypes).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
              />
            </div>
            
          <FormField
            control={form.control}
            name="propertyDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the property"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
                name="propertyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
                name="propertyCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="propertyState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state or city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="propertyZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ZIP code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel>Featured Image</FormLabel>
              <div className="mt-1 border border-gray-300 rounded-md p-2">
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              {featuredImagePreview && (
                <div className="mt-2">
                  <img 
                    src={featuredImagePreview} 
                    alt="Featured" 
                    className="h-32 object-cover rounded-md" 
              />
                </div>
              )}
            </div>
            
            <div>
              <FormLabel>Additional Images</FormLabel>
              <div className="mt-1 border border-gray-300 rounded-md p-2">
              <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
              />
            </div>
              {mediaPreview.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mediaPreview.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Media ${i}`} 
                      className="h-16 w-16 object-cover rounded-md" 
              />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pricing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="propertyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price {isRent ? "(Yearly)" : ""}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brokerFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Broker Fee</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter broker fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(isBuy || isRent) && (
              <FormField
                control={form.control}
                  name="numberOfCheques"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Cheques</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Enter number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {isRent && (
              <FormField
                control={form.control}
                  name="roiPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ROI Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter ROI %" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="propertySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter size" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
                name="propertyRooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rooms</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Number of rooms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
                name="propertyBedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Number of bedrooms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
                name="propertyBathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Number of bathrooms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
                name="propertyKitchen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kitchens</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Number of kitchens" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
            </div>
          </div>
          
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                  </div>
          
          <div className="h-64 border rounded-md overflow-hidden">
            <SimpleMap 
              latitude={latitude} 
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                form.setValue('latitude', lat);
                form.setValue('longitude', lng);
              }}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Features & Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Features</FormLabel>
                    <FormDescription>
                      Select the features this property has
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {featuresList.map((feature) => (
                      <FormField
                        key={feature}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  id={`feature-${feature}`}
                                  checked={field.value?.includes(feature)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const updatedFeatures = checked
                                      ? [...field.value, feature]
                                      : field.value?.filter(
                                          (value) => value !== feature
                                        );
                                    field.onChange(updatedFeatures);
                                  }}
                                  label={feature}
                                />
                              </FormControl>
                              <FormLabel className="font-normal sr-only">
                                {feature}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
            </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Amenities</FormLabel>
                    <FormDescription>
                      Select the amenities this property has
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={amenity}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  id={`amenity-${amenity}`}
                                  checked={field.value?.includes(amenity)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const updatedAmenities = checked
                                      ? [...field.value, amenity]
                                      : field.value?.filter(
                                          (value) => value !== amenity
                                        );
                                    field.onChange(updatedAmenities);
                                  }}
                                  label={amenity}
                                />
                              </FormControl>
                              <FormLabel className="font-normal sr-only">
                                {amenity}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
            </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dldPermitNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DLD Permit Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter permit number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dldQrCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DLD QR Code URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter QR code URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button type="submit" disabled={loading} className="flex items-center">
            {loading ? "Saving..." : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Property
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 