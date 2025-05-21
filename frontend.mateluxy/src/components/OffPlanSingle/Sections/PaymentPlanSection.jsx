import React from 'react';
import { motion } from 'framer-motion';
import { FaPercentage } from 'react-icons/fa';
import { BiBuilding, BiCalendar, BiCreditCard, BiWallet } from 'react-icons/bi';
import { formatPrice } from '../../../utils/formatPrice';

const PaymentPlanSection = ({ property }) => {
  // Default values if not provided in the database
  const afterBooking = property.afterBookingPercentage || 20;
  const duringConstruction = property.duringConstructionPercentage || 50;
  const afterHandover = property.afterHandoverPercentage || 30;
  
  // Calculate actual payment amounts if property price is available
  const propertyPrice = property.propertyPrice || 0;
  const afterBookingAmount = (propertyPrice * afterBooking) / 100;
  const duringConstructionAmount = (propertyPrice * duringConstruction) / 100;
  const afterHandoverAmount = (propertyPrice * afterHandover) / 100;
  
  return (
    <motion.section 
      className="bg-white rounded-[30px] shadow-sm overflow-hidden mb-8 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
        <BiWallet className="text-[#FF2626] text-3xl" />
        <span>Payment Plan</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* After Booking */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#fff0f0] rounded-full">
              <BiCreditCard className="text-[#FF2626] text-lg" />
            </div>
            <h3 className="text-sm font-semibold">After Booking</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              {/* Circle background */}
              <div className="absolute inset-0 rounded-full bg-gray-100"></div>
              
              {/* Progress circle */}
              <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#FF2626"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - afterBooking / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
                  {afterBooking}<FaPercentage className="text-xl md:text-2xl text-[#FF2626]" />
                </span>
                <span className="text-xs md:text-sm text-gray-500 mt-1">of total price</span>
                {propertyPrice > 0 && (
                  <span className="text-xs text-[#FF2626] font-medium mt-1">{formatPrice(afterBookingAmount)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* During Construction */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#fff0f0] rounded-full">
              <BiBuilding className="text-[#FF2626] text-lg" />
            </div>
            <h3 className="text-sm font-semibold">During Construction</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              {/* Circle background */}
              <div className="absolute inset-0 rounded-full bg-gray-100"></div>
              
              {/* Progress circle */}
              <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#FF2626"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - duringConstruction / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
                  {duringConstruction}<FaPercentage className="text-xl md:text-2xl text-[#FF2626]" />
                </span>
                <span className="text-xs md:text-sm text-gray-500 mt-1">of total price</span>
                {propertyPrice > 0 && (
                  <span className="text-xs text-[#FF2626] font-medium mt-1">{formatPrice(duringConstructionAmount)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* After Handover */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#fff0f0] rounded-full">
              <BiCalendar className="text-[#FF2626] text-lg" />
            </div>
            <h3 className="text-sm font-semibold">After Handover</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              {/* Circle background */}
              <div className="absolute inset-0 rounded-full bg-gray-100"></div>
              
              {/* Progress circle */}
              <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#FF2626"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - afterHandover / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
                  {afterHandover}<FaPercentage className="text-xl md:text-2xl text-[#FF2626]" />
                </span>
                <span className="text-xs md:text-sm text-gray-500 mt-1">of total price</span>
                {propertyPrice > 0 && (
                  <span className="text-xs text-[#FF2626] font-medium mt-1">{formatPrice(afterHandoverAmount)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional payment plan details */}
      {property.paymentPlan && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold mb-3">Additional Payment Details</h3>
          <p className="text-gray-700 whitespace-pre-line">{property.paymentPlan}</p>
        </div>
      )}
    </motion.section>
  );
};

export default PaymentPlanSection;
