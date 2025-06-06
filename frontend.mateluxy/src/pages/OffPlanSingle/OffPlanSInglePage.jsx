import React, { useState, useEffect } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Heart, Bookmark } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import Tabs from '../../components/OffPlanSingle/Navigation/Tabs';
import ProjectDetailsCard from '../../components/OffPlanSingle/ProjectDetails/ProjectDetailsCard';
import ContactForm from '../../components/OffPlanSingle/Forms/ContactForm';
import HeroBanner from '../../components/OffPlanSingle/Hero/HeroBanner';
import AboutSection from '../../components/OffPlanSingle/Sections/AboutSection';
import GallerySection from '../../components/OffPlanSingle/Sections/GallerySection';
import LocationSection from '../../components/OffPlanSingle/Sections/LocationSection';
import PaymentPlanSection from '../../components/OffPlanSingle/Sections/PaymentPlanSection';

const OffPlanSinglePage = () => {
  const initialPropertyData = useLoaderData();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch fresh property data and related properties
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsLoading(true);
        // Use the initial property data if available to prevent white screen
        if (initialPropertyData) {
          const transformedProperty = {
            ...initialPropertyData,
            image: initialPropertyData.propertyFeaturedImage,
            title: initialPropertyData.propertyTitle,
            location: initialPropertyData.propertyAddress,
            duringConstructionPercentage: initialPropertyData.duringConstructionPercentage || 50,
            onCompletionPercentage: initialPropertyData.onCompletionPercentage || 50,
            completionDate: initialPropertyData.completionDate || null,
          };
          setProperty(transformedProperty);
          
          // Fetch agent data if available in initial data
          if (initialPropertyData.agent) {
            setIsLoadingAgent(true);
            try {
              // If agent is already populated as an object, use it directly
              if (typeof initialPropertyData.agent === 'object' && initialPropertyData.agent !== null) {
                console.log('Using populated agent data from initial data:', initialPropertyData.agent);
                setAgent(initialPropertyData.agent);
              } 
              // If agent is just an ID, fetch the agent data
              else if (typeof initialPropertyData.agent === 'string' && initialPropertyData.agent.trim() !== '') {
                console.log('Fetching agent with ID from initial data:', initialPropertyData.agent);
                const agentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${initialPropertyData.agent}`);
                if (agentResponse.data) {
                  console.log('Agent data fetched successfully from initial data:', agentResponse.data);
                  setAgent(agentResponse.data);
                }
              }
            } catch (agentError) {
              console.error('Error fetching agent data from initial data:', agentError);
              setAgent(null);
            } finally {
              setIsLoadingAgent(false);
            }
          }
          
          // Fetch related properties - show Buy properties instead of off-plan
          try {
            const relatedResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties`, {
              params: {
                state: initialPropertyData.propertyState,
                category: 'Buy', // Show Buy properties instead of Off Plan
                limit: 4,
                exclude: id
              }
            });
            setRelatedProperties(relatedResponse.data);
          } catch (relatedError) {
            console.error('Error fetching related properties:', relatedError);
          }
          
          setIsLoading(false);
          return; // Exit early to prevent white screen
        }
        
        // If no initial data, fetch the property data
        const propertyResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
        const propertyData = propertyResponse.data;
        
        // Transform property data
        const transformedProperty = {
          ...propertyData,
          image: propertyData.propertyFeaturedImage,
          title: propertyData.propertyTitle,
          location: propertyData.propertyAddress,
          duringConstructionPercentage: propertyData.duringConstructionPercentage || 50,
          onCompletionPercentage: propertyData.onCompletionPercentage || 50,
          completionDate: propertyData.completionDate || null,
        };
        setProperty(transformedProperty);
        
        // Debug property data to check agent field
        console.log('Property data received:', propertyData);
        setIsLoadingAgent(true);
        
        // Check if agent data is already populated in the property
        if (propertyData.agent) {
          console.log('Agent data found in property:', propertyData.agent);
          // If agent is already populated as an object, use it directly
          if (typeof propertyData.agent === 'object' && propertyData.agent !== null) {
            console.log('Using populated agent data:', propertyData.agent);
            setAgent(propertyData.agent);
            setIsLoadingAgent(false);
          } 
          // If agent is just an ID, fetch the agent data
          else if (typeof propertyData.agent === 'string' && propertyData.agent.trim() !== '') {
            try {
              console.log('Fetching agent with ID:', propertyData.agent);
              const agentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${propertyData.agent}`);
              if (agentResponse.data) {
                console.log('Agent data fetched successfully:', agentResponse.data);
                setAgent(agentResponse.data);
              } else {
                console.log('No agent data found, setting agent to null');
                setAgent(null);
              }
            } catch (agentError) {
              console.error('Error fetching agent data:', agentError);
              setAgent(null);
            } finally {
              setIsLoadingAgent(false);
            }
          } else {
            console.log('Invalid agent data format:', propertyData.agent);
            setAgent(null);
            setIsLoadingAgent(false);
          }
        } else {
          console.log('No agent associated with this property');
          setAgent(null);
          setIsLoadingAgent(false);
        }
        
        // Fetch related properties - show Buy properties instead of off-plan
        if (propertyData.propertyState) {
          const relatedResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties`, {
            params: {
              state: propertyData.propertyState,
              category: 'Buy', // Show Buy properties instead of Off Plan
              limit: 4,
              exclude: id
            }
          });
          setRelatedProperties(relatedResponse.data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching property data:', error);
        // Fallback to loader data if API call fails
        if (initialPropertyData) {
          const transformedProperty = {
            ...initialPropertyData,
            image: initialPropertyData.propertyFeaturedImage,
            title: initialPropertyData.propertyTitle,
            location: initialPropertyData.propertyAddress,
            duringConstructionPercentage: initialPropertyData.duringConstructionPercentage || 50,
            onCompletionPercentage: initialPropertyData.onCompletionPercentage || 50,
            completionDate: initialPropertyData.completionDate || null,
          };
          setProperty(transformedProperty);
          setIsLoading(false);
        }
      }
    };

    fetchPropertyData();
  }, [id, initialPropertyData]);

  // Toggle saved state
  const toggleSave = () => {
    setIsSaved(!isSaved);
    // Here you would typically call an API to save/unsave the property
  };

  // Share property
  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.propertyTitle || 'Off Plan Property',
        text: `Check out this property: ${property?.propertyTitle}`,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroBanner property={property} />
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <motion.div 
              className="order-2 lg:order-1 lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div id="about">
                <AboutSection property={property} />
              </div>
              
              <div id="gallery">
                <GallerySection property={property} />
              </div>
              
              <div id="location">
                <LocationSection property={property} />
              </div>
              
              <div id="payment-plan">
                <PaymentPlanSection property={property} />
              </div>
              
              {/* Related Properties Section - Only show if there are related properties */}
              {relatedProperties.length > 0 && (
                <section className="bg-white rounded-[30px] border border-[#e6e6e6] overflow-hidden mb-8 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Similar Properties</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedProperties.map((relatedProperty, index) => {
                      // Create the full URL including origin to ensure it works properly
                      const fullUrl = `${window.location.origin}/property-details/${relatedProperty._id}`;
                      
                      return (
                        <motion.div 
                          key={relatedProperty._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              const newWindow = window.open('', '_blank');
                              if (newWindow) {
                                newWindow.location.href = `/property-details/${relatedProperty._id}`;
                              }
                            }}
                          >
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={relatedProperty.propertyFeaturedImage} 
                                alt={relatedProperty.propertyTitle} 
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">{relatedProperty.propertyTitle}</h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-1">{relatedProperty.propertyState || relatedProperty.propertyAddress}</p>
                              <p className="text-blue-500 font-medium">{formatPrice(relatedProperty.propertyPrice) || 'Price on request'}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2 lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <aside className="sticky top-24">
                <Tabs />
                <ProjectDetailsCard property={property} agent={agent} isLoadingAgent={isLoadingAgent} />
                <ContactForm property={property} />
              </aside>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OffPlanSinglePage;
