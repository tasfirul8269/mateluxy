import React, { useState, useEffect } from 'react';
import { Download, MapPin, Building2, Home } from 'lucide-react';
import { FaWhatsapp, FaRegBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [agent, setAgent] = useState({
    name: 'MateLuxy Agent',
    phone: '+971 50 123 4567',
    whatsapp: '+971 50 123 4567',
    email: 'agent@mateluxy.com'
  });
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);

  // Fetch agent data when component mounts
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!property || !property.agent) return;
      
      setIsLoadingAgent(true);
      try {
        // Determine agent ID from property
        let agentId;
        if (typeof property.agent === 'string') {
          agentId = property.agent;
        } else if (property.agent && property.agent._id) {
          agentId = property.agent._id;
        } else {
          console.log('No valid agent ID found');
          setIsLoadingAgent(false);
          return;
        }
        
        // Fetch agent data
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}`);
        if (response.data) {
          setAgent({
            name: response.data.fullName || 'MateLuxy Agent',
            phone: response.data.contactNumber || '+971 50 123 4567',
            whatsapp: response.data.whatsapp || response.data.contactNumber || '+971 50 123 4567',
            email: response.data.email || 'agent@mateluxy.com'
          });
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setIsLoadingAgent(false);
      }
    };
    
    fetchAgentData();
  }, [property]);

  const handleClick = (e) => {
    // Prevent click event from bubbling to parent div
    // when clicking on buttons
    if (e.target.closest('button')) {
      e.stopPropagation();
      return;
    }
    
    // Ensure we have a valid ID before opening the link
    const propertyId = property._id || property.id;
    if (propertyId) {
      // Open the off-plan-single page in a new tab
      const url = `/off-plan-single/${propertyId}`;
      window.open(url, '_blank');
    } else {
      console.error('No valid property ID found:', property);
    }
  }
  
  const handleWhatsAppClick = (e) => {
    e.stopPropagation(); // Prevent navigation to property details
    // Format WhatsApp number by removing non-numeric characters
    const whatsappNumber = agent.whatsapp.replace(/[^0-9]/g, '');
    // Open WhatsApp with pre-filled message
    window.open(
      `https://wa.me/${whatsappNumber}?text=Hi, I'm interested in the property: ${property.propertyTitle}`,
      '_blank'
    );
  }
  
  const handleDownloadBrochure = (e) => {
    e.stopPropagation(); // Prevent navigation to property details
    if (property.brochureFile) {
      // If brochure file exists, download it
      window.open(property.brochureFile, '_blank');
    } else {
      // If no brochure file, show alert
      alert('Brochure not available for this property. Please contact the agent for more information.');
    }
  }

  return (
    <div onClick={handleClick} className="group relative bg-white rounded-[16px] overflow-hidden border-0 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        {/* Main image with parallax effect */}
        <div className="overflow-hidden">
          <img 
            src={property.propertyFeaturedImage} 
            alt={property.propertyTitle}
            className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Launch type badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-[#FF2626] text-white text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-md">
            {property.launchType || 'New Launch'}
          </div>
        </div>
        
        {/* Tags */}
        <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
          {property.tags?.map((tag, index) => (
            <span 
              key={index}
              className="bg-white/90 backdrop-blur-sm text-xs px-3 py-1 rounded-md font-semibold text-gray-800 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Property title and price overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-black/0">
          <h3 className="text-white font-bold text-xl mb-1 line-clamp-1">
            {property?.propertyTitle}
          </h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-white/90">
              <MapPin size={14} />
              <p className="text-sm font-medium truncate max-w-[180px]">{property.propertyAddress}</p>
            </div>
            <div className="bg-white text-[#FF2626] font-bold px-3 py-1 rounded-md shadow-md text-sm">
              AED {property.propertyPrice?.toLocaleString() || property.propertyPrice}
            </div>
          </div>
        </div>

      </div>

      <div className="p-6 bg-white">
        {/* Property details section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#fff0f0] p-2 rounded-full flex items-center justify-center w-9 h-9">
            <FaRegBuilding className="text-[#FF2626] text-base" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">Developer</p>
            <p className="text-gray-800 font-semibold truncate">{property.developer}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#fff0f0] p-2 rounded-full flex items-center justify-center w-9 h-9">
            <Home className="text-[#FF2626] text-base" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">Property Type</p>
            <p className="text-gray-800 font-semibold truncate">{property.propertyType || 'Residential'}</p>
          </div>
        </div>
        
        {/* Property specs - area and completion date side by side */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Area (sq.ft)</p>
            <p className="text-gray-800 font-bold whitespace-nowrap">{property.propertySize}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Completion</p>
            <p className="text-gray-800 font-bold whitespace-nowrap">{property.completionDate?.split('-')[0] || '2025'}</p>
          </div>
        </div>

        {/* Action buttons with hover effects */}
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadBrochure}
            className="flex-1 flex justify-center items-center gap-2 text-white bg-[#FF2626] hover:bg-[#FF2626]/90 cursor-pointer py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-[#FF2626]/0 via-white/20 to-[#FF2626]/0"></span>
            <Download size={16} className="relative z-10" />
            <span className="font-semibold text-sm relative z-10">Brochure</span>
          </button>
          <button 
            onClick={handleWhatsAppClick}
            className="flex-1 cursor-pointer flex justify-center items-center gap-2 text-white bg-[#25D366] hover:bg-[#25D366]/90 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-[#25D366]/0 via-white/20 to-[#25D366]/0"></span>
            <FaWhatsapp className="text-lg relative z-10" />
            <span className="font-semibold  text-sm relative z-10">WhatsApp</span>
          </button>
        </div>
        
        {/* Subtle brand indicator */}
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-10 bg-[#FF2626]/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;