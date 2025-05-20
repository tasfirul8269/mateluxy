import React from 'react';

const Input = ({
  label,
  error,
  className = '',
  placeholder,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-medium mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;