import React, { useMemo } from 'react';

export const PriceRangeSelector = ({ 
  minPrice, 
  maxPrice, 
  onChange, 
  realPriceRange = { minPrice: 500000, maxPrice: 50000000 } 
}) => {
  // Generate price options based on real min and max prices
  const priceOptions = useMemo(() => {
    const options = [{ value: null, label: 'Min Price' }];
    
    // Add dynamically generated price options based on the real price range
    const minPriceValue = realPriceRange.minPrice;
    const maxPriceValue = realPriceRange.maxPrice;
    
    // Calculate appropriate increments based on the price range
    let increment;
    if (maxPriceValue <= 5000000) {
      increment = 500000; // 500K increments for lower ranges
    } else if (maxPriceValue <= 10000000) {
      increment = 1000000; // 1M increments for mid ranges
    } else {
      increment = 2000000; // 2M increments for higher ranges
    }
    
    // Generate price options
    let currentPrice = minPriceValue;
    while (currentPrice < maxPriceValue) {
      const formattedLabel = currentPrice >= 1000000 
        ? `AED ${(currentPrice / 1000000).toFixed(1)}M`.replace('.0M', 'M') 
        : `AED ${(currentPrice / 1000).toFixed(0)}K`;
      
      options.push({ value: currentPrice, label: formattedLabel });
      currentPrice += increment;
    }
    
    return options;
  }, [realPriceRange]);
  
  // Generate max price options based on the selected min price
  const maxPriceOptions = useMemo(() => {
    const options = [{ value: null, label: 'Max Price' }];
    
    // Add dynamically generated price options based on the real price range
    const minPriceValue = minPrice || realPriceRange.minPrice;
    const maxPriceValue = realPriceRange.maxPrice;
    
    // Calculate appropriate increments based on the price range
    let increment;
    if (maxPriceValue <= 5000000) {
      increment = 500000; // 500K increments for lower ranges
    } else if (maxPriceValue <= 10000000) {
      increment = 1000000; // 1M increments for mid ranges
    } else {
      increment = 2000000; // 2M increments for higher ranges
    }
    
    // Generate price options starting from the selected min price
    let currentPrice = Math.max(minPriceValue + increment, realPriceRange.minPrice + increment);
    while (currentPrice <= maxPriceValue) {
      const formattedLabel = currentPrice >= 1000000 
        ? `AED ${(currentPrice / 1000000).toFixed(1)}M`.replace('.0M', 'M') 
        : `AED ${(currentPrice / 1000).toFixed(0)}K`;
      
      options.push({ value: currentPrice, label: formattedLabel });
      currentPrice += increment;
    }
    
    return options;
  }, [minPrice, realPriceRange]);
  
  return (
    <div className="price-selector grid grid-cols-2 gap-2 ">
      <select
        value={minPrice?.toString() || ''}
        onChange={(e) => {
          const newValue = e.target.value ? parseInt(e.target.value) : null;
          onChange(newValue, maxPrice);
        }}
        className="min-price text-sm"
      >
        {priceOptions.map((option) => (
          <option 
            key={`min-${option.value || 'null'}`} 
            value={option.value || ''}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      <select
        value={maxPrice?.toString() || ''}
        onChange={(e) => {
          const newValue = e.target.value ? parseInt(e.target.value) : null;
          onChange(minPrice, newValue);
        }}
        className="max-price text-sm"
      >
        {maxPriceOptions.map((option) => (
          <option 
            key={`max-${option.value || 'null'}`} 
            value={option.value || ''}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};