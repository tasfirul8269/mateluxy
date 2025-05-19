import React from 'react';
import { MapPin, Languages, Briefcase, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TeamMember = ({ member }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/agent/${member.id}`); 
  };

  return (
    <motion.div 
      onClick={handleClick} 
      className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl relative border border-gray-100 group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image container with enhanced gradient overlay */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-black/10 mix-blend-overlay z-10 group-hover:opacity-70 transition-opacity duration-300"></div>
        <img  
          src={member.profileImage || 'https://via.placeholder.com/300x400?text=No+Image'} 
          alt={member.name} 
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Name and position overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
          <h3 className="text-xl font-bold mb-1 drop-shadow-md transition-colors">{member.name}</h3>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-white/80" />
            <p className="text-sm font-medium text-white/90">{member.position}</p>
          </div>
        </div>
      </div>
      
      {/* Details section */}
      <div className="p-5 relative z-10">
        {/* Department */}
        {member.department && (
          <div className="flex items-center mb-3">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="text-gray-700 text-sm">{member.department}</span>
          </div>
        )}
        
        {/* Languages */}
        {member.languages && member.languages.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Languages className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-700 text-sm font-medium">Languages</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {member.languages.map((language) => (
                <span 
                  key={language} 
                  className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* View profile link with icon */}
        <div className="flex justify-end">
          <motion.div 
            className="flex items-center text-red-500 hover:text-red-700 transition-colors cursor-pointer group"
            whileHover={{ x: 3 }}
          >
            <span className="text-sm mr-1">View Profile</span>
            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamMember;