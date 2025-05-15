import React from 'react';

export const CompletionSelector = ({ value, onChange }) => {
  const currentYear = new Date().getFullYear();
  
  const completionOptions = [
    { value: null, label: 'Completion' },
    { value: 'ready', label: 'Ready Now' },
    { value: currentYear.toString(), label: `Ready ${currentYear}` },
    { value: (currentYear + 1).toString(), label: `Ready ${currentYear + 1}` },
    { value: (currentYear + 2).toString(), label: `Ready ${currentYear + 2}` },
    { value: (currentYear + 3).toString(), label: `Ready ${currentYear + 3}` },
    { value: 'future', label: 'Future Projects' },
  ];
  
  return (
    <div className="completion-selector ">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="text-sm"
      >
        {completionOptions.map((option) => (
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