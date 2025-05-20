import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Download, MessageCircle, Globe, Briefcase, Building, Home, ArrowRight, Star, ChevronRight, Calendar, Users, ChevronDown } from "lucide-react";
import { convertS3UrlToProxyUrl } from "../../utils/s3UrlConverter";
import { toast } from "sonner";

const AgentProfileCard = () => {
  const [agentData, setAgentData] = useState({});
  const [agentProperties, setAgentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const contactSectionRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch agent data
        const agentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${id}`);
        setAgentData(agentResponse.data);
        
        // Fetch properties where this agent is assigned
        const propertiesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties?agent=${id}`);
        setAgentProperties(propertiesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id])
  

  const handleDownloadVCard = async () => {
    // First check if the agent has a stored vCard
    if (agentData?.vcard) {
      try {
        // Use the vCard-specific proxy route
        const vcardUrl = convertS3UrlToProxyUrl(agentData.vcard, { isVCard: true });
        
        // Create a link and trigger download
        const link = document.createElement("a");
        link.href = vcardUrl;
        link.setAttribute("download", `${agentData.fullName.replace(/[^\w\s]/gi, "_")}.vcf`);
        link.setAttribute("target", "_blank");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return;
      } catch (error) {
        console.error("Error downloading stored vCard:", error);
        toast.error("Could not download vCard file. Generating a basic version instead.");
        // Fall through to generate a basic vCard
      }
    }
    
    // Fallback: Generate basic vCard if no stored one exists
    // Validate required fields
    if (!agentData?.fullName) {
      console.error("Full name is required to generate a vCard.");
      return;
    }
  
    // Sanitize inputs (remove line breaks, trim whitespace)
    const sanitize = (str) => (str || "").toString().replace(/\n/g, " ").trim();
  
    // Construct minimal vCard
    const vCardData = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${sanitize(agentData?.fullName)}`,
      agentData?.position && `TITLE:${sanitize(agentData?.position)}`,
      agentData?.contactNumber && `TEL;TYPE=CELL:${sanitize(agentData.contactNumber)}`,
      agentData?.email && `EMAIL:${sanitize(agentData.email)}`,
      "END:VCARD",
    ]
      .filter(Boolean) // Remove empty lines
      .join("\n");
  
    // Generate filename (sanitize special chars)
    const fileName = `${agentData.fullName.replace(/[^\w\s]/gi, "_")}.vcf`;
  
    // Trigger download
    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Back navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link to="/our-team" className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back to Team</span>
        </Link>
      </motion.div>

      {/* Hero section with agent info */}
      <div className="relative mb-16 overflow-hidden rounded-2xl shadow-xl">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3')] bg-cover bg-center z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 via-red-800/85 to-gray-900/90 z-0"></div>
        
        {/* Texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAzMGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptLTE4IDBjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-20 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full opacity-15 blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full opacity-15 blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500 rounded-full opacity-10 blur-3xl translate-y-1/3 translate-x-1/3"></div>
        
        <div className="container mx-auto relative z-10 py-16 px-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
            {/* Agent image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <img
                  src={agentData?.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3'}
                  alt={agentData?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Department badge */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                {agentData?.department || 'Sales'}
              </div>
            </motion.div>
            
            {/* Agent info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center lg:text-left text-white max-w-2xl"
            >
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-white text-xs font-medium tracking-wider mb-4">
                LUXURY REAL ESTATE PROFESSIONAL
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{agentData?.fullName || 'Agent Name'}</h1>
              <p className="text-xl text-red-200 font-medium mb-6">{agentData?.position || 'Real Estate Agent'}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-red-300" />
                  <span>{agentProperties.length} Listings</span>
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-red-300" />
                  <span>{agentData?.languages?.length || 0} Languages</span>
                </div>
                
              
              </div>
              
              {/* Contact buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <a
                  href={`https://wa.me/${agentData?.whatsapp || "1234567890"}`}
                  className="flex items-center gap-2 bg-white text-red-900 px-6 py-3 rounded-full transition-all hover:bg-red-50 hover:shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">WhatsApp</span>
                </a>
                <a
                  href={`tel:${agentData?.contactNumber?.replace(/\D/g, "") || "1234567890"}`}
                  className="flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-full transition-all hover:bg-red-800 hover:shadow-lg"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">Call Now</span>
                </a>
                <button
                  onClick={handleDownloadVCard}
                  className="flex items-center gap-2 bg-transparent border border-white/30 text-white px-6 py-3 rounded-full transition-all hover:bg-white/10 hover:shadow-lg cursor-pointer"
                >
                  <Download className="h-5 w-5" />
                  <span className="cursor-pointer font-medium">Download VCard</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Content section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Contact details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
            ref={contactSectionRef}
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-red-50 p-2 rounded-lg mr-3 mt-1">
                      <Mail className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <a href={`mailto:${agentData?.email}`} className="text-gray-900 hover:text-red-600 transition-colors">
                        {agentData?.email || 'contact@example.com'}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-red-50 p-2 rounded-lg mr-3 mt-1">
                      <Phone className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone</div>
                      <a href={`tel:${agentData?.contactNumber?.replace(/\D/g, "") || "1234567890"}`} className="text-gray-900 hover:text-red-600 transition-colors">
                        {agentData?.contactNumber || '+971 50 123 4567'}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-red-50 p-2 rounded-lg mr-3 mt-1">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Location</div>
                      <div className="text-gray-900">
                        {agentData?.address || 'Dubai, United Arab Emirates'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Languages section */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {agentData?.languages?.length > 0 ? (
                    agentData.languages.map((language, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{language}</span>
                    ))
                  ) : (
                    <span className="text-gray-500">English</span>
                  )}
                </div>
              </div>
              

            </div>
          </motion.div>
          
          {/* Right column - About and expertise */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
            ref={aboutSectionRef}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About {agentData?.fullName?.split(' ')[0] || 'Me'}</h2>
                <div className={`text-gray-600 leading-relaxed space-y-4 ${!expanded ? 'max-h-[150px] overflow-hidden relative' : ''}`}>
                  {agentData?.aboutMe ? (
                    <p>{agentData.aboutMe}</p>
                  ) : (
                    <>
                      <p>As a dedicated real estate professional, I specialize in helping clients navigate the luxury property market with confidence and ease. My approach combines market expertise with personalized service to ensure each client finds their perfect property.</p>
                      <p>Whether you're looking to buy, sell, or invest, I'm committed to providing exceptional guidance throughout the entire process.</p>
                      <p>With years of experience in the Dubai real estate market, I have developed a deep understanding of property values, neighborhood trends, and investment opportunities. My goal is to make your real estate journey as smooth and successful as possible.</p>
                      <p>I pride myself on my attention to detail, negotiation skills, and commitment to exceeding client expectations. Whether you're a first-time buyer or an experienced investor, I'm here to provide the expertise and support you need.</p>
                    </>
                  )}
                  {!expanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                <button 
                  onClick={() => setExpanded(!expanded)} 
                  className="mt-4 flex items-center text-red-600 hover:text-red-700 transition-colors font-medium border-b border-transparent hover:border-red-600"
                >
                  {expanded ? 'Read Less' : 'Read More'}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Areas of expertise */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Areas of Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <Building className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{agentData?.department || 'Residential'} Properties</div>
                      <div className="text-sm text-gray-600">Expert guidance in the {agentData?.department?.toLowerCase() || 'residential'} market</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <Star className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Premium Service</div>
                      <div className="text-sm text-gray-600">Personalized attention to every client</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
    
      {/* Available listings section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="container mx-auto px-4 py-16 rounded-3xl "
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-block bg-red-100 px-3 py-1 rounded-full text-red-600 text-xs font-bold tracking-wider mb-4">
              AGENT LISTINGS
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Properties Assigned to {agentData?.fullName || 'This Agent'}</h2>
          </div>
          
          {agentProperties.length > 3 && (
            <Link to="/properties" className="mt-4 md:mt-0 text-red-600 flex items-center hover:text-red-700 transition-colors group">
              <span className="mr-1 font-medium">View all properties</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        
        {agentProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agentProperties.slice(0, 3).map((property, index) => (
              <motion.div 
                key={property._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/property-details/${property._id}`} className="group block">
                  <div className="bg-white rounded-xl overflow-hidden shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-gray-100">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={property.propertyFeaturedImage} 
                        alt={property.propertyTitle} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
                      
                      {/* Price tag */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-red-600 px-4 py-2 rounded-lg font-bold shadow-md transform transition-transform duration-300 group-hover:scale-105">
                        AED {property.propertyPrice.toLocaleString()}
                      </div>
                      
                      {/* Property type badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">
                        {property.propertyType}
                      </div>
                      
                      {/* Property details overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                        <h3 className="font-bold text-xl mb-2 group-hover:text-red-200 transition-colors">
                          {property.propertyTitle}
                        </h3>
                        <div className="flex items-center text-white/90 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1.5 text-red-300" />
                          <span>{property.propertyAddress}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Property features */}
                    <div className="p-5 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-2 text-gray-700">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors">
                          <svg className="h-5 w-5 mb-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M5 8h.01M5 12h.01M5 16h.01" />
                          </svg>
                          <span className="font-medium">{property.propertyBedrooms} Beds</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors">
                          <svg className="h-5 w-5 mb-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span className="font-medium">{property.propertyBathrooms} Baths</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors">
                          <svg className="h-5 w-5 mb-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="font-medium">{property.propertySize} sqft</span>
                        </div>
                      </div>
                      
                      {/* View details button */}
                      <div className="mt-4 flex justify-end">
                        <div className="text-red-600 font-medium text-sm flex items-center group-hover:text-red-700 transition-colors">
                          View Details
                          <svg className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
              <Briefcase className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Listings Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              This agent currently has no active property listings. Please check back later or contact them directly for more information.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AgentProfileCard;
