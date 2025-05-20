import React from 'react';
import Logo from './auth/Logo'; 
import SignInForm from './auth/SignInForm';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';

const SignIn = () => {
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Minimal background elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-50 -skew-x-12 transform origin-top-right z-0"></div>
      
      {/* Single accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
      
      {/* Main container */}
      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Logo />
          </motion.div>
        </div>
        
        {/* Form card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 relative border border-gray-100"
        >
          {/* Blue accent dot */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 rounded-full"></div>
          
          {/* Form */}
          <SignInForm />
        </motion.div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute -left-16 top-1/4 w-12 h-12 rounded-full border border-blue-200 opacity-60"></div>
        <div className="absolute right-12 bottom-12 w-6 h-6 rounded-full bg-blue-100 opacity-60"></div>
        <div className="absolute left-1/2 top-1/3 w-3 h-3 rounded-full bg-blue-400 opacity-40"></div>
      </div>
    </div>
  );
};

export default SignIn; 