import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CircleDollarSign, Ruler, Bed, MapPin, Calendar, User, Phone, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { formatPrice } from '../../../utils/formatPrice';

const ProjectDetailsCard = ({ property, agent: agentFromProps, isLoadingAgent }) => {
  // Format completion date if available
  const formattedCompletionDate = property?.completionDate 
    ? (property.completionDate.includes('-') 
        ? new Date(property.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : property.completionDate) // If it's not a standard date format (e.g., "Q4 2025"), use as is
    : 'Not specified';
    
  // Dynamic details derived from property data with icons
  const details = [
    { 
      label: 'Starting Price', 
      value: property?.propertyPrice ? `AED ${(property.propertyPrice)}` : 'Price not specified',
      icon: <CircleDollarSign size={18} className="text-red-500" />
    },
    { 
      label: 'Area from', 
      value: property?.propertySize ? `${property.propertySize} sq. ft` : 'Size not specified',
      icon: <Ruler size={18} className="text-red-500" />
    },
    { 
      label: 'Bedrooms', 
      value: property?.propertyBedrooms || 'Not specified',
      icon: <Bed size={18} className="text-red-500" />
    },
    { 
      label: 'Location', 
      value: property?.propertyState || property?.propertyAddress || 'Location not specified',
      icon: <MapPin size={18} className="text-red-500" />
    },
    { 
      label: 'Completion Date', 
      value: formattedCompletionDate,
      icon: <Calendar size={18} className="text-red-500" />
    }
  ];

  return (
    <motion.div 
      className="bg-white rounded-[30px] border border-[#e6e6e6] p-6 mb-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Project details</h2>
      
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {detail.icon}
              <span className="text-gray-600">{detail.label}</span>
            </div>
            <span className="font-medium text-[14px] text-red-400">
              {detail.value}
            </span>
          </div>
        ))}
      </div>
      
      {property?.brochureFile && (
        <motion.a 
          href={property.brochureFile} 
          target="_blank" 
          rel="noopener noreferrer"
          className="cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-[15px] transition-colors font-medium mt-6 block text-center flex items-center justify-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Brochure
        </motion.a>
      )}
      
      {/* Payment Plan Button - If property has a payment plan */}
      {property?.paymentPlan && (
        <motion.button
          className="cursor-pointer w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-[15px] transition-colors font-medium mt-3 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          View Payment Plan
        </motion.button>
      )}
      
      {/* Agent Info */}
      <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-2xl border border-red-100 mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User size={18} className="text-red-500" />
          <span>Property Specialist</span>
        </h4>
        
        {console.log('Agent data in ProjectDetailsCard:', agentFromProps)}
        
        {isLoadingAgent ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading agent information...</span>
          </div>
        ) : agentFromProps && (typeof agentFromProps === 'object') ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-100">
                <img 
                  src={agentFromProps.profileImage || 'https://placehold.co/400x400/red/white?text=Agent'} 
                  alt={agentFromProps.fullName || 'Agent'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/400x400/red/white?text=Agent';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-gray-800">{agentFromProps.fullName}</h5>
                  <a 
                    href={`tel:${agentFromProps.contactNumber}`}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <Phone size={16} />
                  </a>
                </div>
                <p className="text-gray-500 text-sm">{agentFromProps.position}</p>
              </div>
            </div>
            
            {/* Agent Contact Info */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-red-500" />
                <span>{agentFromProps.contactNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-red-500" />
                <span>{agentFromProps.email}</span>
              </div>
            </div>
            
            {/* Agent Contact Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={`https://wa.me/${(agentFromProps.whatsapp || agentFromProps.contactNumber).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              >
                <MessageCircle size={18} />
                <span className="text-sm">WhatsApp</span>
              </a>
              <a 
                href={`mailto:${agentFromProps.email}`}
                className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                <Mail size={18} className="text-red-500" />
                <span className="text-sm">Email</span>
              </a>
            </div>
            
            {/* Agent Note */}
            <div className="text-center text-xs text-gray-500 italic">
              Contact this agent for more information about this property
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-500">No agent information available for this property.</p>
            <p className="text-sm text-gray-400 mt-2">Please contact MateLuxy directly for inquiries.</p>
          </div>
        )}
      </div>
      
      {/* DLD Verification */}
      {(property?.dldPermitNumber || property?.dldQrCode) && (
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
      )}
    </motion.div>
  );
};

export default ProjectDetailsCard;