import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Phone, Mail, Check } from 'lucide-react';
import countryCodes from '../../../utils/countryCodes';

const ContactForm = ({ property }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    countryCode: '+971', // Default UAE code
    phone: '',
    privacyConsent: false,
    marketingConsent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const propertyInfo = {
        propertyId: property?._id || '',
        propertyTitle: property?.propertyTitle || property?.title || 'Off Plan Property'
      };
      
      const submissionData = {
        ...formState,
        propertyInfo
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await axios.post(`${apiUrl}/api/property-requests`, submissionData);
      
      if (response.data.success) {
        toast.success('Your property request has been submitted successfully!');
        setFormSubmitted(true);
        // Clear the form fields
        setFormState({
          name: '',
          email: '',
          countryCode: '+971',
          phone: '',
          privacyConsent: false,
          marketingConsent: false
        });
      } else {
        throw new Error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error submitting property request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[30px] border border-[#e6e6e6] p-6 mb-6 relative overflow-hidden">
      {/* Success overlay */}
      {formSubmitted && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-10 p-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Request Submitted!</h3>
          <p className="text-gray-600 text-center mb-6">
            Thank you for your interest in {property?.propertyTitle || 'this property'}. 
            Your inquiry has been sent to the agent managing this property, and they will contact you shortly.
          </p>
          <button 
            onClick={() => setFormSubmitted(false)}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {property ? `Request ${property.propertyTitle || property.title}` : 'Request Property Details'}
      </h2>
      
      <p className="text-gray-600 mb-6">
        {property ? 
          `Get more information about this ${property.propertyType || 'property'}` : 
          'We will call you back within an hour with more information'
        }
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formState.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[10px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formState.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-[10px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              name="countryCode"
              className="w-auto px-2 py-3 rounded-[10px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              value={formState.countryCode}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.dial_code}>
                  {country.flag} {country.dial_code}
                </option>
              ))}
            </select>
            
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formState.phone}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-[10px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="privacyConsent"
              id="privacyConsent"
              checked={formState.privacyConsent}
              onChange={handleChange}
              className="mt-1"
              required
              disabled={isSubmitting}
            />
            <label htmlFor="privacyConsent" className="text-sm text-gray-600">
              By accepting and providing my personal information I am consenting to MateLuxy <a href="#" className="text-red-500 hover:underline">Privacy Policy</a>, the applicable data protection laws and <a href="#" className="text-red-500 hover:underline">Terms of Use</a>.
            </label>
          </div>
          
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="marketingConsent"
              id="marketingConsent"
              checked={formState.marketingConsent}
              onChange={handleChange}
              className="mt-1"
              disabled={isSubmitting}
            />
            <label htmlFor="marketingConsent" className="text-sm text-gray-600">
              I agree to receive information about offers, deals and services from this website (optional).
            </label>
          </div>
          
          <button
            type="submit"
            className={`cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-[15px] transition-colors font-medium flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Request Property Details'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Call Us</p>
            <p className="text-sm font-medium text-gray-800">+971 50 123 4567</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email Us</p>
            <p className="text-sm font-medium text-gray-800">info@mateluxy.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;