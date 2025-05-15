import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion"; // Import framer-motion for animations
// Import agent API
import { agentApi } from "@/services/agentApi";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import S3 upload utilities
import { uploadFileToS3, uploadMultipleFilesToS3 } from '../../utils/s3Upload.js';

const COUNTRY_LIST = ["UAE", "Qatar", "Saudi Arabia", "Kuwait", "Bahrain", "Oman"];
const PROPERTY_TYPE_LIST = [
  "Apartment", "Villa", "Townhouse", "Penthouse", "Duplex", "Studio", "Office", "Retail", "Warehouse", "Land"
];
const FEATURES_LIST = ["Balcony", "Pool", "Gym", "Parking", "Garden", "Elevator", "Security", "Smart Home"];
const AMENITIES_LIST = ["School", "Supermarket", "Hospital", "Mosque", "Park", "Mall", "Metro", "Playground"];

const DEFAULT_FEATURES_LIST = ["Balcony", "Pool", "Gym", "Parking", "Garden", "Elevator", "Security", "Smart Home"];
const DEFAULT_AMENITIES_LIST = ["School", "Supermarket", "Hospital", "Mosque", "Park", "Mall", "Metro", "Playground"];

// Animation variants for tab transitions
const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// Add this constant at the top of the file with other constants
const DEFAULT_MAP_IMAGE = "https://maps.googleapis.com/maps/api/staticmap?center=25.2048,55.2708&zoom=12&size=600x400&markers=color:red%7C25.2048,55.2708";

// Add Mapbox token constant
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWF0ZWx1eHkiLCJhIjoiY2x2MXN0M2RqMDF0MzJqcnF1dG5qZ2J0eiJ9.0Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Add default coordinates constant
const DEFAULT_COORDINATES = {
  latitude: 25.2048, // Dubai coordinates
  longitude: 55.2708,
  zoom: 12
};

