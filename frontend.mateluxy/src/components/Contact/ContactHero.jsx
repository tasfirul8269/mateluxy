import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Phone, MapPin, ChevronDown } from "lucide-react";

const ContactHero = () => {
  const canvasRef = useRef(null);
  
  // Mesh gradient animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = 600;
    
    // Create gradient circles
    const circles = [
      { x: width * 0.2, y: height * 0.3, radius: 300, color: 'rgba(255, 38, 38, 0.15)' },
      { x: width * 0.8, y: height * 0.5, radius: 250, color: 'rgba(255, 38, 38, 0.1)' },
      { x: width * 0.5, y: height * 0.7, radius: 200, color: 'rgba(255, 38, 38, 0.08)' },
      { x: width * 0.3, y: height * 0.8, radius: 180, color: 'rgba(0, 0, 0, 0.03)' },
      { x: width * 0.7, y: height * 0.2, radius: 220, color: 'rgba(0, 0, 0, 0.05)' }
    ];
    
    // Animation loop
    let animationFrame;
    let time = 0;
    
    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);
      
      // Draw gradient circles with movement
      circles.forEach((circle, i) => {
        const x = circle.x + Math.sin(time + i) * 30;
        const y = circle.y + Math.cos(time + i * 0.5) * 30;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, circle.radius);
        gradient.addColorStop(0, circle.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, circle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Add noise texture
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(250, 250, 250, 0.02)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalCompositeOperation = 'source-over';
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Contact methods
  const contactMethods = [
    {
      icon: MessageSquare,
      title: "Send a Message",
      description: "Fill out our contact form",
      color: "#FF2626",
      bgColor: "#FFF5F5"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "+971 58 559 0085",
      color: "#0070F3",
      bgColor: "#F0F7FF"
    },
    {
      icon: MapPin,
      title: "Visit Our Office",
      description: "Business Bay, Dubai",
      color: "#0CAA41",
      bgColor: "#F0FFF4"
    }
  ];

  return (
    <div className="relative overflow-hidden h-[600px] flex items-center">
      {/* Mesh Gradient Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0"
      />
      
      {/* Glass Morphism Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10 backdrop-blur-3xl -z-0 hidden lg:block"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/10 backdrop-blur-3xl -z-0 hidden lg:block"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 backdrop-blur-lg -z-0 hidden lg:block"></div>
      
      <div className="max-w-6xl mx-auto px-4 text-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-4 px-5 py-2 bg-white/20 backdrop-blur-lg text-[#FF2626] rounded-full font-medium text-sm border border-white/30 shadow-lg"
        >
          Contact Us
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#111] mb-6 font-['Montserrat'] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF2626] to-[#FF6B6B]">Let's Start</span> a Conversation
        </motion.h1>
        
        <motion.div 
          className="w-32 h-1.5 bg-gradient-to-r from-[#FF2626] to-[#FF6B6B] mx-auto mb-8 rounded-full shadow-sm"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        ></motion.div>
        
        <motion.p 
          className="text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Whether you're looking to buy, sell, rent, or invest in Dubai's premium real estate market, our team of experts is ready to assist you every step of the way.
        </motion.p>
        
        {/* Modern Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
              className="backdrop-blur-lg bg-white/20 rounded-2xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 text-center group hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
            >
              <div 
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: method.color }}
              >
                <method.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-['Montserrat'] text-gray-800">{method.title}</h3>
              <p className="text-gray-600 mb-5">{method.description}</p>
              <motion.a 
                href="#contact-form"
                className="inline-flex items-center justify-center w-full py-3 px-6 rounded-lg text-white font-medium gap-2 transition-colors"
                style={{ backgroundColor: method.color }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </motion.a>
            </motion.div>
          ))}
        </div>
        
        {/* Scroll Down Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <a href="#contact-form" className="flex flex-col items-center text-gray-600 hover:text-[#FF2626] transition-colors">
            <span className="text-sm font-medium mb-2">Scroll Down</span>
            <ChevronDown className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactHero;