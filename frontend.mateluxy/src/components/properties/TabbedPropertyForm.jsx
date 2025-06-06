import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion"; // Import framer-motion for animations
// Import agent API and developer service
import { agentApi } from "@/services/agentApi";
import { developerService } from "@/services/developerService";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import S3 upload utilities
import { uploadFileToS3, uploadMultipleFilesToS3 } from '../../utils/s3Upload.js';
import { X } from 'lucide-react';

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

// DragDropUpload component for reusable file upload with drag and drop
const DragDropUpload = ({ 
  id, 
  accept, 
  multiple = false, 
  onUpload, 
  disabled = false, 
  children,
  height = "h-48"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Create a new event with the files
      const event = { target: { files: multiple ? files : [files[0]] } };
      onUpload(event);
    }
  };

  return (
    <label 
      className={`flex flex-col items-center justify-center ${height} border-2 border-dashed rounded-xl cursor-pointer transition ${isDragging ? 'border-[#ff4d4f] bg-[#fff8f8]' : 'border-[#e5e7eb] hover:border-[#ff4d4f]'}`}
      onClick={() => document.getElementById(id).click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onUpload}
        disabled={disabled}
        multiple={multiple}
      />
    </label>
  );
};

// Move MapPreview component outside of the main component
const MapPreview = React.memo(({ latitude, longitude, zoomLevel, onMapClick }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Validate coordinates
  const validLatitude = typeof latitude === 'number' && !isNaN(latitude) ? latitude : DEFAULT_COORDINATES.latitude;
  const validLongitude = typeof longitude === 'number' && !isNaN(longitude) ? longitude : DEFAULT_COORDINATES.longitude;
  const validZoom = typeof zoomLevel === 'number' && !isNaN(zoomLevel) ? zoomLevel : DEFAULT_COORDINATES.zoom;

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      if (!mapContainer.current || !isMounted) return;

      try {
        // Load Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAb7m_WnewNIpg_xU2_5vhfZmCSD-Y9suU&callback=initMapCallback`;
        script.async = true;
        script.defer = true;

        // Define the callback function
        window.initMapCallback = () => {
          if (!mapContainer.current || !isMounted) return;

          // Create map instance
          const map = new google.maps.Map(mapContainer.current, {
            center: { lat: validLatitude, lng: validLongitude },
            zoom: validZoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });

          // Create marker
          const marker = new google.maps.Marker({
            position: { lat: validLatitude, lng: validLongitude },
            map: map,
            draggable: true,
          });

          // Store references
          mapRef.current = map;
          markerRef.current = marker;

          // Add click listener to map
          map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            
            // Update marker position
            marker.setPosition(e.latLng);
            
            // Call the callback with new coordinates
            if (onMapClick) {
              onMapClick(lat, lng);
            }
          });

          // Add drag listener to marker
          marker.addListener('dragend', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            
            // Call the callback with new coordinates
            if (onMapClick) {
              onMapClick(lat, lng);
            }
          });
        };

        // Add script to document
        document.head.appendChild(script);

        // Cleanup function
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
          delete window.initMapCallback;
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Initialize map
    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, [validLatitude, validLongitude, validZoom, onMapClick]);

  return (
    <div ref={mapContainer} className="w-full h-[400px] rounded-lg overflow-hidden" />
  );
});

