import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Ruler, Bed, MapPin, Calendar } from 'lucide-react';

const ProjectDetailsCard = ({ property }) => {
  // Format completion date if available
  const formattedCompletionDate = property?.completionDate 
    ? new Date(property.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified';
    
  // Dynamic details derived from property data with icons
  const details = [
    { 
      label: 'Starting Price', 
      value: property?.propertyPrice ? `AED ${property.propertyPrice.toLocaleString()}` : 'Price not specified',
      icon: <DollarSign size={18} className="text-red-500" />
    },
    { 
      label: 'Area from', 
      value: property?.propertySize ? `${property.propertySize} sq. ft` : 'Size not specified',
      icon: <Ruler size={18} className="text-red-500" />
    },
    { 
      label: 'Number of Bedrooms', 
      value: property?.propertyBedrooms ?? 'Not specified',
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
    </motion.div>
  );
};

export default ProjectDetailsCard;