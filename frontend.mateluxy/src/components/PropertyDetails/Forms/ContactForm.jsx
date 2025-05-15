import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, Send, User, MessageSquare, ArrowRight } from 'lucide-react';
import { IoCallOutline } from "react-icons/io5";
import { FaEnvelope, FaRegCalendarAlt, FaWhatsapp } from "react-icons/fa";

const ContactForm = ({ property }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    date: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        date: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-6 relative overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-400"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Let's connect</h3>
          <p className="text-gray-500">Speak with our property specialist about this exclusive listing</p>
        </div>
      </div>
      
      <div className="p-6 pt-0">
        
        {/* Contact Form */}
        <form id="booking-form" onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-3xl">
          <h4 className="text-lg font-medium text-gray-800 mb-6">Schedule a viewing</h4>
          
          {/* Success Message */}
          {submitSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-white rounded-2xl text-green-600 flex items-center gap-3 shadow-sm"
            >
              <div className="bg-green-50 p-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Request sent successfully! We'll contact you soon.</span>
            </motion.div>
          )}
          
          {/* Error Message */}
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-white rounded-2xl text-red-600 flex items-center gap-3 shadow-sm"
            >
              <div className="bg-red-50 p-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{submitError}</span>
            </motion.div>
          )}
          
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Name */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-4 pr-3 py-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
                  placeholder="Your name"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-4 pr-3 py-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            {/* Phone */}
            <div>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="block w-full pl-4 pr-3 py-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            {/* Date */}
            <div>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full pl-4 pr-3 py-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="mb-6">
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                required
                className="block w-full pl-4 pr-3 py-4 bg-white border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
                placeholder="I'm interested in this property and would like to schedule a viewing..."
              ></textarea>
            </div>
          </div>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending request...</span>
              </>
            ) : (
              <>
                <span>Request Viewing</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
          
          <p className="text-xs text-gray-400 mt-4 text-center">
            By submitting this form, you agree to our privacy policy and terms of service.
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default ContactForm;
