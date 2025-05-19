import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactForm from './ContactForm';
import { Phone, Mail, Clock, MapPin, Instagram, Facebook, Linkedin, Twitter, ChevronRight, User, Building, MessageSquare, Send } from "lucide-react";

const Contact = () => {
  // Scroll to top on component mount with smooth scrolling
  useEffect(() => {
    // Add smooth scrolling behavior to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    window.scrollTo(0, 0);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Form state
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form steps
  const formSteps = [
    { title: 'Personal Details', description: 'Tell us about yourself' },
    { title: 'Your Requirements', description: 'What are you looking for?' },
    { title: 'Contact Preferences', description: 'How should we reach you?' }
  ];

  // Social media links
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/mateluxyrealestate", color: "#E1306C", name: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/MateLuxy", color: "#1877F2", name: "Facebook" },
    { icon: Linkedin, href: "https://ae.linkedin.com/company/mateluxy-real-estate", color: "#0A66C2", name: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/mateluxy", color: "#1DA1F2", name: "Twitter" }
  ];

  // Contact methods
  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      content: "04 572 5420",
      action: "tel:045725420",
      color: "#4CAF50"
    },
    {
      icon: Mail,
      title: "Email Us",
      content: "info@mateluxy.com",
      action: "mailto:info@mateluxy.com",
      color: "#2196F3"
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: "Mon-Fri: 9AM-6PM",
      subContent: "Sat: 9AM-2PM | Sun: Closed",
      color: "#FF9800"
    }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formStep < formSteps.length - 1) {
      setFormStep(prev => prev + 1);
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setFormSuccess(true);

    // Reset form after success
    setTimeout(() => {
      setFormSuccess(false);
      setFormStep(0);
      setFormData({});
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>

        {/* Mesh Gradient Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-purple-500/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-blue-500/20 blur-[100px] animate-pulse"></div>
          <div className="absolute top-[40%] right-[30%] w-[20vw] h-[20vw] rounded-full bg-red-500/20 blur-[80px] animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-['Montserrat']">
              <span className="text-white">Book a Free </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">Consultation</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            Let's schedule a time to talk. Whether it's a Zoom call or a coffee at our office — we'd love to meet you.

            </p>
            <motion.a
              href="#map"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Find us on Map
              <MapPin className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </div>

        {/* Curved Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
        
        </motion.div>

        {/* Main Content Grid - Top Section with Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Left Column: Title and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Montserrat']">
            Dubai's Leading  <span className="text-red-600">Property Experts </span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Our team of property consultants, marketing specialists, and customer service experts is here to guide you toward the best solutions.

            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Quick Response</p>
                  <p className="text-gray-500 text-sm">We typically respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <User className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Personal Attention</p>
                  <p className="text-gray-500 text-sm">Dedicated agent for your requirements</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
            id="contact-form"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-red-50 shadow-sm rounded-full">
                    <Mail className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-semibold font-['Montserrat']">Send a Message</h3>
                </div>
                
                {/* Original Contact Form */}
                <ContactForm />
                
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Contact Cards Horizontal Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Office Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group h-full"
          >
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-400"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold font-['Montserrat']">Visit Our Office</h3>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 p-4 rounded-2xl mb-4 border border-blue-100/50">
                <p className="text-gray-700 font-medium">Mateluxy Real Estate</p>
                <p className="text-gray-600">Bay Square - Office #601 - Building 13</p>
                <p className="text-gray-600">Business Bay - Dubai - UAE</p>
              </div>
              
              <div className="mb-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Working Hours</span>
                </p>
                <div className="grid grid-cols-2 gap-x-2 text-xs pl-4">
                  <div>
                    <p className="text-gray-600">Mon — Fri:</p>
                    <p className="text-gray-600">Saturday:</p>
                    <p className="text-gray-600">Sunday:</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">9:00 AM — 6:00 PM</p>
                    <p className="font-medium">9:00 AM — 2:00 PM</p>
                    <p className="font-medium">Closed</p>
                  </div>
                </div>
              </div>
              
              <motion.a 
                href="https://maps.google.com/?q=Bay+Square+Building+13+Business+Bay+Dubai+UAE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 py-3 rounded-xl text-white hover:shadow-lg transition-all duration-300 w-full font-medium mt-auto"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <MapPin className="h-4 w-4" />
                <span>Get Directions</span>
              </motion.a>
            </div>
          </motion.div>
          
          {/* Direct Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group h-full"
          >
            <div className="h-1.5 bg-gradient-to-r from-green-500 to-green-400"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Phone className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold font-['Montserrat']">Get in Touch Directly</h3>
              </div>
              
              <div className="space-y-3 mb-5">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${method.color}15` }}>
                        <method.icon className="h-5 w-5" style={{ color: method.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{method.content}</p>
                        {method.subContent && (
                          <p className="text-gray-600 text-xs">{method.subContent}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-auto">
                <motion.a 
                  href="tel:+971585590085"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 py-3 rounded-xl text-white hover:shadow-lg transition-all duration-300 font-medium"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </motion.a>
                <motion.a 
                  href="https://wa.me/+971585590085"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] py-3 rounded-xl text-white hover:shadow-lg transition-all duration-300 font-medium"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
          
          {/* Social Media Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group h-full"
          >
            <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-400"></div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-full shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Instagram className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold font-['Montserrat']">Connect With Us</h3>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">Follow us on social media to stay updated with the latest properties and real estate news.</p>
              
              <div className="grid grid-cols-2 gap-2 mb-5">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-md"
                    style={{ backgroundColor: `${social.color}15`, color: social.color }}
                    whileHover={{ y: -2, backgroundColor: `${social.color}25` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-1.5 bg-white rounded-full shadow-sm">
                      <social.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{social.name}</span>
                  </motion.a>
                ))}
              </div>
              
              <motion.a 
                href="https://www.instagram.com/mateluxyrealestate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 py-3 rounded-xl text-white hover:shadow-lg transition-all duration-300 w-full font-medium mt-auto"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Instagram className="h-4 w-4" />
                <span>Follow Us</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
        
   
        
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16 bg-white rounded-3xl shadow-xl overflow-hidden"
          id="map"
        >
          <div className="h-1.5 bg-gradient-to-r from-red-600 to-red-400"></div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-full shadow-sm">
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-2xl font-semibold font-['Montserrat']">Find Us</h3>
              </div>
              <motion.a
                href="https://maps.google.com/?q=Bay+Square+Building+13+Business+Bay+Dubai+UAE"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-full flex items-center gap-2 hover:bg-red-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Directions</span>
                <ChevronRight className="h-4 w-4" />
              </motion.a>
            </div>

            <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-lg relative">
              <iframe
                src="https://www.google.com/maps/embed/v1/place?q=MateLuxy&center=25.1862288,55.2811068&zoom=17&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mateluxy Office Location"
              ></iframe>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 mb-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-['Montserrat']">
            Ready to find your dream property in Dubai?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
            Our team of experts is ready to guide you through every step of your real estate journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              href="tel:+971585590085"
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-full shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="h-4 w-4" />
              <span>Call Us Now</span>
            </motion.a>
            <motion.a
              href="#contact-form"
              className="px-6 py-3 bg-white text-red-600 border border-red-200 font-medium rounded-full shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="h-4 w-4" />
              <span>Send a Message</span>
            </motion.a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;