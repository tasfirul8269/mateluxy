import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaArrowRight, FaUserTie, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { agentApi } from "../../services/agentApi";

const FindConsultant = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAgents, setTotalAgents] = useState(0);
  
  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const data = await agentApi.getAgents();
        
        // Format agent data
        const formattedAgents = data.slice(0, 4).map(agent => ({
          id: agent._id,
          name: agent.fullName,
          whatsapp: agent.whatsapp || "+971501234567",
          img: agent.profileImage || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 10)}.jpg`,
          specialty: agent.position || "Real Estate Agent",
          experience: agent.department || "Experienced Agent"
        }));
        
        setAgents(formattedAgents);
        setTotalAgents(data.length);
        setError(null);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError("Failed to load agents");
        
        // Fallback to dummy data if API fails
        setAgents([
          {
            name: "James Wilson",
            whatsapp: "+971501234567",
            img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
            specialty: "Luxury Homes",
            experience: "8 years"
          },
          {
            name: "Sarah Johnson",
            whatsapp: "+971501234567",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
            specialty: "Commercial Properties",
            experience: "6 years"
          },
          {
            name: "Michael Chen",
            whatsapp: "+971501234567",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
            specialty: "Investment Properties",
            experience: "10 years"
          },
          {
            name: "Emily Rodriguez",
            whatsapp: "+971501234567",
            img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
            specialty: "First-Time Buyers",
            experience: "5 years"
          }
        ]);
        setTotalAgents(50);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, []);

  return (
    <motion.div 
      className="mx-auto my-12 p-6 md:p-8 container rounded-[30px] relative  bg-gray-900 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Accent color strip */}
      <div className="absolute top-0 left-0 w-full overflow-hidden rounded-[30px] h-0 bg-gradient-to-r from-red-600 to-red-500"></div>
      
      {/* Background pattern */}
      <div className="absolute top-0 rounded-[30px] overflow-hidden left-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-red-500 opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-red-500 opacity-5 blur-3xl"></div>
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fff" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
        {/* Agent Images with hover effect */}
        <div className="relative order-2 md:order-1 flex-shrink-0">
          {loading ? (
            <div className="flex items-center justify-center h-40 w-40">
              <FaSpinner className="animate-spin text-red-500 text-2xl" />
            </div>
          ) : error ? (
            <div className="text-gray-600 text-center">
              <p>Unable to load agents</p>
            </div>
          ) : (
            <div className="flex items-center">
              {agents.map((agent, index) => (
                <motion.div 
                  key={agent.name}
                  className="relative"
                  style={{ marginLeft: index > 0 ? '-1rem' : 0, zIndex: 10 - index }}
                  whileHover={{ y: -5 }}
                  onMouseEnter={() => setActiveAgent(agent)}
                  onMouseLeave={() => setActiveAgent(null)}
                >
                  <img 
                    src={agent.img} 
                    alt={agent.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700 shadow-md"
                  />
                  <AnimatePresence>
                    {activeAgent === agent && (
                      <motion.div 
                        className="absolute -top-24 left-5 bg-gray-800 rounded-lg shadow-lg p-3 w-48 z-20 border border-gray-700"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={agent.img} 
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-700" 
                            alt={agent.name} 
                          />
                          <div>
                            <h4 className="font-semibold text-white">{agent.name}</h4>
                            <p className="text-xs text-gray-400">{agent.specialty}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                          <span className="text-xs text-gray-400">{agent.experience}</span>
                          <a 
                            href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-400 text-sm flex items-center gap-1 hover:text-green-300"
                          >
                            <FaWhatsapp />
                            <span>Chat</span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              <motion.div 
                className="w-14 h-14 rounded-full bg-red-600/20 -ml-4 flex items-center justify-center text-red-400 border-2 border-gray-800 shadow-md backdrop-blur-sm"
                whileHover={{ scale: 1.15 }}
              >
                <span className="text-sm font-medium">+{Math.max(0, totalAgents - 4)}</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Title and Description */}
        <div className="text-center md:text-left order-1 md:order-2 flex-1">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Find Your Perfect Consultant
          </motion.h2>
          <motion.p 
            className="text-base text-gray-300 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Connect with our team of <span className="text-red-400 font-medium">{totalAgents}+</span> property experts to get personalized guidance for your real estate journey.
          </motion.p>
        </div>

        {/* Search Button with animation */}
        <motion.a 
          href="/our-team"
          className="order-3 relative overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            className="px-6 py-3 rounded-[15px] bg-red-600 flex items-center gap-3 shadow-md text-white border border-red-500/30"
            animate={{ 
              paddingRight: isHovered ? "5rem" : "1.5rem"
            }}
            transition={{ duration: 0.3 }}
          >
            <FaUserTie className="text-white text-lg" />
            <span className="font-medium">Find Consultant</span>
            <motion.div 
              className="absolute right-0 top-0 h-full w-12 bg-red-700 rounded-r-md flex items-center justify-center"
              initial={{ x: 100 }}
              animate={{ x: isHovered ? 0 : 100 }}
              transition={{ duration: 0.3 }}
            >
              <FaArrowRight className="text-white" />
            </motion.div>
          </motion.div>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default FindConsultant;