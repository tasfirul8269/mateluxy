import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Send, User, Mail, Phone, MessageSquare, ArrowRight } from 'lucide-react';

const ContactForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch, trigger } = useForm({
    mode: 'onChange'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Watch contact method selections
  const watchPhone = watch("contactPhone", false);
  const watchWhatsApp = watch("contactWhatsApp", false);
  const watchEmail = watch("contactEmail", false);

  // Form steps
  const steps = [
    { title: 'Personal Details', fields: ['name', 'email', 'phone'] },
    { title: 'Your Requirements', fields: ['interest', 'message'] },
    { title: 'Contact Preferences', fields: ['contactPhone', 'contactWhatsApp', 'contactEmail'] }
  ];

  useEffect(() => {
    const allFields = steps.flatMap(step => step.fields);
    allFields.forEach(field => {
      if (!watch(field)) register(field);
    });
  }, [register, watch]);

  const handleNext = async () => {
    const currentFields = steps[activeStep].fields;
    const fieldsToValidate = currentFields.filter(field => watch(field) !== undefined || errors[field] !== undefined);
    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid && activeStep < steps.length - 1) setActiveStep(prev => prev + 1);
  };
  const handlePrevious = () => { if (activeStep > 0) setActiveStep(prev => prev - 1); };

  const onSubmit = async (data) => {
    if (activeStep < steps.length - 1) { handleNext(); return; }
    setIsSubmitting(true);
    try {
      // Create an array of preferred contact methods
      const preferredContactMethods = [];
      if (data.contactPhone) preferredContactMethods.push('phone');
      if (data.contactWhatsApp) preferredContactMethods.push('whatsapp');
      if (data.contactEmail) preferredContactMethods.push('email');
      
      // If no method selected, default to email
      if (preferredContactMethods.length === 0) {
        preferredContactMethods.push('email');
      }
      
      const contactData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.interest || 'General Inquiry',
        message: data.message,
        preferredContact: preferredContactMethods
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/contact/submit`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(contactData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormSuccess(true); 
        reset(); 
        setTimeout(() => { 
          setFormSuccess(false); 
          setActiveStep(0); 
        }, 5000);
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was a problem submitting your message. Please try again.');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const formFields = [
    { id: 'name', name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Enter your full name', validation: { required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } } },
    { id: 'email', name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'Enter your email address', validation: { required: 'Email address is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } } },
    { id: 'phone', name: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: 'Enter your phone number', validation: { pattern: { value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, message: 'Invalid phone number format' } } },
    { id: 'message', name: 'message', label: 'Message', type: 'textarea', icon: MessageSquare, placeholder: "Tell us what you're looking for or how we can help", validation: { required: 'Message is required' } }
  ];
  const contactMethods = [
    { id: 'contactPhone', name: 'contactPhone', label: 'Phone Call' },
    { id: 'contactWhatsApp', name: 'contactWhatsApp', label: 'WhatsApp' },
    { id: 'contactEmail', name: 'contactEmail', label: 'Email' }
  ];
  const interestOptions = [
    { value: 'buying', label: 'Buying Property' },
    { value: 'selling', label: 'Selling Property' },
    { value: 'renting', label: 'Renting' },
    { value: 'investment', label: 'Investment Opportunities' },
    { value: 'management', label: 'Property Management' },
    { value: 'general', label: 'General Inquiry' },
  ];

  const Stepper = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center">
          {activeStep > idx ? (
            <div className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-1 shadow bg-green-500 text-white">
              <CheckCircle className="h-7 w-7" />
            </div>
          ) : activeStep === idx ? (
            <div className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-1 shadow bg-[#FF2626] text-white shadow-lg">
              {idx + 1}
            </div>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-1 shadow bg-gray-100 text-gray-400">
              {idx + 1}
            </div>
          )}
          <div className={`text-xs font-semibold ${activeStep === idx ? 'text-[#FF2626]' : activeStep > idx ? 'text-green-500' : 'text-gray-400'}`}>{step.title}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full  mx-auto bg-white rounded-2xl overflow-hidden">
      <div className="px-8 pt-8 pb-0">
        {/* Header */}
      
        {/* Stepper */}
        <Stepper />
        <AnimatePresence mode="wait">
          {formSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-50 border border-green-100 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
              <p className="text-green-600 mb-6">Thank you for contacting us. We'll get back to you shortly.</p>
              <motion.button
                onClick={() => setFormSuccess(false)}
                className="px-6 py-2 bg-white border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Another Message
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${activeStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Details */}
                {activeStep === 0 && (
                  <div className="space-y-5">
                    {formFields.slice(0, 3).map((field, idx) => (
                      <div key={field.name} className="">
                        <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <field.icon className="h-5 w-5 text-gray-400" />
                          </span>
                          <input
                            type={field.type}
                            id={field.id}
                            className={`block w-full pl-12 pr-3 py-3 border ${errors[field.name] ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white shadow focus:ring-2 focus:ring-[#FF2626] focus:border-[#FF2626] text-gray-900 placeholder-gray-400 transition-all duration-200`}
                            placeholder={field.placeholder}
                            {...register(field.name, field.validation)}
                          />
                        </div>
                        {field.id === 'phone' && (
                          <div className="text-xs text-gray-400 mt-1 ml-1">Optional</div>
                        )}
                        {errors[field.name] && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs mt-1 flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors[field.name].message}</span>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Step 2: Requirements */}
                {activeStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="interest" className="block text-sm font-semibold text-gray-700 mb-1">What are you interested in?</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                        </span>
                        <select
                          id="interest"
                          className={`block w-full pl-12 pr-3 py-3 border ${errors.interest ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white shadow focus:ring-2 focus:ring-[#FF2626] focus:border-[#FF2626] text-gray-900 placeholder-gray-400 transition-all duration-200`}
                          {...register('interest', { required: 'Please select your interest' })}
                        >
                          <option value="">Select an option</option>
                          {interestOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      {errors.interest && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.interest.message}</span>
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Message <span className="text-[#FF2626]">*</span></label>
                      <div className="relative">
                        <span className="absolute top-3 left-0 flex items-center pl-4 pointer-events-none">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                        </span>
                        <textarea
                          id="message"
                          rows={4}
                          placeholder="Tell us about your requirements..."
                          className={`block w-full pl-12 pr-3 py-3 border ${errors.message ? 'border-red-400' : 'border-gray-200'} rounded-xl bg-white shadow focus:ring-2 focus:ring-[#FF2626] focus:border-[#FF2626] text-gray-900 placeholder-gray-400 transition-all duration-200 resize-none`}
                          {...register('message', { required: 'Please enter your message' })}
                        ></textarea>
                      </div>
                      {errors.message && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.message.message}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
                {/* Step 3: Contact Preferences */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">How would you like us to contact you?</label>
                      <div className="space-y-4 mt-3">
                        {/* Phone Call */}
                        <label className="flex items-center p-5 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md">
                          <input
                            type="checkbox"
                            id="contactPhone"
                            className="h-5 w-5 text-[#FF2626] border-gray-300 rounded focus:ring-[#FF2626] mr-4"
                            {...register('contactPhone', {
                              validate: () => watchPhone || watchWhatsApp || watchEmail || 'Please select at least one contact method'
                            })}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">Phone Call</div>
                            <div className="text-xs text-gray-400">We\'ll call you during business hours</div>
                          </div>
                        </label>
                        {/* WhatsApp */}
                        <label className="flex items-center p-5 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md">
                          <input
                            type="checkbox"
                            id="contactWhatsApp"
                            className="h-5 w-5 text-[#FF2626] border-gray-300 rounded focus:ring-[#FF2626] mr-4"
                            {...register('contactWhatsApp', {
                              validate: () => watchPhone || watchWhatsApp || watchEmail || 'Please select at least one contact method'
                            })}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">WhatsApp</div>
                            <div className="text-xs text-gray-400">Quick responses via WhatsApp</div>
                          </div>
                        </label>
                        {/* Email */}
                        <label className="flex items-center p-5 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md">
                          <input
                            type="checkbox"
                            id="contactEmail"
                            className="h-5 w-5 text-[#FF2626] border-gray-300 rounded focus:ring-[#FF2626] mr-4"
                            {...register('contactEmail', {
                              validate: () => watchPhone || watchWhatsApp || watchEmail || 'Please select at least one contact method'
                            })}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">Email</div>
                            <div className="text-xs text-gray-400">Detailed information via email</div>
                          </div>
                        </label>
                      </div>
                      {errors.contactPhone && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-2 ml-1"
                        >
                          Please select at <span className="font-semibold">least one contact method</span>
                        </motion.div>
                      )}
                    </div>
                    {/* Privacy Policy Checkbox */}
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="privacyPolicy"
                        className="h-5 w-5 text-[#FF2626] border-gray-300 rounded focus:ring-[#FF2626] mr-2"
                        required
                      />
                      <label htmlFor="privacyPolicy" className="text-sm text-gray-700 select-none">
                        I agree to the <a href="#" className="text-[#FF2626] font-semibold underline hover:text-red-700">Privacy Policy</a> and consent to being contacted regarding my inquiry.
                      </label>
                    </div>
                  </div>
                )}
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                  {activeStep > 0 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 bg-white shadow hover:bg-gray-50 font-semibold transition-all duration-200"
                      whileHover={{ x: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-xl bg-[#FF2626] text-white font-semibold shadow-lg hover:bg-[#e31b1b] flex items-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{activeStep < steps.length - 1 ? 'Continue' : 'Submit'}</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="px-8 pb-6 pt-2">
        <p className="text-xs text-gray-400 text-center">By submitting this form, you agree to our privacy policy and terms of service.</p>
      </div>
    </div>
  );
};

export default ContactForm; 