import "animate.css";
import { FaPhone, FaWhatsapp, FaCalendarAlt, FaHeart } from "react-icons/fa";
import { IoIosExpand } from "react-icons/io";
import { LiaBathSolid, LiaBedSolid } from "react-icons/lia";
import { MdLocationOn } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const PropertyCard = ({ property, loading, error }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const location = useLocation();
  const pathSegments = location.pathname.split('/');

  // Handle commercial routes specially
  let currentRoute;
  if (pathSegments[1]?.toLowerCase() === 'commercial') {
    // For commercial routes, we need to check the second path segment
    currentRoute = pathSegments[2]?.toLowerCase() === 'rent' ? 'Commercial for Rent' : 'Commercial for Buy';
  } else {
    // For regular routes, just use the first segment
    currentRoute = pathSegments[1]?.toLowerCase() || 'buy'; // Default to 'buy'
  }

  // Fetch agent data when property changes
  useEffect(() => {
    if (property && property.agent) {
      // Check if agent is already an object with data
      if (typeof property.agent === 'object' && property.agent !== null) {
        // If agent is already an object, use it directly
        setAgentData(property.agent);
      } else if (typeof property.agent === 'string') {
        // If agent is an ID string, fetch the data
        setAgentLoading(true);
        axios.get(`${import.meta.env.VITE_API_URL}/api/agents/${property.agent}`)
          .then(res => {
            setAgentData(res.data);
            setAgentLoading(false);
          })
          .catch(err => {
            console.error("Error fetching agent data:", err);
            setAgentLoading(false);
          });
      } else {
        console.error("Invalid agent data format:", property.agent);
      }
    }
  }, [property]);

  if (loading) {
    return (
      <div className="text-center py-20 animate__animated animate__fadeIn">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 animate__animated animate__fadeIn">
        Error: {error}
      </div>
    );
  }

  // Skip rendering if property doesn't match route
  if (!property || !property.category) {
    return null;
  }
  
  // Check if the property category matches the current route
  const propertyCategory = property.category;
  const isMatch = 
    // Direct match (for Buy and Rent)
    propertyCategory.toLowerCase() === currentRoute.toLowerCase() ||
    // Commercial route handling
    (currentRoute === 'Commercial for Buy' && propertyCategory === 'Commercial for Buy') ||
    (currentRoute === 'Commercial for Rent' && propertyCategory === 'Commercial for Rent');
  
  if (!isMatch) {
    console.log('Property category mismatch:', { 
      propertyCategory, 
      currentRoute, 
      pathname: location.pathname 
    });
    return null;
  }

  return (
    <div className="container mx-auto p-0 bg-white rounded-xl animate__animated animate__fadeIn grid md:grid-cols-2 gap-4 border border-spacing-0.5 border-gray-200 my-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-red-100 overflow-hidden">
      {/* Image container with overlay */}
      <div className="relative group">
        <Link
          to={`/property-details/${property._id}`}
          className="flex gap-1 animate__animated animate__fadeInUp rounded-md w-full h-full min-h-[300px]"
        >
          {/* Main Media */}
          {property.propertyFeaturedImage?.match(/\.(mp4|mov|avi)$/i) ? (
            <video
              src={property.propertyFeaturedImage}
              className="w-2/3 h-full object-cover grow rounded-l-xl"
              controls
              muted
              loop
            />
          ) : (
            <img
              src={property.propertyFeaturedImage}
              alt={property.propertyTitle}
              className="w-2/3 h-full object-cover grow-2 rounded-l-xl"
            />
          )}

          <div className="flex w-1/3 flex-col gap-1">
            {property.media?.slice(0, 3).map((media, index) =>
              media?.match(/\.(mp4|mov|avi)$/i) ? (
                <video
                  key={index}
                  src={media}
                  className="w-full h-1/3 object-cover rounded-tr-xl last:rounded-br-none"
                  controls
                  muted
                  loop
                />
              ) : (
                <img
                  key={index}
                  src={media}
                  alt=""
                  className={`w-full h-1/3 object-cover ${index === 0 ? 'rounded-tr-xl' : ''} ${index === 2 ? 'rounded-br-none' : ''}`}
                />
              )
            )}
          </div>
        </Link>
        
        {/* Favorite button overlay */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md z-10 transition-transform duration-300 hover:scale-110"
        >
          <FaHeart className={isFavorite ? 'text-red-500' : 'text-gray-300'} />
        </button>
        
        {/* Category tag */}
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full shadow-sm z-10">
          <span className="text-xs font-medium text-gray-700">{property.category}</span>
        </div>
      </div>

      {/* Property details container */}
      <div className="flex flex-col items-start justify-start animate__animated animate__fadeInUp h-full overflow-y-auto p-4">
        {/* Price and Location */}
        <Link to={`/property-details/${property._id}`} className="w-full">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-red-600">
                AED {property.propertyPrice?.toLocaleString() || property.propertyPrice}
                <span className="text-xs text-gray-500 font-normal ml-1">{property.category === 'Rent' ? '/month' : ''}</span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MdLocationOn className="mr-1 text-gray-500 flex-shrink-0" />
              <span className="text-gray-600 truncate">
                {property.propertyAddress}, {property.propertyState}
              </span>
            </div>

            {/* Property Title */}
            <h3 className="font-semibold text-gray-800 text-lg">{property.propertyTitle || `${property.propertyBedrooms} Bedroom ${property.propertyType}`}</h3>

            {/* Property Description - Truncated */}
            <p className="text-gray-600 text-sm line-clamp-2 max-h-12 overflow-hidden">
              {property.propertyDescription}
            </p>

            {/* Property Type */}
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                {property.propertyType}
              </span>
              {property.isNewLaunch && (
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  New Launch
                </span>
              )}
            </div>

            {/* Property Features */}
            <div className="flex items-center gap-5 py-3 border-t border-b border-gray-100">
              <p className="flex text-gray-700 items-center gap-1.5 font-medium">
                <LiaBedSolid className="text-xl text-gray-500" />
                <span>{property.propertyBedrooms} <span className="text-sm font-normal">Beds</span></span>
              </p>
              <p className="flex text-gray-700 items-center gap-1.5 font-medium">
                <LiaBathSolid className="text-xl text-gray-500" /> 
                <span>{property.propertyBathrooms} <span className="text-sm font-normal">Baths</span></span>
              </p>
              <p className="flex text-gray-700 items-center gap-1.5 font-medium">
                <IoIosExpand className="text-xl text-gray-500" /> 
                <span>{property.propertySize} <span className="text-sm font-normal">sq.ft</span></span>
              </p>
            </div>
          </div>

          {/* Agent Information (if available) */}
          {property.agent && (
            <div className="flex items-center gap-4 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-red-100 shadow-sm">
                {agentLoading ? (
                  <span className="text-gray-500 font-medium text-xs">Loading</span>
                ) : agentData && agentData.profileImage ? (
                  <img src={agentData.profileImage} alt={agentData.fullName || agentData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 font-medium text-xs">Agent</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  {agentData ? agentData.fullName || agentData.name : "Property Agent"}
                </h3>
                <p className="text-xs text-gray-500">
                  {agentData ? agentData.position || agentData.title || "Real Estate Consultant" : "Loading agent info..."}
                </p>
                {agentData && agentData.languages && agentData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agentData.languages.map((language, index) => (
                      <span key={index} className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                        {language}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Link>

        {/* Action Buttons */}
        <div className="flex w-full items-center justify-between md:justify-start gap-3 border-t border-gray-200 mt-4 pt-4">
          <button 
            onClick={() => window.location.href = `tel:${agentData?.contactNumber || '+1234567890'}`}
            className="cursor-pointer flex justify-center items-center gap-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg transition-colors duration-200 flex-1"
          >
            <FaPhone className="text-sm text-gray-500" />
            <span className="font-normal text-sm">Call</span>
          </button>

          <button
            onClick={() => window.location.href = `https://wa.me/${(agentData?.whatsapp || agentData?.contactNumber || '+1234567890').replace(/[^0-9]/g, '')}`}
            className="flex cursor-pointer justify-center items-center gap-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg transition-colors duration-200 flex-1"
          >
            <FaWhatsapp className="text-green-500" />
            <span className="font-normal text-sm">WhatsApp</span>
          </button>

          <button className="hidden md:flex cursor-pointer justify-center items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors duration-200 flex-1 shadow-sm">
            <FaCalendarAlt className="text-sm" />
            <span className="font-medium text-sm">Book Viewing</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;