// Move MapPreview component outside of the main component
const MapPreview = React.memo(({ latitude, longitude, zoomLevel, onMapClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const tileLayer = useRef(null);

  // Validate coordinates
  const validLatitude = typeof latitude === 'number' && !isNaN(latitude) ? latitude : DEFAULT_COORDINATES.latitude;
  const validLongitude = typeof longitude === 'number' && !isNaN(longitude) ? longitude : DEFAULT_COORDINATES.longitude;
  const validZoom = typeof zoomLevel === 'number' && !isNaN(zoomLevel) ? zoomLevel : DEFAULT_COORDINATES.zoom;

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      if (!mapContainer.current || map.current || !isMounted) return;

      try {
        // Initialize map
        map.current = L.map(mapContainer.current, {
          center: [validLatitude, validLongitude],
          zoom: validZoom,
          zoomControl: true
        });

        // Add OpenStreetMap tiles
        tileLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map.current);

        // Add marker
        marker.current = L.marker([validLatitude, validLongitude]).addTo(map.current);

        // Add click event
        map.current.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (onMapClick) {
            onMapClick(lat, lng);
          }
          if (marker.current) {
            marker.current.setLatLng([lat, lng]);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        // Cleanup if initialization fails
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
        tileLayer.current = null;
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  // Update map when props change
  useEffect(() => {
    if (!map.current) return;

    try {
      map.current.setView([validLatitude, validLongitude], validZoom);
      if (marker.current) {
        marker.current.setLatLng([validLatitude, validLongitude]);
      }
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }, [validLatitude, validLongitude, validZoom]);

  return (
    <div ref={mapContainer} className="w-full h-[400px] rounded-lg overflow-hidden" />
  );
});

export default function TabbedPropertyForm({ onSubmit, onCancel, selectedCategory, initialData = null, isEditing = false, onFormChange = null, isAgentPanel = false, agentId = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [agents, setAgents] = useState([]);

  // Different tab layouts based on property category
  const categoryTabs = {
    "Buy": [
      { label: "General Details" },
      { label: "Price" },
      { label: "Specific Details" },
      { label: "Map" },
      { label: "Features & Amenities" },
    ],
    "Rent": [
      { label: "General Details" },
      { label: "Price" },
      { label: "Specific Details" },
      { label: "Map" },
      { label: "Features & Amenities" },
    ],
    "Off Plan": [
      { label: "Developer Info" },
      { label: "Property Details" },
      { label: "Pricing & Specifics" },
      { label: "Location" },
      { label: "Gallery & Files" },
    ],
    "Commercial for Buy": [
      { label: "General Details" },
      { label: "Price" },
      { label: "Specific Details" },
      { label: "Map" },
      { label: "Features & Amenities" },
    ],
    "Commercial for Rent": [
      { label: "General Details" },
      { label: "Price" },
      { label: "Specific Details" },
      { label: "Map" },
      { label: "Features & Amenities" },
    ],
  };

  // Use the tabs based on the selected category
  const TAB_LIST = categoryTabs[selectedCategory] || categoryTabs["Buy"];

  // Define different initial form states based on category
  const getInitialFormState = () => {
    // If we have initialData for editing, use that
    if (initialData) {
      // Log the agent field for debugging
      console.log("Initial data agent field:", initialData.agent);
      
      // Transform backend data model to form model
      return {
        // General
        propertyTitle: initialData.propertyTitle || "",
        propertyDescription: initialData.propertyDescription || "",
        propertyAddress: initialData.propertyAddress || "",
        propertyCountry: initialData.propertyCountry || "UAE",
        propertyState: initialData.propertyState || "",
        propertyZip: initialData.propertyZip || "",
        featuredImage: initialData.propertyFeaturedImage || "",

        // Media
        media: initialData.media || [],

        // Property details
        propertyType: initialData.propertyType || "",
        propertyPrice: initialData.propertyPrice || "",
        numberOfCheques: initialData.numberOfCheques || "",
        brokerFee: initialData.brokerFee || "",
        propertySize: initialData.propertySize || "",
        propertyRooms: initialData.propertyRooms || "",
        propertyBedrooms: initialData.propertyBedrooms || "",
        propertyKitchen: initialData.propertyKitchen || "",
        propertyBathrooms: initialData.propertyBathrooms || "",

        // Legal
        dldPermitNumber: initialData.dldPermitNumber || "",
        dldQrCode: initialData.dldQrCode || "",
        // Handle agent field carefully - could be an object with _id or a string ID
        agent: initialData.agent ? (typeof initialData.agent === 'object' ? initialData.agent._id : initialData.agent) : "",

        // Location
        latitude: initialData.latitude || DEFAULT_COORDINATES.latitude,
        longitude: initialData.longitude || DEFAULT_COORDINATES.longitude,
        zoomLevel: initialData.zoomLevel || DEFAULT_COORDINATES.zoom.toString(),

        // Features and amenities
        features: initialData.features || [],
        amenities: initialData.amenities || [],

        // Off Plan specific
        developer: initialData.developer || "",
        developerImage: initialData.developerImage || "",
        launchType: initialData.launchType || "",
        brochureFile: initialData.brochureFile || "",
        shortDescription: initialData.shortDescription || "",
        exactLocation: initialData.exactLocation || "",
        tags: initialData.tags || [],
        completionDate: initialData.completionDate || "",
        paymentPlan: initialData.paymentPlan || "",
        duringConstructionPercentage: initialData.duringConstructionPercentage || 50,
        onCompletionPercentage: initialData.onCompletionPercentage || 50,
        exteriorGallery: initialData.media ? initialData.media.slice(0, 5) : [],
        interiorGallery: initialData.media ? initialData.media.slice(5, 10) : [],

        // Additional fields
        category: selectedCategory,
      };
    }

    // Otherwise, use the default initial state
    const commonFields = {
      // Common fields for Buy and Rent
      propertyTitle: "",
      propertyDescription: "",
      propertyAddress: "",
      propertyCountry: "",
      propertyState: "",
      propertyZip: "",
      featuredImage: "",
      media: [],
      propertyType: "Apartment",
      propertyPrice: "",
      numberOfCheques: "",
      brokerFee: "",
      propertySize: "",
      propertyRooms: "",
      propertyBedrooms: "",
      propertyKitchen: "",
      propertyBathrooms: "",
      dldPermitNumber: "",
      dldQrCode: "",
      agent: "", // This will be set when agents are fetched
      latitude: DEFAULT_COORDINATES.latitude,
      longitude: DEFAULT_COORDINATES.longitude,
      zoomLevel: DEFAULT_COORDINATES.zoom.toString(),
      features: [], // Initialize as empty array
      amenities: [], // Initialize as empty array
      completionDate: "", // Added completion date for all property types
      category: selectedCategory,
    };

    // For Off Plan properties
    if (selectedCategory === "Off Plan") {
      return {
        ...commonFields,
        developer: "",
        developerImage: "",
        launchType: "New Launch",
        brochureFile: "",
        shortDescription: "",
        exactLocation: "",
        exteriorGallery: [],
        interiorGallery: [],
        tags: [],
        completionDate: "",
        paymentPlan: "",
        duringConstructionPercentage: 50,
        onCompletionPercentage: 50,
      };
    }

    // For Rent properties
    if (selectedCategory === "Rent" || selectedCategory === "Commercial for Rent") {
      return {
        ...commonFields,
        roiPercentage: "", // Return on Investment
      };
    }

    // For Commercial properties
    if (selectedCategory.includes("Commercial")) {
      return {
        ...commonFields,
        commercialType: "", // Type of commercial property
      };
    }

    // Default for Buy
    return commonFields;
  };

  const [form, setForm] = useState(getInitialFormState());

  // Update form when initialData changes
  useEffect(() => {
    if (initialData || selectedCategory) {
      setForm(getInitialFormState());
    }
  }, [initialData, selectedCategory]);

  // Call onFormChange whenever form changes
  useEffect(() => {
    if (onFormChange) {
      onFormChange(form);
    }
  }, [form, onFormChange]);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadErrorQr, setUploadErrorQr] = useState("");

  // New upload states for Off Plan
  const [uploadingDeveloperLogo, setUploadingDeveloperLogo] = useState(false);
  const [uploadErrorDeveloperLogo, setUploadErrorDeveloperLogo] = useState("");
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadErrorBrochure, setUploadErrorBrochure] = useState("");
  const [uploadingLocationImage, setUploadingLocationImage] = useState(false);
  const [uploadErrorLocationImage, setUploadErrorLocationImage] = useState("");
  const [uploadingExterior, setUploadingExterior] = useState(false);
  const [uploadErrorExterior, setUploadErrorExterior] = useState("");
  const [uploadingInterior, setUploadingInterior] = useState(false);
  const [uploadErrorInterior, setUploadErrorInterior] = useState("");

  // States for custom inputs
  const [showCustomFeatureInput, setShowCustomFeatureInput] = useState(false);
  const [customFeature, setCustomFeature] = useState("");
  const [showCustomAmenityInput, setShowCustomAmenityInput] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [featuresList, setFeaturesList] = useState(DEFAULT_FEATURES_LIST);
  const [amenitiesList, setAmenitiesList] = useState(DEFAULT_AMENITIES_LIST);

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentApi.getAgents();
        if (data && Array.isArray(data)) {
          setAgents(data);
          console.log("Available agents:", data);
          
          // When editing, make sure we keep the existing agent selection
          if (isEditing && initialData && initialData.agent) {
            console.log("Property has agent:", initialData.agent);
            // Don't override agent if already set in initial data
          } else if (data.length > 0) {
            // Only set default agent if not in edit mode
            setForm(prev => ({ ...prev, agent: data[0]._id }));
          }
        } else {
          console.error("Invalid agents data received:", data);
          setAgents([]);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        setAgents([]);
      }
    };

    fetchAgents();
  }, [isEditing, initialData]);

  // Import S3 upload utilities at the top of the file
  
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handler for media gallery upload (Buy/Rent properties)
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      // Upload multiple files to S3 in the 'properties/media/' folder
      const validUrls = await uploadMultipleFilesToS3(files, 'properties/media/');

      if (validUrls.length > 0) {
        setForm(prev => ({
          ...prev,
          media: [...prev.media, ...validUrls]
        }));
      } else {
        setUploadError("Failed to upload media. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading media files:", error);
      setUploadError("Failed to upload media. Please try again.");
    }

    setUploading(false);
  };

  // Handler to remove a media item
  const handleRemoveMedia = (index) => {
    setForm(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

// Featured image upload function
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  setUploading(true);
  setUploadError("");
  
  try {
    // Upload file to S3 in the 'properties/featured/' folder
    const fileUrl = await uploadFileToS3(file, 'properties/featured/');
    setForm((prev) => ({ ...prev, featuredImage: fileUrl }));
  } catch (err) {
    console.error("Error uploading featured image:", err);
    setUploadError("Upload failed. Try again.");
  }
  
  setUploading(false);
};

// Handle removing featured image
const handleRemoveImage = () => {
  setForm((prev) => ({ ...prev, featuredImage: "" }));
  setUploadError("");
};

// DLD QR code upload
const handleQrUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  setUploadingQr(true);
  setUploadErrorQr("");
  
  try {
    // Upload file to S3 in the 'properties/qr/' folder
    const fileUrl = await uploadFileToS3(file, 'properties/qr/');
    setForm((prev) => ({ ...prev, dldQrCode: fileUrl }));
  } catch (err) {
    console.error("Error uploading QR code:", err);
    setUploadErrorQr("Upload failed. Try again.");
  }
  
  setUploadingQr(false);
};

