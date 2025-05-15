import React, { useState } from "react";
import { FaArrowRight, FaHome, FaBuilding, FaClipboardCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const servicesData = [
  {
    id: 1,
    title: "Residential Sales and Leasing",
    description: "Find your dream home in Dubai with our expert residential sales and leasing services.",
    icon: <FaHome className="text-4xl text-red-600" />,
    backgroundImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    buttonText: "Explore Properties",
    link: "/properties",
    hasSearch: false,
    stats: [
      { value: "500+", label: "Properties" },
      { value: "98%", label: "Client Satisfaction" }
    ]
  },
  {
    id: 2,
    title: "Commercial Sales and Leasing",
    description: "Premium office spaces and retail locations for your business needs in Dubai.",
    icon: <FaBuilding className="text-4xl text-red-600" />,
    backgroundImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    buttonText: "View Commercial",
    link: "/properties",
    hasSearch: false,
    stats: [
      { value: "200+", label: "Office Spaces" },
      { value: "150+", label: "Retail Locations" }
    ]
  },
  {
    id: 3,
    title: "Property Management",
    description: "Full-service property management solutions for landlords and investors.",
    icon: <FaClipboardCheck className="text-4xl text-red-600" />,
    backgroundImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80",
    buttonText: "Our Services",
    link: "/our-team",
    hasSearch: false,
    stats: [
      { value: "300+", label: "Properties Managed" },
      { value: "24/7", label: "Support" }
    ]
  }
];

const Services = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="py-10 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Our Premium Services</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-3"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our comprehensive range of real estate services designed to meet all your property needs in Dubai.</p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {servicesData.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg h-full"
              variants={cardVariants}
              whileHover="hover"
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative h-48 overflow-hidden">
                <motion.img 
                  src={service.backgroundImage} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: hoveredCard === service.id ? 1.1 : 1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{service.title}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2">{service.icon}</div>
                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                
                <div className="flex justify-between mb-4">
                  {service.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className="text-xl font-bold text-red-600">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                <motion.a
                  href={service.link}
                  className="inline-flex items-center justify-center w-full py-4 px-4 rounded-[15px] text-[#FF2626] bg-[#FFF0F0] hover:text-white text-sm font-medium transition-colors hover:bg-red-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {service.buttonText}
                  <FaArrowRight className="ml-2 text-xs" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;