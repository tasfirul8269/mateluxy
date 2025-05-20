import React from 'react';
import { motion } from 'framer-motion';
import { FaPercentage, FaRegBuilding, FaCalendarAlt } from 'react-icons/fa';
import { LuPiggyBank } from "react-icons/lu";

const PaymentPlanSection = ({ property }) => {
  // Default values if not provided in the database
  const duringConstruction = property.duringConstructionPercentage || 50;
  const onCompletion = property.onCompletionPercentage || 50;
  
  return (
    <motion.section 
      className="bg-white rounded-[30px] shadow-sm overflow-hidden mb-8 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
        <LuPiggyBank className="text-[#FF2626]" />
        <span>Payment Plan</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* During Construction */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#fff0f0] rounded-full">
              <FaRegBuilding className="text-[#FF2626] text-xl" />
            </div>
            <h3 className="text-xl font-semibold">During Construction</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              {/* Circle background */}
              <div className="absolute inset-0 rounded-full bg-gray-100"></div>
              
              {/* Progress circle */}
              <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160">
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
                <span className="text-4xl font-bold text-gray-800 flex items-center">
                  {duringConstruction}<FaPercentage className="text-2xl text-[#FF2626]" />
                </span>
                <span className="text-sm text-gray-500 mt-1">of total price</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* On Completion */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#fff0f0] rounded-full">
              <FaCalendarAlt className="text-[#FF2626] text-xl" />
            </div>
            <h3 className="text-xl font-semibold">On Completion</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              {/* Circle background */}
              <div className="absolute inset-0 rounded-full bg-gray-100"></div>
              
              {/* Progress circle */}
              <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160">
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
                  strokeDashoffset={2 * Math.PI * 70 * (1 - onCompletion / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-800 flex items-center">
                  {onCompletion}<FaPercentage className="text-2xl text-[#FF2626]" />
                </span>
                <span className="text-sm text-gray-500 mt-1">of total price</span>
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
