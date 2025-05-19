import React from 'react';

export const BedsSelector = ({ value, onChange }) => {
  const bedsOptions = [
    { value: null, label: 'Beds' },
    { value: 'studio', label: 'Studio' },
    { value: '1', label: '1 Bed' },
    { value: '2', label: '2 Beds' },
    { value: '3', label: '3 Beds' },
    { value: '4', label: '4 Beds' },
    { value: '5+', label: '5+ Beds' },
  ];
  
  return (
    <div className="beds-selector ">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="text-sm"
      >
        {bedsOptions.map((option) => (
          <option 
            key={option.value || 'any'} 
            value={option.value || ''}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};