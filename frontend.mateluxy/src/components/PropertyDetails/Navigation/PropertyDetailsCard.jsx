import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, MapPin, Home, Calendar, DollarSign, User, CheckCircle, Shield, Phone, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { IoBedOutline } from "react-icons/io5";
import { LiaBathSolid } from "react-icons/lia";
import axios from 'axios';
import { formatPrice } from '../../../utils/formatPrice';

const PropertyDetailsCard = ({ property, agent: agentFromProps }) => {
  if (!property) return null;
  
  // Get property details with proper error handling
  const price = property?.propertyPrice ? formatPrice(property.propertyPrice) : 'Price on request';
  const size = property?.propertySize ? `${property.propertySize} sq. ft` : 'Not specified';
  const bedrooms = property?.propertyBedrooms || 'Not specified';
  const bathrooms = property?.propertyBathrooms?.toString() || 'Not specified';
  const propertyType = property?.propertyType || 'Not specified';
  const location = property?.propertyState || property?.propertyAddress || 'Not specified';
  const reference = property?.propertyReference || 'Not available';
  const listedDate = property?.createdAt ? new Date(property.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Not specified';
  
  // State for agent data
  const [agent, setAgent] = useState({
    name: 'No agent assigned',
    position: '',
    phone: '',
    whatsapp: '',
    email: '',
    image: ''
  });
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  
  // Use agent data from props if available, otherwise fetch it
  useEffect(() => {
    // If we already have agent data from props, use it
    if (agentFromProps) {
      console.log('Using agent data from props:', agentFromProps);
      setAgent({
        name: agentFromProps.fullName || 'No agent assigned',
        position: agentFromProps.position || '',
        phone: agentFromProps.contactNumber || '',
        whatsapp: agentFromProps.whatsapp || agentFromProps.contactNumber || '',
        email: agentFromProps.email || '',
        image: agentFromProps.profileImage || ''
      });
      setIsLoadingAgent(false);
      return;
    }
    
    // Otherwise, fetch agent data using property.agent
    const fetchAgentDetails = async () => {
      if (!property) return;
      
      setIsLoadingAgent(true);
      console.log('Property data for agent fetching:', property);
      
      // Check all possible ways the agent ID might be stored
      console.log('Agent field in property:', property.agent);
      
      // Try different possible agent ID fields
      let agentId = null;
      
      if (typeof property.agent === 'string') {
        // If agent is directly the ID string
        agentId = property.agent;
        console.log('Using agent ID from property.agent (string):', agentId);
      } else if (property.agent && property.agent._id) {
        // If agent is an object with _id
        agentId = property.agent._id;
        console.log('Using agent ID from property.agent._id:', agentId);
      } else if (property.agentId) {
        // If there's a specific agentId field
        agentId = property.agentId;
        console.log('Using agent ID from property.agentId:', agentId);
      }
      
      if (agentId) {
        try {
          console.log('Fetching agent with ID:', agentId);
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}`);
          
          if (response.data) {
            console.log('Agent data from API:', response.data);
            // Map the agent data fields correctly based on the API response
            setAgent({
              name: response.data.fullName || 'No agent assigned',
              position: response.data.position || '',
              phone: response.data.contactNumber || '',
              whatsapp: response.data.whatsapp || response.data.contactNumber || '',
              email: response.data.email || '',
              image: response.data.profileImage || ''
            });
          }
        } catch (error) {
          console.error('Error fetching agent details:', error);
          // Use default agent data if fetch fails
          setAgent({
            name: 'No agent assigned',
            position: '',
            phone: '',
            whatsapp: '',
            email: '',
            image: ''
          });
        } finally {
          setIsLoadingAgent(false);
        }
      } else {
        console.log('No agent ID found in property data');
        setAgent({
          name: 'No agent assigned',
          position: '',
          phone: '',
          whatsapp: '',
          email: '',
          image: ''
        });
        setIsLoadingAgent(false);
      }
    };
    
    fetchAgentDetails();
  }, [property, agentFromProps]);
  
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-0">Additional Details</h3>
        
      </div>
      
      <div className="p-6">
        {/* Additional Details */}

        
       
        {/* Agent Info */}
        <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-2xl border border-red-100 mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-red-500" />
            <span>Property Specialist</span>
          </h4>
          
          {isLoadingAgent ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading agent information...</span>
            </div>
          ) : agent.name === 'No agent assigned' ? (
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-500">No agent assigned</h5>
                <p className="text-sm text-gray-400">This property is currently not assigned to any agent</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-100">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400/red/white?text=Agent';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-800">{agent.name}</h5>
                    {agent.phone && (
                      <a 
                        href={`tel:${agent.phone}`}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <Phone size={16} />
                      </a>
                    )}
                  </div>
                  {agent.position && <p className="text-gray-500 text-sm">{agent.position}</p>}
                </div>
              </div>
              
              {/* Agent Contact Info */}
              {(agent.phone || agent.email) && (
                <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                  {agent.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-red-500" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-red-500" />
                      <span>{agent.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-4">

           {/* Divider */}
        <div className="my-6 border-t border-gray-100"></div>
        
          
          {/* Listed Date */}
          <div className="flex items-start gap-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <Calendar className="text-red-500" size={18} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Listed Date</h4>
              <p className="text-gray-800">{listedDate}</p>
            </div>
          </div>
        </div>
        
        {/* DLD Verification */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-800">DLD Verification</h5>
            <div className="bg-red-50 px-2 py-1 rounded text-xs text-red-600 font-medium">
              {property?.dldPermitNumber || 'Permit #12345678'}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-white p-3 rounded-lg border border-gray-200 w-32 h-32 flex items-center justify-center">
              {property?.dldQrCode ? (
                <img 
                  src={property.dldQrCode} 
                  alt="DLD QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  DLD QR Code
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-xs text-center mt-3">
            Scan QR code to verify property details with Dubai Land Department
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyDetailsCard;
