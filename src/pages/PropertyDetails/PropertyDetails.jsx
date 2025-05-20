import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// Import components
import PropertyHeroFixed from '../../components/PropertyDetails/Hero/PropertyHeroFixed';
import AboutSection from '../../components/PropertyDetails/Sections/AboutSection';
import GallerySection from '../../components/PropertyDetails/Sections/GallerySection';
import LocationSection from '../../components/PropertyDetails/Sections/LocationSection';

import PropertyDetailsCard from '../../components/PropertyDetails/Navigation/PropertyDetailsCard';
import Tabs from '../../components/PropertyDetails/Navigation/Tabs';

const PropertyDetails = () => {
  const [property, setProperty] = useState(null);
  const [agent, setAgent] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  
  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch property details
        const propertyResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
        const propertyData = propertyResponse.data;
        setProperty(propertyData);
        
        // Fetch agent details if property has an agent ID
        if (propertyData.agent) {
          try {
            console.log('Fetching agent with ID:', propertyData.agent);
            const agentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${propertyData.agent}`);
            if (agentResponse.data) {
              console.log('Agent data fetched successfully:', agentResponse.data);
              setAgent(agentResponse.data);
            }
          } catch (agentError) {
            console.error('Error fetching agent data:', agentError);
          }
        }
        
        // Fetch related properties
        if (propertyData.propertyState) {
          const relatedResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties`, {
            params: {
              state: propertyData.propertyState,
              limit: 4,
              exclude: id
            }
          });
          setRelatedProperties(relatedResponse.data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching property data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [id]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Property</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/properties'}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }
  
  // No property found state
  if (!property) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.location.href = '/properties'}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-5">
      <main>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PropertyHeroFixed property={property} />
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
              
              {/* Related Properties Section - Only show if there are related properties */}
              {relatedProperties.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Properties</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedProperties.map((relatedProperty, index) => (
                      <motion.div 
                        key={relatedProperty._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => window.location.href = `/properties/${relatedProperty._id}`}
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
                          <p className="text-red-500 font-medium">AED {relatedProperty.propertyPrice?.toLocaleString() || 'Price on request'}</p>
                        </div>
                      </motion.div>
                    ))}
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
                <PropertyDetailsCard property={property} agent={agent} />
              </aside>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;