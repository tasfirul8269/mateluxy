import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';

export const PriceRangeSelector = ({ 
  minPrice, 
  maxPrice, 
  onChange, 
  realPriceRange = { minPrice: 500000, maxPrice: 50000000 } 
}) => {
  const handleMinPriceChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    onChange(value, maxPrice);
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    onChange(minPrice, value);
  };

  return (
    <div className="price-selector grid grid-cols-2 gap-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">AED</span>
        <input
          type="number"
          value={minPrice || ''}
          onChange={handleMinPriceChange}
          placeholder="Min Price"
          className="w-full pl-12 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">AED</span>
        <input
          type="number"
          value={maxPrice || ''}
          onChange={handleMaxPriceChange}
          placeholder="Max Price"
          className="w-full pl-12 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>
  );
};