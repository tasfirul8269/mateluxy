import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, ExternalLink, Building, Calendar, Clock, Instagram, Facebook, Linkedin, Twitter, Globe } from "lucide-react";

const OfficeInfo = () => {
  // Social media links
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/mateluxyrealestate", color: "#E1306C", name: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/MateLuxy", color: "#1877F2", name: "Facebook" },
    { icon: Linkedin, href: "https://ae.linkedin.com/company/mateluxy-real-estate", color: "#0A66C2", name: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/mateluxy", color: "#1DA1F2", name: "Twitter" }
  ];

  // Contact information
  const officeInfo = {
    address: {
      title: "Visit Our Office",
      icon: Building,
      content: "Mateluxy Real Estate\nBay Square - Office #601 - Building 13 - Business Bay - Dubai - United Arab Emirates"
    },
    hours: {
      title: "Working Hours",
      icon: Clock,
      content: [
        { day: "Monday to Saturday", hours: "9:00 AM – 6:00 PM" },
        { day: "Sunday", hours: "Closed" }
      ]
    },
    contact: {
      title: "Get in Touch Directly",
      icon: Phone,
      phone: "04 572 5420",
      email: "info@mateluxy.com",
      responseTime: "We typically respond within in only 30 minutes"
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Contact Us — Mateluxy
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Dubai's Leading Property Experts — Just a Message Away
        </motion.p>
        <motion.p 
          className="text-gray-600 mt-2 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our team of property consultants, marketing specialists, and customer service experts is here to guide you toward the best solutions.
        </motion.p>
      </div>

      {/* Office Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Visit Our Office */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <div className="h-2 bg-[#FF2626]"></div>
          <div className="p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Building className="h-6 w-6 text-[#FF2626]" />
            </div>
            
            <h3 className="text-lg font-semibold text-center mb-3">{officeInfo.address.title}</h3>
            
            <div className="text-gray-600 text-center text-sm space-y-1">
              {officeInfo.address.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100">
              <motion.a
                href="https://maps.google.com/?q=Bay+Square+Building+13+Business+Bay+Dubai+UAE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#FF2626] font-medium hover:text-[#FF4040] transition-colors"
                whileHover={{ x: 5 }}
              >
                <span>Get Directions</span>
                <MapPin className="h-4 w-4" />
              </motion.a>
            </div>
          </div>
        </motion.div>
        
        {/* Working Hours */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -5 }}
        >
          <div className="h-2 bg-[#FF2626]"></div>
          <div className="p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Clock className="h-6 w-6 text-[#FF2626]" />
            </div>
            
            <h3 className="text-lg font-semibold text-center mb-3">{officeInfo.hours.title}</h3>
            
            <div className="space-y-3">
              {officeInfo.hours.content.map((item, i) => (
                <div key={i} className="text-center">
                  <p className="font-medium text-gray-700">{item.day}</p>
                  <p className="text-gray-600 text-sm">{item.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Contact Info */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <div className="h-2 bg-[#FF2626]"></div>
          <div className="p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Phone className="h-6 w-6 text-[#FF2626]" />
            </div>
            
            <h3 className="text-lg font-semibold text-center mb-3">{officeInfo.contact.title}</h3>
            
            <div className="space-y-3">
              <div className="text-center">
                <p className="font-medium text-gray-700">Phone / WhatsApp:</p>
                <a 
                  href={`tel:${officeInfo.contact.phone}`} 
                  className="text-[#FF2626] hover:underline text-sm"
                >
                  {officeInfo.contact.phone}
                </a>
              </div>
              
              <div className="text-center">
                <p className="font-medium text-gray-700">Email Address:</p>
                <a 
                  href={`mailto:${officeInfo.contact.email}`} 
                  className="text-[#FF2626] hover:underline text-sm"
                >
                  {officeInfo.contact.email}
                </a>
              </div>
              
              <p className="text-gray-500 text-xs text-center mt-2">{officeInfo.contact.responseTime}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Consultation Banner */}
      <motion.div 
        className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white mb-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Book a Free Consultation</h3>
          <p className="mb-6 max-w-2xl">Let's schedule a time to talk. Whether it's a Zoom call or a coffee at our office — we'd love to meet you.</p>
          
          <motion.a 
            href="#contact-form"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Schedule Now
            <Calendar className="h-4 w-4" />
          </motion.a>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white rounded-xl shadow-md overflow-hidden mb-12"
      >
        <div className="h-2 bg-[#FF2626]"></div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Find Us on the Map</h3>
          
          <div className="w-full h-[400px] rounded-lg overflow-hidden relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.1785100219167!2d55.2835!3d25.1857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f682def25f457%3A0x3dd4c4097970e887!2sBay%20Square%20Building%2013!5e0!3m2!1sen!2sae!4v1651234567890!5m2!1sen!2sae" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mateluxy Office Location"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </motion.div>
      
      {/* Social Media Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-gray-50 rounded-xl p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-center mb-5">Connect With Us</h3>
        
        <div className="flex justify-center gap-6">
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2"
              whileHover={{ y: -5 }}
            >
              <div 
                className="p-3 rounded-full shadow-sm hover:shadow transition-shadow"
                style={{ backgroundColor: social.color, color: 'white' }}
              >
                <social.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">{social.name}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default OfficeInfo;