// Developer Logo upload
const handleDeveloperLogoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  setUploadingDeveloperLogo(true);
  setUploadErrorDeveloperLogo("");
  
  try {
    // Upload file to S3 in the 'properties/developer/' folder
    const fileUrl = await uploadFileToS3(file, 'properties/developer/');
    setForm((prev) => ({ ...prev, developerImage: fileUrl }));
  } catch (err) {
    console.error("Error uploading developer logo:", err);
    setUploadErrorDeveloperLogo("Upload failed. Try again.");
  }
  
  setUploadingDeveloperLogo(false);
};

// Brochure upload
const handleBrochureUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  setUploadingBrochure(true);
  setUploadErrorBrochure("");
  
  try {
    // Upload file to S3 in the 'properties/brochures/' folder
    const fileUrl = await uploadFileToS3(file, 'properties/brochures/');
    setForm((prev) => ({ ...prev, brochureFile: fileUrl }));
  } catch (err) {
    console.error("Error uploading brochure:", err);
    setUploadErrorBrochure("Upload failed. Try again.");
  }
  
  setUploadingBrochure(false);
};

// Location image upload
const handleLocationImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  setUploadingLocationImage(true);
  setUploadErrorLocationImage("");
  
  try {
    // Upload file to S3 in the 'properties/locations/' folder
    const fileUrl = await uploadFileToS3(file, 'properties/locations/');
    setForm((prev) => ({ ...prev, locationImage: fileUrl }));
  } catch (err) {
    console.error("Error uploading location image:", err);
    setUploadErrorLocationImage("Upload failed. Try again.");
  }
  
  setUploadingLocationImage(false);
};

// Exterior Gallery upload
const handleExteriorGalleryUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setUploadingExterior(true);
  setUploadErrorExterior("");

  try {
    // Upload multiple files to S3 in the 'properties/exterior/' folder
    const validUrls = await uploadMultipleFilesToS3(files, 'properties/exterior/');

    if (validUrls.length > 0) {
      setForm(prev => ({
        ...prev,
        exteriorGallery: prev.exteriorGallery ? [...prev.exteriorGallery, ...validUrls] : validUrls
      }));
    } else {
      setUploadErrorExterior("Failed to upload images. Please try again.");
    }
  } catch (error) {
    console.error("Error uploading exterior images:", error);
    setUploadErrorExterior("Failed to upload images. Please try again.");
  }

  setUploadingExterior(false);
};

