import React from 'react';
import { motion } from 'framer-motion';
import { BiWallet } from 'react-icons/bi';
import { formatPrice } from '../../../utils/formatPrice';

const PaymentPlanSection = ({ property }) => {
  // Get payment plan percentages from property data with fallback to default values
  const downPayment = property.afterBookingPercentage || 20;
  const onConstruction = property.duringConstructionPercentage || 50;
  const onHandover = property.afterHandoverPercentage || 30;
  
  // Calculate actual payment amounts if property price is available
  const propertyPrice = property.propertyPrice || 0;
  const downPaymentAmount = propertyPrice ? (propertyPrice * downPayment) / 100 : 0;
  const onConstructionAmount = propertyPrice ? (propertyPrice * onConstruction) / 100 : 0;
  const onHandoverAmount = propertyPrice ? (propertyPrice * onHandover) / 100 : 0;
  
  // Calculate total percentage (should be 100%)
  const totalPercentage = downPayment + onConstruction + onHandover;
  
  return (
    <motion.section 
      className="bg-white rounded-[30px] shadow-sm overflow-hidden mb-8 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <BiWallet className="text-[#FF2626] text-3xl" />
          <span>Payment plan</span>
        </h2>
        
        {/* Request Consultation Button */}
        {/* <button 
          className="bg-[#FF2626] text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          onClick={() => window.location.href = '/contact'}
        >
          Request Consultation
        </button> */}
      </div>
      
      {/* Payment Plan Progress */}
      {/* <div className="mb-6">
        <div className="text-right text-sm text-gray-500 mb-1">
          {totalPercentage}/100
        </div>
      </div> */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Down Payment */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-[#FF2626] text-3xl font-bold mb-1">
            {downPayment}%
          </div>
          <div className="text-gray-700 font-medium">
            Down Payment
          </div>
        </div>
        
        {/* On Construction */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-[#FF2626] text-3xl font-bold mb-1">
            {onConstruction}%
          </div>
          <div className="text-gray-700 font-medium">
            On Construction
          </div>
        </div>
        
        {/* On Handover */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-[#FF2626] text-3xl font-bold mb-1">
            {onHandover}%
          </div>
          <div className="text-gray-700 font-medium">
            On Handover
          </div>
        </div>
      </div>
      
      {/* Additional payment plan details */}
      {property.paymentPlan && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-6">
          <h3 className="text-lg font-semibold mb-3">Additional Payment Details</h3>
          <p className="text-gray-700 whitespace-pre-line">{property.paymentPlan}</p>
        </div>
      )}
    </motion.section>
  );
};

export default PaymentPlanSection;
