import React, { useState } from 'react';
import { ArrowLeft, Save, Upload, Building, MapPin, Calendar, Tag, FileText } from 'lucide-react';

const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office', 'Retail', 'Warehouse', 'Land'];
const launchTypes = ['New Launch', 'Pre-Launch', 'Coming Soon', 'Ready to Move'];

export const OffPlanPropertyForm = ({ agentData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Core category
    category: 'Off Plan',
    // Off Plan specific fields
    launchType: '',
    developer: '',
    developerImage: '',
    propertyTitle: '',
    propertyType: 'Apartment',
    shortDescription: '',
    brochureFile: '',
    dldPermitNumber: '',
    propertyPrice: '', // Using as starting price
    propertySize: '', // Using as area
    propertyBedrooms: 0,
    propertyAddress: '', // Using as location
    propertyDescription: '', // Using as project description
    exteriorsGallery: [],
    interiorsGallery: [],
    exactLocation: '',
    latitude: 25.2048,
    longitude: 55.2708,
    completionDate: '',
    paymentPlan: '',
    duringConstructionPercentage: 50,
    onCompletionPercentage: 50,
    tags: [],
    
    // Required fields from the property model but not shown on form
    propertyCountry: 'UAE',
    propertyState: 'Dubai',
    propertyZip: '00000',
    propertyFeaturedImage: '',
    media: [],
    brokerFee: 0,
    propertyRooms: 0,
    propertyKitchen: 0,
    propertyBathrooms: 0,
    dldQrCode: '',
    features: [],
    amenities: []
  });

  const compressImage = (imageDataURL, maxWidth = 1200) => {
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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTagChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData({
      ...formData,
      tags: tagsArray
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          setFormData({
            ...formData,
            [field]: compressedImage
          });
        } catch (error) {
          console.error("Error compressing image:", error);
          setError("Error processing image. Please try a smaller image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = async (e, galleryName) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        const newImages = [];
        
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
          
          newImages.push(result);
        }
        
        setFormData({
          ...formData,
          [galleryName]: [...formData[galleryName], ...newImages]
        });
      } catch (error) {
        console.error("Error processing images:", error);
        setError("Error processing images. Please try smaller images.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!agentData) {
        throw new Error('Agent data not available');
      }
      
      // Validate required fields
      if (!formData.developerImage) {
        throw new Error('Developer image is required');
      }
      if (!formData.brochureFile) {
        throw new Error('Brochure file is required');
      }
      if (formData.exteriorsGallery.length === 0) {
        throw new Error('At least one exterior image is required');
      }
      if (!formData.completionDate) {
        throw new Error('Completion date is required');
      }
      if (!formData.paymentPlan) {
        throw new Error('Payment plan is required');
      }
      
      // Create a new object for the property data to ensure all fields are included
      const propertyData = {};
      
      // Copy all form data fields
      Object.keys(formData).forEach(key => {
        propertyData[key] = formData[key];
      });
      
      // Ensure payment percentage fields are explicitly set as numbers
      propertyData.duringConstructionPercentage = parseInt(formData.duringConstructionPercentage, 10);
      propertyData.onCompletionPercentage = parseInt(formData.onCompletionPercentage, 10);
      
      // Set featured image and media
      propertyData.propertyFeaturedImage = formData.exteriorsGallery[0];
      propertyData.media = [...formData.exteriorsGallery, ...formData.interiorsGallery];
      propertyData.agent = agentData._id;
      
      // Log payment percentages for debugging
      console.log('Payment percentages being submitted:', { 
        duringConstructionPercentage: propertyData.duringConstructionPercentage, 
        onCompletionPercentage: propertyData.onCompletionPercentage 
      });
      
      // Log the size of the request for debugging
      const jsonSize = JSON.stringify(propertyData).length / (1024 * 1024);
      console.log(`Request size: ${jsonSize.toFixed(2)} MB`);
      
      if (jsonSize > 45) {
        throw new Error('Request size too large. Please use smaller images or fewer images.');
      }

      // Submit the property data
      onSubmit(propertyData);
    } catch (error) {
      console.error('Error preparing property data:', error);
      setError(error.message || 'An error occurred while preparing the property data');
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Developer Information */}
        <div className="space-y-5 p-5 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <Building size={20} className="text-purple-700" />
            <h2 className="text-xl font-semibold text-gray-800">Developer Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Launch Type*
              </label>
              <select
                name="launchType"
                value={formData.launchType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Launch Type</option>
                {launchTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developer Name*
              </label>
              <input
                type="text"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developer Logo*
              </label>
              <div className="mt-1 flex items-center">
                <div className="flex-shrink-0 h-24 w-24 border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                  {formData.developerImage ? (
                    <img 
                      src={formData.developerImage} 
                      alt="Developer" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <Upload size={24} />
                    </div>
                  )}
                </div>
                <label className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'developerImage')}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project Information */}
        <div className="space-y-5 p-5 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <FileText size={20} className="text-blue-700" />
            <h2 className="text-xl font-semibold text-gray-800">Project Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name*
              </label>
              <input
                type="text"
                name="propertyTitle"
                value={formData.propertyTitle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type*
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description*
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">A brief summary of the project that will appear in listings</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagChange}
                placeholder="Premium, Beachfront, Furnished"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Add tags separated by commas (e.g., Premium, Beachfront)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brochure File URL*
              </label>
              <input
                type="text"
                name="brochureFile"
                value={formData.brochureFile}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DLD Permit Number*
              </label>
              <input
                type="text"
                name="dldPermitNumber"
                value={formData.dldPermitNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="space-y-5 p-5 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <Calendar size={20} className="text-green-700" />
            <h2 className="text-xl font-semibold text-gray-800">Property Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price (AED)*
              </label>
              <input
                type="number"
                name="propertyPrice"
                value={formData.propertyPrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (sq ft)*
              </label>
              <input
                type="number"
                name="propertySize"
                value={formData.propertySize}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms*
              </label>
              <input
                type="number"
                name="propertyBedrooms"
                value={formData.propertyBedrooms}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location*
              </label>
              <input
                type="text"
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleChange}
                required
                placeholder="e.g. Dubai Marina"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date*
              </label>
              <input
                type="text"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                required
                placeholder="Q4 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Expected completion date (e.g. Q4 2025)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Plan*
              </label>
              <input
                type="text"
                name="paymentPlan"
                value={formData.paymentPlan}
                onChange={handleChange}
                required
                placeholder="Detailed payment plan description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Detailed payment plan description</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                During Construction (%)*
              </label>
              <input
                type="number"
                name="duringConstructionPercentage"
                value={formData.duringConstructionPercentage}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Percentage to be paid during construction</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                On Completion (%)*
              </label>
              <input
                type="number"
                name="onCompletionPercentage"
                value={formData.onCompletionPercentage}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Percentage to be paid on completion</p>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description*
              </label>
              <textarea
                name="propertyDescription"
                value={formData.propertyDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Location and Galleries */}
        <div className="space-y-5 p-5 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <MapPin size={20} className="text-amber-700" />
            <h2 className="text-xl font-semibold text-gray-800">Location & Media</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exact Location*
              </label>
              <input
                type="text"
                name="exactLocation"
                value={formData.exactLocation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Detailed location description (e.g. 5 min from Dubai Mall)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exterior Gallery* (First image will be featured image)
              </label>
              <div className="mt-1 flex items-center">
                <label className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleGalleryUpload(e, 'exteriorsGallery')}
                    className="sr-only"
                  />
                </label>
              </div>
              
              {formData.exteriorsGallery.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 bg-gray-100 p-3 rounded-md border border-gray-200">
                  {formData.exteriorsGallery.map((image, index) => (
                    <div key={index} className="h-20 w-full border border-gray-300 rounded-md overflow-hidden bg-white">
                      <img 
                        src={image} 
                        alt={`Exterior ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interior Gallery
              </label>
              <div className="mt-1 flex items-center">
                <label className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleGalleryUpload(e, 'interiorsGallery')}
                    className="sr-only"
                  />
                </label>
              </div>
              
              {formData.interiorsGallery.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 bg-gray-100 p-3 rounded-md border border-gray-200">
                  {formData.interiorsGallery.map((image, index) => (
                    <div key={index} className="h-20 w-full border border-gray-300 rounded-md overflow-hidden bg-white">
                      <img 
                        src={image} 
                        alt={`Interior ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 