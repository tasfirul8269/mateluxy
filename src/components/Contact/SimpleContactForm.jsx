import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';

const SimpleContactForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    preferredContact: 'email'
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Handle input changes
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
    setFormError(null);
    
    try {
      console.log('Submitting form data:', formData);
      
      // Get the API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('Using API URL:', apiUrl);
      
      // Send data to API
      const response = await fetch(`${apiUrl}/api/messages/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      
      // Parse response
      const result = await response.json();
      console.log('Response data:', result);
      
      // Handle error responses
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit the form');
      }
      
      // Handle success
      setFormSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setFormSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
          preferredContact: 'email'
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6" id="contact-form">
      {formSuccess ? (
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            Your message has been sent successfully. We'll get back to you soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
          
          {/* Error display */}
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Your email address"
                  required
                />
              </div>
            </div>
            
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Your phone number"
                />
              </div>
            </div>
            
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Property Question">Property Question</option>
                <option value="Viewing Request">Viewing Request</option>
                <option value="Pricing Information">Pricing Information</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>
            </div>
            
            {/* Preferred Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="email"
                    checked={formData.preferredContact === 'email'}
                    onChange={handleChange}
                    className="form-radio text-red-600"
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="phone"
                    checked={formData.preferredContact === 'phone'}
                    onChange={handleChange}
                    className="form-radio text-red-600"
                  />
                  <span className="ml-2">Phone</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value="whatsapp"
                    checked={formData.preferredContact === 'whatsapp'}
                    onChange={handleChange}
                    className="form-radio text-red-600"
                  />
                  <span className="ml-2">WhatsApp</span>
                </label>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg shadow-md hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 mt-4`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            By submitting this form, you agree to our privacy policy and terms of service.
          </p>
        </form>
      )}
    </div>
  );
};

export default SimpleContactForm; 