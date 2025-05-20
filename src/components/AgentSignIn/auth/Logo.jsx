import React from 'react';
import logoImage from '../../../assets/logo.png';

const Logo = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoImage} 
        alt="MateLuxy Logo" 
        className="h-16 object-contain"
      />
    </div>
  );
};

export default Logo; 