export default function TabbedPropertyForm({ onSubmit, onCancel, selectedCategory, initialData = null, isEditing = false, onFormChange = null, isAgentPanel = false, agentId = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [showDeveloperDropdown, setShowDeveloperDropdown] = useState(false);
  const [searchAgentTerm, setSearchAgentTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const agentDropdownRef = useRef(null);

  // We'll define filteredDevelopers inside the component after form is initialized

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
        downPaymentPercentage: initialData.downPaymentPercentage || initialData.afterBookingPercentage || 20,
        duringConstructionPercentage: initialData.duringConstructionPercentage || 50,
        handoverPercentage: initialData.handoverPercentage || initialData.afterHandoverPercentage || 30,
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
      propertyCountry: "UAE", // Default to UAE
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
        downPaymentPercentage: 20,
        duringConstructionPercentage: 50,
        handoverPercentage: 30,
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

  // Add this computed value
  const filteredAgents = agents.filter(agent => 
    agent.fullName.toLowerCase().includes(searchAgentTerm.toLowerCase())
  );

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoadingAgents(true);
        const response = await agentApi.getAgents();
        
        // Check if response has data property and it's an array
        if (response && response.data && Array.isArray(response.data)) {
          console.log("Agents fetched successfully:", response.data);
          setAgents(response.data);
          
          // If in agent panel, set the agent ID from props
          if (isAgentPanel && agentId) {
            setForm(prev => ({ ...prev, agent: agentId }));
          }
        } else if (Array.isArray(response)) {
          // Handle case where response is directly an array
          console.log("Agents fetched successfully (direct array):", response);
          setAgents(response);
          
          if (isAgentPanel && agentId) {
            setForm(prev => ({ ...prev, agent: agentId }));
          }
        } else {
          console.error("Invalid agents data received:", response);
          setAgents([]);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        setAgents([]);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [isEditing, initialData, isAgentPanel, agentId]);

  // Fetch developers on component mount
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setIsLoadingDevelopers(true);
        const developersData = await developerService.getDevelopers();
        console.log('Fetched developers:', developersData);
        
        if (Array.isArray(developersData)) {
          setDevelopers(developersData);
        } else {
          console.error('Developers data is not an array:', developersData);
          setDevelopers([]);
        }
      } catch (error) {
        console.error('Error fetching developers:', error);
        setDevelopers([]);
      } finally {
        setIsLoadingDevelopers(false);
      }
    };

    fetchDevelopers();
  }, []);

  // Handle click outside to close developer dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeveloperDropdown) {
        // Check if the click is outside the dropdown area
        const dropdownElements = document.querySelectorAll('.developer-dropdown-area');
        let clickedInside = false;
        
        dropdownElements.forEach(element => {
          if (element.contains(event.target)) {
            clickedInside = true;
          }
        });
        
        if (!clickedInside) {
          setShowDeveloperDropdown(false);
        }
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeveloperDropdown]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    
    // Ensure propertyBedrooms is always treated as a string
    if (name === 'propertyBedrooms') {
      setForm((prev) => ({ ...prev, [name]: value.toString() }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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

// Drag and drop handlers for featured image
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
};

const handleDrop = (e, uploadHandler, inputId) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    // Create a new event with the files
    const event = { target: { files } };
    uploadHandler(event);
  }
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
  try {
    setUploadingDeveloperLogo(true);
    setUploadErrorDeveloperLogo("");
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = await uploadFileToS3(file, 'properties/developer/');
    setForm(prev => ({
      ...prev,
      developerImage: imageUrl
    }));
    if (onFormChange) onFormChange({ developerImage: imageUrl });
  } catch (error) {
    console.error("Error uploading developer logo:", error);
    setUploadErrorDeveloperLogo("Failed to upload developer logo");
  } finally {
    setUploadingDeveloperLogo(false);
  }
};

// Handle removing developer logo
const handleRemoveDeveloperLogo = () => {
  setForm(prev => ({
    ...prev,
    developerImage: ""
  }));
  if (onFormChange) onFormChange({ developerImage: "" });
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

// Handle removing brochure
const handleRemoveBrochure = () => {
  setForm(prev => ({
    ...prev,
    brochureFile: ""
  }));
  if (onFormChange) onFormChange({ brochureFile: "" });
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
        // All fields are optional, just provide empty defaults
        propertyType: formData.propertyType || "",
        propertySize: formData.propertySize || "",
        propertyRooms: formData.propertyRooms || "",
        propertyBedrooms: formData.propertyBedrooms || "",
        propertyBathrooms: formData.propertyBathrooms || "",
        propertyKitchen: formData.propertyKitchen || "",
        // Payment percentages as strings to allow empty values
        afterBookingPercentage: formData.afterBookingPercentage || "",
        duringConstructionPercentage: formData.duringConstructionPercentage || "",
        afterHandoverPercentage: formData.afterHandoverPercentage || "",
      };
    }

    // No required fields - all fields are optional
    const requiredFields = [];

    // Add additional required fields based on category if needed in the future
    // Currently all fields are optional
    if (selectedCategory === "Rent" || selectedCategory === "Commercial for Rent") {
      // We could add required fields here if needed
      // Example: requiredFields.push({ field: 'numberOfCheques', label: 'Number of Cheques' });
    }
    
    // No required fields for Off Plan properties either
    // All fields are optional
    if (selectedCategory === "Off Plan") {
      // No required fields
    }

    // No validation needed as all fields are optional
    // Proceed directly to form submission
    // Call the onSubmit callback with the prepared form data
    onSubmit(formData);
  };

  // Add click outside handler for agent dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(e.target)) {
        setShowAgentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  
                  {/* Agent field moved to Specific Details tab */}
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
                      <label 
                        className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition" 
                        onClick={() => document.getElementById('featured-image-input').click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const event = { target: { files: [files[0]] } };
                            handleImageUpload(event);
                          }
                        }}>
                      
                        <span className="text-3xl text-gray-300 mb-2">+</span>
                        <span className="text-gray-400">Add Featured Image</span>
                        <span className="text-xs text-gray-400 mt-2">Drag & drop or click to upload</span>
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
                    <div
                      className="w-full h-32 border-2 border-dashed border-[#e5e7eb] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4d4f] transition mb-3"
                      onClick={() => document.getElementById('media-upload-input').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const event = { target: { files } };
                          handleMediaUpload(event);
                        }
                      }}
                    >
                      <span className="text-2xl text-gray-300 mb-1">+</span>
                      <span className="text-gray-500 font-medium">Add Images/Videos</span>
                      <span className="text-xs text-gray-400 mt-1">Drag & drop or click to upload</span>
                    </div>
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
                {selectedCategory !== "Off Plan" && (
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
                )}
                {selectedCategory == "Off Plan" && (
                   <div>
                   <label className="block text-base font-medium mb-3">Bedrooms</label>
                   <input
                     name="propertyBedrooms"
                     value={form.propertyBedrooms}
                     onChange={handleInput}
                     placeholder="Enter bedroom options (e.g., Studio, 0-3, 2 & 3)"
                     className="w-full rounded-lg border border-[#e4e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                     type="text" // Explicitly set as text type to ensure it's treated as a string
                   />
                 </div>
                )}
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
                    // In admin panel, show searchable dropdown
                    <div className="relative" ref={agentDropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search agent..."
                          value={form.agent ? (agents.find(a => a._id === form.agent)?.fullName || searchAgentTerm) : searchAgentTerm}
                          onChange={(e) => {
                            setSearchAgentTerm(e.target.value);
                            if (!e.target.value) {
                              setForm(prev => ({ ...prev, agent: "" }));
                            }
                            setShowAgentDropdown(true);
                          }}
                          onFocus={() => setShowAgentDropdown(true)}
                          className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                        />
                        {form.agent && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm(prev => ({ ...prev, agent: "" }));
                              setSearchAgentTerm("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      {showAgentDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          {filteredAgents.slice(0, 5).map(agent => (
                            <div
                              key={agent._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm(prev => ({ ...prev, agent: agent._id }));
                                setSearchAgentTerm(agent.fullName);
                                setShowAgentDropdown(false);
                              }}
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${form.agent === agent._id ? 'bg-gray-100' : ''}`}
                            >
                              {agent.fullName}
                            </div>
                          ))}
                          {filteredAgents.length === 0 && (
                            <div className="px-4 py-2 text-gray-500">
                              No agents found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                <label 
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const event = { target: { files: [files[0]] } };
                      handleQrUpload(event);
                    }
                  }}
                >
                  {form.dldQrCode ? (
                    <img src={form.dldQrCode} alt="DLD QR Code" className="h-32 object-contain" />
                  ) : (
                    <>
                      <span className="text-3xl text-gray-300 mb-2">+</span>
                      <span className="text-gray-400">DLD QR Code</span>
                      <span className="text-xs text-gray-400 mt-2">Drag & drop or click to upload</span>
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
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          setForm(prev => ({
                            ...prev,
                            latitude: value
                          }));
                        }
                      }}
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
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          setForm(prev => ({
                            ...prev,
                            longitude: value
                          }));
                        }
                      }}
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
                  key={`map-${activeTab}-${form.latitude}-${form.longitude}`}
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
                    <div className="relative developer-dropdown-area">
                      <input
                        type="text"
                        name="developer"
                        value={form.developer || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Update the form state
                          setForm(prev => ({
                            ...prev,
                            developer: value
                          }));
                        }}
                        onFocus={() => setShowDeveloperDropdown(true)}
                        placeholder="Type or select a developer"
                        className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                      />
                      
                      {/* Developer dropdown */}
                      {showDeveloperDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                          {isLoadingDevelopers ? (
                            <div className="flex items-center justify-center p-4">
                              <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Loading developers...</span>
                            </div>
                          ) : (
                            <>
                              {developers.filter(dev => 
                                dev.name.toLowerCase().includes((form.developer || "").toLowerCase())
                              ).length > 0 ? (
                                developers.filter(dev => 
                                  dev.name.toLowerCase().includes((form.developer || "").toLowerCase())
                                ).map((developer, index) => (
                                  <div
                                    key={index}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                                    onClick={() => {
                                      setForm(prev => ({
                                        ...prev,
                                        developer: developer.name,
                                        developerImage: developer.logo
                                      }));
                                      setShowDeveloperDropdown(false);
                                    }}
                                  >
                                    <div className="flex items-center">
                                      {developer.logo && (
                                        <img src={developer.logo} alt={developer.name} className="h-6 w-6 mr-2 object-contain" />
                                      )}
                                      <span className="block truncate">{developer.name}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-2 px-3 text-gray-500 italic">
                                  No developers found. Type to add a new one.
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Type to search existing developers or enter a new one
                    </div>
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
                      <label 
                        className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const event = { target: { files: [files[0]] } };
                            handleDeveloperLogoUpload(event);
                          }
                        }}
                      >
                        <span className="text-3xl text-gray-300 mb-2">+</span>
                        <span className="text-gray-400">Add Developer Logo</span>
                        <span className="text-xs text-gray-400 mt-2">Drag & drop or click to upload</span>
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
                      <label 
                        className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition" 
                        onClick={() => document.getElementById('featured-image-input').click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const event = { target: { files: [files[0]] } };
                            handleImageUpload(event);
                          }
                        }}>
                      
                        <span className="text-3xl text-gray-300 mb-2">+</span>
                        <span className="text-gray-400">Add Featured Image</span>
                        <span className="text-xs text-gray-400 mt-2">Drag & drop or click to upload</span>
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
                 
                    {/* DLD QR Code display similar to PropertyDetailsCard */}
                   
                  {/* Brochure Section */}
                  <div className="bg-white rounded-2xl p-6 shadow border border-[#f3f3f3]">
                    <div className="text-lg font-semibold mb-3">Brochure</div>
                    <label 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e5e7eb] rounded-xl cursor-pointer hover:border-[#ff4d4f] transition"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const event = { target: { files: [files[0]] } };
                          handleBrochureUpload(event);
                        }
                      }}
                    >
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
                          <span className="text-xs text-gray-400 mt-1">Drag & drop or click to upload</span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-base font-medium mb-2">Down Payment (%)</label>
                    <input
                      name="downPaymentPercentage"
                      value={form.downPaymentPercentage || ''}
                      onChange={handleInput}
                      placeholder="Down Payment (%)"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                    <div className="text-xs text-gray-500 mt-1">Initial payment upon booking</div>
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">During Construction (%)</label>
                    <input
                      name="duringConstructionPercentage"
                      value={form.duringConstructionPercentage || ''}
                      onChange={handleInput}
                      placeholder="During construction (%)"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                    <div className="text-xs text-gray-500 mt-1">Payments during the construction phase</div>
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Post Handover (%)</label>
                    <input
                      name="handoverPercentage"
                      value={form.handoverPercentage || ''}
                      onChange={handleInput}
                      placeholder="Post Handover (%)"
                      type="number"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                    <div className="text-xs text-gray-500 mt-1">Payments after property handover</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-base font-medium mb-2">Completion Date</label>
                    <input
                      name="completionDate"
                      value={form.completionDate}
                      onChange={handleInput}
                      placeholder="Enter completion date (e.g., Q4 2025, December 2026)"
                      className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                    />
                  </div>
                 
                </div>
                
                {/* Agent Selection */}
                {selectedCategory !== "Off Plan" && (
                  <div className="mb-6">
                    <label className="block text-base font-medium mb-2">Agent</label>
                    {isAgentPanel ? (
                      // When in agent panel, show a disabled field with the agent name
                      <div className="w-full rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] px-4 py-3 text-gray-700">
                        {agents.find(a => a._id === agentId)?.fullName || "Your Account"}
                        <input type="hidden" name="agent" value={form.agent} />
                      </div>
                    ) : (
                      // In admin panel, show searchable dropdown
                      <div className="relative" ref={agentDropdownRef}>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search agent..."
                            value={form.agent ? (agents.find(a => a._id === form.agent)?.fullName || searchAgentTerm) : searchAgentTerm}
                            onChange={(e) => {
                              setSearchAgentTerm(e.target.value);
                              if (!e.target.value) {
                                setForm(prev => ({ ...prev, agent: "" }));
                              }
                              setShowAgentDropdown(true);
                            }}
                            onFocus={() => setShowAgentDropdown(true)}
                            className="w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d4f]/30 focus:border-[#ff4d4f] transition"
                          />
                          {form.agent && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm(prev => ({ ...prev, agent: "" }));
                                setSearchAgentTerm("");
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        
                        {showAgentDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                            {filteredAgents.slice(0, 5).map(agent => (
                              <div
                                key={agent._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm(prev => ({ ...prev, agent: agent._id }));
                                  setSearchAgentTerm(agent.fullName);
                                  setShowAgentDropdown(false);
                                }}
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${form.agent === agent._id ? 'bg-gray-100' : ''}`}
                              >
                                {agent.fullName}
                              </div>
                            ))}
                            {filteredAgents.length === 0 && (
                              <div className="px-4 py-2 text-gray-500">
                                No agents found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setForm(prev => ({
                                  ...prev,
                                  latitude: value
                                }));
                              }
                            }}
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
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setForm(prev => ({
                                  ...prev,
                                  longitude: value
                                }));
                              }
                            }}
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
                    <div
                      className="w-full h-32 border-2 border-dashed border-[#e5e7eb] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4d4f] transition mb-3"
                      onClick={() => document.getElementById('exterior-gallery-input').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const event = { target: { files } };
                          handleExteriorGalleryUpload(event);
                        }
                      }}
                    >
                      <span className="text-2xl text-gray-300 mb-1">+</span>
                      <span className="text-gray-500 font-medium">Add Exterior Images</span>
                      <span className="text-xs text-gray-400 mt-1">Drag & drop or click to upload</span>
                    </div>
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
                    <div
                      className="w-full h-32 border-2 border-dashed border-[#e5e7eb] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4d4f] transition mb-3"
                      onClick={() => document.getElementById('interior-gallery-input').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#ff4d4f]', 'bg-[#fff8f8]');
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const event = { target: { files } };
                          handleInteriorGalleryUpload(event);
                        }
                      }}
                    >
                      <span className="text-2xl text-gray-300 mb-1">+</span>
                      <span className="text-gray-500 font-medium">Add Interior Images</span>
                      <span className="text-xs text-gray-400 mt-1">Drag & drop or click to upload</span>
                    </div>
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