const handleRemoveExteriorImage = (index) => {
  setForm(prev => ({
    ...prev,
    exteriorGallery: prev.exteriorGallery.filter((_, i) => i !== index)
  }));
};

// Interior Gallery upload
const handleInteriorGalleryUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  setUploadingInterior(true);
  setUploadErrorInterior("");

  try {
    // Upload multiple files to S3 in the 'properties/interior/' folder
    const validUrls = await uploadMultipleFilesToS3(files, 'properties/interior/');

    if (validUrls.length > 0) {
      setForm(prev => ({
        ...prev,
        interiorGallery: prev.interiorGallery ? [...prev.interiorGallery, ...validUrls] : validUrls
      }));
    } else {
      setUploadErrorInterior("Failed to upload images. Please try again.");
    }
  } catch (error) {
    console.error("Error uploading interior images:", error);
    setUploadErrorInterior("Failed to upload images. Please try again.");
  }

  setUploadingInterior(false);
};

const handleRemoveInteriorImage = (index) => {
  setForm(prev => ({
    ...prev,
    interiorGallery: prev.interiorGallery.filter((_, i) => i !== index)
  }));
};

  // Tag handling
  const handleAddTag = () => {
    if (tagInput.trim()) {
      setForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Features handling
  const handleAddCustomFeature = () => {
    if (customFeature.trim()) {
      setForm(prev => ({
        ...prev,
        features: [...prev.features, customFeature.trim()]
      }));
      setFeaturesList(prev => [...prev, customFeature.trim()]);
      setCustomFeature("");
      setShowCustomFeatureInput(false);
    }
  };

  // Amenities handling
  const handleAddCustomAmenity = () => {
    if (customAmenity.trim()) {
      setForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
      setAmenitiesList(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity("");
      setShowCustomAmenityInput(false);
    }
  };

  // Features/Amenities toggle
  const handleCheckbox = (name, value) => {
    setForm((prev) => {
      const arr = prev[name];
      return {
        ...prev,
        [name]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  // Form submission handler - Update to handle editing
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare form data based on property type
    let formData = { ...form, category: selectedCategory };

    // Common mappings
    if (formData.featuredImage) {
      formData.propertyFeaturedImage = formData.featuredImage;
    }

    if (selectedCategory === "Buy" || selectedCategory === "Rent" ||
      selectedCategory === "Commercial for Buy" || selectedCategory === "Commercial for Rent") {
      // For Buy/Rent properties
      formData = {
        ...formData,
        propertyFeaturedImage: formData.featuredImage || "",
        media: formData.media || [],
        features: formData.features || [],
        amenities: formData.amenities || [],
      };
    } else if (selectedCategory === "Off Plan") {
      // For Off Plan properties
      formData = {
        ...formData,
        propertyFeaturedImage: formData.featuredImage || formData.exteriorGallery?.[0] || "",
        media: [
          ...(formData.exteriorGallery || []),
          ...(formData.interiorGallery || [])
        ],
        features: formData.features || [],
        amenities: formData.amenities || [],
        // Ensure all required fields are present
        propertyType: formData.propertyType || "Apartment",
        propertySize: formData.propertySize || 0,
        propertyRooms: formData.propertyRooms || 0,
        propertyBedrooms: formData.propertyBedrooms || 0,
        propertyBathrooms: formData.propertyBathrooms || 0,
        propertyKitchen: formData.propertyKitchen || 0,
        // Ensure payment percentages are included as numbers
        duringConstructionPercentage: parseInt(formData.duringConstructionPercentage || 50, 10),
        onCompletionPercentage: parseInt(formData.onCompletionPercentage || 50, 10),
      };
    }

    // Validate all required fields based on database schema
    const requiredFields = [
      { field: 'propertyTitle', label: 'Property Title' },
      { field: 'propertyDescription', label: 'Property Description' },
      { field: 'propertyAddress', label: 'Property Address' },
      { field: 'propertyCountry', label: 'Country' },
      { field: 'propertyState', label: 'State' },
      { field: 'propertyZip', label: 'ZIP Code' },
      { field: 'propertyFeaturedImage', label: 'Featured Image' },
      { field: 'propertyType', label: 'Property Type' },
      { field: 'propertyPrice', label: 'Price' },
      { field: 'brokerFee', label: 'Broker Fee' },
      { field: 'propertySize', label: 'Property Size' },
      { field: 'propertyRooms', label: 'Rooms' },
      { field: 'propertyBedrooms', label: 'Bedrooms' },
      { field: 'propertyBathrooms', label: 'Bathrooms' },
      { field: 'propertyKitchen', label: 'Kitchen' },
      { field: 'dldPermitNumber', label: 'DLD Permit Number' },
      { field: 'agent', label: 'Agent' },
      { field: 'dldQrCode', label: 'DLD QR Code' },
      { field: 'latitude', label: 'Latitude' },
      { field: 'longitude', label: 'Longitude' }
    ];

    // Filter out required fields based on category
    if (selectedCategory === "Rent" || selectedCategory === "Commercial for Rent") {
      requiredFields.push({ field: 'numberOfCheques', label: 'Number of Cheques' });
    }

    // Check for empty required fields
    const missingFields = requiredFields.filter(item => {
      const value = formData[item.field];
      return value === undefined || value === null || value === '' || 
             (typeof value === 'number' && (isNaN(value) || value <= 0));
    });

    if (missingFields.length > 0) {
      const missingFieldsText = missingFields.map(item => item.label).join(', ');
      alert(`Please fill in all required fields: ${missingFieldsText}`);
      return;
    }

    // Call the onSubmit callback with the prepared form data
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {/* Tab Navigation */}
      <ul className="flex overflow-x-auto space-x-1 bg-gray-100 rounded-lg p-1">
        {TAB_LIST.map((tab, index) => (
          <li key={index} className="flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === index
                  ? "bg-white text-[#ff4d4f] shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <motion.div
        className="w-full"
        key={activeTab}
        variants={tabVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Buy and Rent Property Forms */}
        {(selectedCategory === "Buy" || selectedCategory === "Rent" || selectedCategory === "Commercial for Buy" || selectedCategory === "Commercial for Rent") && (
          <>
            {/* General Details Tab */}
            {activeTab === 0 && (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Fields */}
                <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Property Title</label>
                    <input
                      name="propertyTitle"
                      value={form.propertyTitle}
                      onChange={handleInput}
                      placeholder="Property Title"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Property Description</label>
                    <textarea
                      name="propertyDescription"
                      value={form.propertyDescription}
                      onChange={handleInput}
                      placeholder="Property Description"
                      rows={4}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-base font-medium mb-2">Property Address</label>
                      <input
                        name="propertyAddress"
                        value={form.propertyAddress}
                        onChange={handleInput}
                        placeholder="Property Address"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-medium mb-2">State</label>
                      <input
                        name="propertyState"
                        value={form.propertyState}
                        onChange={handleInput}
                        placeholder="State"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium mb-2">Country</label>
                      <input
                        name="propertyCountry"
                        value={form.propertyCountry}
                        onChange={handleInput}
                        placeholder="Country"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2">Zip Code</label>
                      <input
                        name="propertyZip"
                        value={form.propertyZip}
                        onChange={handleInput}
                        placeholder="Zip Code"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                    

                  </div>
                </div>
                {/* Right: Featured Image and Media */}
                <div className="w-full md:w-[350px] flex flex-col gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3]">
                    <div className="text-lg font-semibold mb-3">Featured Image</div>
                    {form.featuredImage ? (
                      <div className="relative rounded-xl overflow-hidden mb-4 group">
                        <img src={form.featuredImage} alt="Featured" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
                            onClick={() => document.getElementById('featured-image-input').click()}
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium hover:bg-red-200 transition"
                            onClick={handleRemoveImage}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition" onClick={() => document.getElementById('featured-image-input').click()}>
                        <span className="text-3xl text-gray-300 mb-2">+</span>
                        <span className="text-gray-400">Add Featured Image</span>
                      </label>
                    )}
                    <input
                      id="featured-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                    {uploadError && <div className="text-xs text-red-500 mt-2">{uploadError}</div>}
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3]">
                    <div className="text-lg font-semibold mb-3">Choose Media</div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-lg bg-[#ffeaea] text-[#ff4d4f] font-medium hover:bg-[#ffdada] transition"
                      onClick={() => document.getElementById('media-upload-input').click()}
                    >
                      + Add Images/Videos
                    </button>
                    <input
                      id="media-upload-input"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleMediaUpload}
                      disabled={uploading}
                    />
                    {form.media.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {form.media.map((url, index) => (
                          <div key={index} className="relative group">
                            <img src={url} alt={`Media ${index}`} className="h-20 w-full object-cover rounded-md" />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              onClick={() => handleRemoveMedia(index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Price Tab */}
            {activeTab === 1 && (
              <div className="bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-base font-medium mb-2">Property Type</label>
                    <select
                      name="propertyType"
                      value={form.propertyType}
                      onChange={handleInput}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition appearance-none"
                    >
                      {PROPERTY_TYPE_LIST.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">
                      {selectedCategory === "Rent" || selectedCategory === "Commercial for Rent"
                        ? "Property Price (Yearly)"
                        : "Property Price"}
                    </label>
                    <input
                      name="propertyPrice"
                      value={form.propertyPrice}
                      onChange={handleInput}
                      placeholder="Property Price"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Number of Cheques</label>
                    <input
                      name="numberOfCheques"
                      value={form.numberOfCheques}
                      onChange={handleInput}
                      placeholder="Number of Cheques"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium mb-2">Broker Fee</label>
                    <input
                      name="brokerFee"
                      value={form.brokerFee}
                      onChange={handleInput}
                      placeholder="Broker Fee"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  {(selectedCategory === "Rent" || selectedCategory === "Commercial for Rent") && (
                    <div>
                      <label className="block text-base font-medium mb-2">ROI Percentage</label>
                      <input
                        name="roiPercentage"
                        value={form.roiPercentage || ""}
                        onChange={handleInput}
                        placeholder="ROI %"
                        type="number"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {/* Specific Details Tab */}
        {activeTab === 2 && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-base font-medium mb-2">Property Size (sq ft)</label>
                  <input
                    name="propertySize"
                    value={form.propertySize}
                    onChange={handleInput}
                    placeholder="Property Size in ft"
                    type="number"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Total Rooms</label>
                  <input
                    name="propertyRooms"
                    value={form.propertyRooms}
                    onChange={handleInput}
                    placeholder="Total Rooms"
                    type="number"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Bedrooms</label>
                  <input
                    name="propertyBedrooms"
                    value={form.propertyBedrooms}
                    onChange={handleInput}
                    placeholder="Bedrooms"
                    type="number"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Kitchens</label>
                  <input
                    name="propertyKitchen"
                    value={form.propertyKitchen}
                    onChange={handleInput}
                    placeholder="Kitchens"
                    type="number"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Bathrooms</label>
                  <input
                    name="propertyBathrooms"
                    value={form.propertyBathrooms}
                    onChange={handleInput}
                    placeholder="Bathrooms"
                    type="number"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-base font-medium mb-2">Agent</label>
                  {isAgentPanel ? (
                    // When in agent panel, show a disabled field with the agent name
                    <div className="w-full rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] px-4 py-3 text-gray-700">
                      {agents.find(a => a._id === agentId)?.fullName || "Your Account"}
                      <input type="hidden" name="agent" value={form.agent} />
                    </div>
                  ) : (
                    // In admin panel, show the normal dropdown
                    <select
                      name="agent"
                      value={form.agent}
                      onChange={handleInput}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition appearance-none"
                    >
                      <option value="">Select an agent</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.fullName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

              </div>

            </div>
            {/* DLD QR Code */}
            <div className="w-full md:w-[350px] flex flex-col gap-6">
              <div>
                <label className="block text-base font-medium mb-2">DLD Permit Number</label>
                <input
                  name="dldPermitNumber"
                  value={form.dldPermitNumber}
                  onChange={handleInput}
                  placeholder="DLD Permit Number"
                  className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                />
              </div>
           
              <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3] flex flex-col items-center justify-center h-auto">

                <div className="text-lg font-semibold mb-3">DLD QR Code</div>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition">
                  {form.dldQrCode ? (
                    <img src={form.dldQrCode} alt="DLD QR Code" className="h-32 object-contain" />
                  ) : (
                    <>
                      <span className="text-3xl text-gray-300 mb-2">+</span>
                      <span className="text-gray-400">DLD QR Code</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                  />
                </label>
                {uploadingQr && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                {uploadErrorQr && <div className="text-xs text-red-500 mt-2">{uploadErrorQr}</div>}
              </div>
            </div>
          </div>
        )}
        {/* Map Tab */}
        {activeTab === 3 && (selectedCategory === "Buy" || selectedCategory === "Rent" || selectedCategory === "Commercial for Buy" || selectedCategory === "Commercial for Rent") && (
          <div className="bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-base font-medium mb-2">Latitude</label>
                    <input
                      name="latitude"
                      value={form.latitude}
                      onChange={handleInput}
                      placeholder="Latitude"
                      type="number"
                      step="0.000001"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Longitude</label>
                    <input
                      name="longitude"
                      value={form.longitude}
                      onChange={handleInput}
                      placeholder="Longitude"
                      type="number"
                      step="0.000001"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Zoom Level</label>
                    <select
                      name="zoomLevel"
                      value={form.zoomLevel}
                      onChange={handleInput}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition appearance-none"
                    >
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden border border-[#e5e7eb]">
                <MapPreview
                  key={`map-${activeTab}`}
                  latitude={form.latitude}
                  longitude={form.longitude}
                  zoomLevel={parseInt(form.zoomLevel)}
                  onMapClick={(lat, lng) => {
                    setForm(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Features & Amenities Tab */}
        {activeTab === 4 && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
              <div className="mb-6">
                <div className="text-lg font-semibold mb-3">Features</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuresList.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.features.includes(feature)}
                        onChange={() => handleCheckbox("features", feature)}
                        className="accent-[#ff4d4f] rounded"
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-lg bg-[#ffeaea] text-[#ff4d4f] font-medium hover:bg-[#ffdada] transition"
                  onClick={() => setShowCustomFeatureInput(prev => !prev)}
                >
                  + Add Custom Feature
                </button>

                {showCustomFeatureInput && (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      placeholder="Enter custom feature"
                      className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeature}
                      disabled={!customFeature.trim()}
                      className="px-4 py-2 rounded-lg bg-[#ff4d4f] text-white font-medium hover:bg-[#ff2d2f] transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
              <div className="mb-6">
                <div className="text-lg font-semibold mb-3">Amenities</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.amenities.includes(amenity)}
                        onChange={() => handleCheckbox("amenities", amenity)}
                        className="accent-[#ff4d4f] rounded"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-lg bg-[#ffeaea] text-[#ff4d4f] font-medium hover:bg-[#ffdada] transition"
                  onClick={() => setShowCustomAmenityInput(prev => !prev)}
                >
                  + Add Custom Amenity
                </button>

                {showCustomAmenityInput && (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      placeholder="Enter custom amenity"
                      className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      disabled={!customAmenity.trim()}
                      className="px-4 py-2 rounded-lg bg-[#ff4d4f] text-white font-medium hover:bg-[#ff2d2f] transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Off Plan Property Form */}
        {selectedCategory === "Off Plan" && (
          <>
            {/* Developer Info Tab */}
            {activeTab === 0 && (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Launch Type</label>
                    <select
                      name="launchType"
                      value={form.launchType}
                      onChange={handleInput}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition appearance-none"
                    >
                      <option value="New Launch">New Launch</option>
                      <option value="Pre-Launch">Pre-Launch</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Developer Name</label>
                    <input
                      name="developer"
                      value={form.developer}
                      onChange={handleInput}
                      placeholder="Developer Name"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                </div>
                {/* Developer Logo */}
                <div className="w-full md:w-[350px] flex flex-col gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3]">
                    <div className="text-lg font-semibold mb-3">Developer Logo</div>
                    {form.developerImage ? (
                      <div className="relative rounded-xl overflow-hidden mb-4">
                        <img src={form.developerImage} alt="Developer Logo" className="w-full h-48 object-contain bg-white" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
                            onClick={() => document.getElementById('developer-logo-input').click()}
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium hover:bg-red-200 transition"
                            onClick={handleRemoveDeveloperLogo}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition">
                        <span className="text-3xl text-gray-300 mb-2">+</span>
                        <span className="text-gray-400">Add Developer Logo</span>
                        <input
                          id="developer-logo-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDeveloperLogoUpload}
                          disabled={uploadingDeveloperLogo}
                        />
                      </label>
                    )}
                    {uploadingDeveloperLogo && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                    {uploadErrorDeveloperLogo && <div className="text-xs text-red-500 mt-2">{uploadErrorDeveloperLogo}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Property Details Tab */}
            {activeTab === 1 && (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Property Title</label>
                    <input
                      name="propertyTitle"
                      value={form.propertyTitle}
                      onChange={handleInput}
                      placeholder="Property Title"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Short Description</label>
                    <textarea
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={handleInput}
                      placeholder="Short Description"
                      rows={2}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition resize-none"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">About the Project</label>
                    <textarea
                      name="propertyDescription"
                      value={form.propertyDescription}
                      onChange={handleInput}
                      placeholder="Full project description"
                      rows={6}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition resize-none"
                    />
                  </div>
                </div>
                {/* Right Column with Featured Image only (removed DLD Permit and QR) */}
                <div className="w-full md:w-[350px] flex flex-col gap-6">
                  {/* Featured Image */}
                  <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3]">
                    <div className="text-lg font-semibold mb-3">Featured Image</div>
                    {form.featuredImage ? (
                      <div className="relative rounded-xl overflow-hidden mb-4 group">
                        <img src={form.featuredImage} alt="Featured" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition"
                            onClick={() => document.getElementById('featured-image-input').click()}
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium hover:bg-red-200 transition"
                            onClick={handleRemoveImage}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition" onClick={() => document.getElementById('featured-image-input').click()}>
                        <span className="text-3xl text-gray-300 mb-2">+</span>
                        <span className="text-gray-400">Add Featured Image</span>
                      </label>
                    )}
                    <input
                      id="featured-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                    {uploadError && <div className="text-xs text-red-500 mt-2">{uploadError}</div>}
                  </div>
                  {/* Removed DLD Permit and QR Code from here */}
                  {/* Brochure Section remains unchanged */}
                  <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3]">
                    <div className="text-lg font-semibold mb-3">Brochure</div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition">
                      {form.brochureFile ? (
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mb-2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          <span className="text-blue-500 font-medium text-sm">Brochure Uploaded</span>
                          <span className="text-xs text-gray-500">{form.brochureFile.split('/').pop()}</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-2xl text-gray-300 mb-1">+</span>
                          <span className="text-sm text-gray-400">Upload PDF Brochure</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleBrochureUpload}
                        disabled={uploadingBrochure}
                      />
                    </label>
                    {uploadingBrochure && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                    {uploadErrorBrochure && <div className="text-xs text-red-500 mt-2">{uploadErrorBrochure}</div>}
                    {form.brochureFile && (
                      <button
                        type="button"
                        onClick={handleRemoveBrochure}
                        className="mt-2 w-full px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition"
                      >
                        Remove Brochure
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pricing & Specifics Tab for Off Plan */}
            {activeTab === 2 && selectedCategory === "Off Plan" && (
              <div className="bg-white rounded-2xl p-8 shadow border mt-10 border-[#f3f3f3]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-base font-medium mb-2">Property type</label>
                    <input
                      name="propertyType"
                      value={form.propertyType}
                      onChange={handleInput}
                      placeholder="Property type"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Prices from</label>
                    <input
                      name="propertyPrice"
                      value={form.propertyPrice}
                      onChange={handleInput}
                      placeholder="Prices from"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Number of Checques</label>
                    <input
                      name="numberOfChecques"
                      value={form.numberOfChecques}
                      onChange={handleInput}
                      placeholder="Number of Checques"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Broker Fee</label>
                    <input
                      name="brokerFee"
                      value={form.brokerFee}
                      onChange={handleInput}
                      placeholder="Broker Fee"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium mb-2">During construction (%)</label>
                    <input
                      name="duringConstructionPercentage"
                      value={form.duringConstructionPercentage || ''}
                      onChange={handleInput}
                      placeholder="During construction (%)"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">On completion (%)</label>
                    <input
                      name="onCompletionPercentage"
                      value={form.onCompletionPercentage || ''}
                      onChange={handleInput}
                      placeholder="On completion (%)"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-base font-medium mb-2">Completion Date</label>
                  <input
                    name="completionDate"
                    value={form.completionDate}
                    onChange={handleInput}
                    type="date"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                  />
                </div>
              </div>
            )}

            {/* Location Tab for Off Plan */}
            {activeTab === 3 && selectedCategory === "Off Plan" && (
              <div className="flex flex-col gap-8">
                <div className="bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-base font-medium mb-2">Location</label>
                      <input
                        name="propertyAddress"
                        value={form.propertyAddress}
                        onChange={handleInput}
                        placeholder="Location"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2">Exact Location</label>
                      <input
                        name="exactLocation"
                        value={form.exactLocation}
                        onChange={handleInput}
                        placeholder="Exact Location"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-base font-medium mb-2">Country</label>
                      <select
                        name="propertyCountry"
                        value={form.propertyCountry}
                        onChange={handleInput}
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition appearance-none"
                      >
                        {COUNTRY_LIST.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2">State</label>
                      <input
                        name="propertyState"
                        value={form.propertyState}
                        onChange={handleInput}
                        placeholder="State"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2">ZIP Code</label>
                      <input
                        name="propertyZip"
                        value={form.propertyZip}
                        onChange={handleInput}
                        placeholder="ZIP Code"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Location Description</label>
                    <textarea
                      name="locationDescription"
                      value={form.locationDescription}
                      onChange={handleInput}
                      placeholder="Describe the location and surroundings"
                      rows={4}
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition resize-none"
                    />
                  </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-base font-medium mb-2">Latitude</label>
                          <input
                            name="latitude"
                            value={form.latitude}
                            onChange={handleInput}
                            placeholder="Latitude"
                            type="number"
                            step="0.000001"
                            className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium mb-2">Longitude</label>
                          <input
                            name="longitude"
                            value={form.longitude}
                            onChange={handleInput}
                            placeholder="Longitude"
                            type="number"
                            step="0.000001"
                            className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium mb-2">Zoom Level</label>
                          <select
                            name="zoomLevel"
                            value={form.zoomLevel}
                            onChange={handleInput}
                            className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition appearance-none"
                          >
                            {[...Array(20)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="h-[400px] rounded-lg overflow-hidden border border-[#e5e7eb]">
                      <MapPreview
                        key={`map-offplan-${activeTab}`}
                        latitude={form.latitude}
                        longitude={form.longitude}
                        zoomLevel={parseInt(form.zoomLevel)}
                        onMapClick={(lat, lng) => {
                          setForm(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery & Files Tab */}
            {activeTab === 4 && (
              <div className="flex flex-col md:flex-row mt-10 gap-8">
                <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-3">Exterior Gallery</div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {form.exteriorGallery && form.exteriorGallery.map((image, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden">
                          <img src={image} alt={`Exterior ${index + 1}`} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleRemoveExteriorImage(index)}
                              className="p-1 bg-red-500 rounded-full text-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-lg bg-[#ffeaea] text-[#ff4d4f] font-medium hover:bg-[#ffdada] transition"
                      onClick={() => document.getElementById('exterior-gallery-input').click()}
                    >
                      + Add Exterior Images
                    </button>
                    <input
                      id="exterior-gallery-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleExteriorGalleryUpload}
                      disabled={uploadingExterior}
                    />
                    {uploadingExterior && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                    {uploadErrorExterior && <div className="text-xs text-red-500 mt-2">{uploadErrorExterior}</div>}
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-2xl p-8 shadow border border-[#f3f3f3]">
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-3">Interior Gallery</div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {form.interiorGallery && form.interiorGallery.map((image, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden">
                          <img src={image} alt={`Interior ${index + 1}`} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleRemoveInteriorImage(index)}
                              className="p-1 bg-red-500 rounded-full text-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-2 rounded-lg bg-[#ffeaea] text-[#ff4d4f] font-medium hover:bg-[#ffdada] transition"
                      onClick={() => document.getElementById('interior-gallery-input').click()}
                    >
                      + Add Interior Images
                    </button>
                    <input
                      id="interior-gallery-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleInteriorGalleryUpload}
                      disabled={uploadingInterior}
                    />
                    {uploadingInterior && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
                    {uploadErrorInterior && <div className="text-xs text-red-500 mt-2">{uploadErrorInterior}</div>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Bottom navigation buttons */}
      <div className="flex justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          Cancel
        </motion.button>

        <div className="flex space-x-4">
          {activeTab > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab(activeTab - 1)}
              className="px-5 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </motion.button>
          )}

          {activeTab < TAB_LIST.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab(activeTab + 1)}
              className="px-5 py-2 rounded-lg bg-[#ff4d4f] text-white font-semibold hover:bg-[#ff2d2f] transition flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.button>
          )}

          {activeTab === TAB_LIST.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#ff4d4f] text-white font-semibold hover:bg-[#ff2d2f] transition"
            >
              {isEditing ? "Update Property" : "Submit Property"}
            </motion.button>
          )}
        </div>
      </div>
    </form>
  );
} 