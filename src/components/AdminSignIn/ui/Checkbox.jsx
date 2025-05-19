import React from 'react';

const Checkbox = ({ label, className = '', ...props }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all duration-200 ${className}`}
        {...props}
      />
      <label htmlFor={props.id} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;