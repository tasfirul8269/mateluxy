import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const Input = ({
  label,
  error,
  fullWidth = true,
  icon,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={props.id || 'input'} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}>
        <div
          className={`relative rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 ${
            isFocused ? 'shadow-md ring-3 ring-red-300' : 'ring-1 ring-gray-200'
          } ${error ? 'ring-red-400' : ''}`}
        >
          <div className="flex items-center">
            {icon && <div className="pl-3 text-gray-500">{icon}</div>}
            <input
              type={inputType}
              className={`block w-full px-4 py-2.5 text-gray-700 bg-white focus:outline-none ${
                icon ? 'pl-2' : ''
              } ${className}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
            {isPasswordType && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-600 animate-fadeIn">{error}</p>}
      </div>
    </div>
  );
};

export default Input;