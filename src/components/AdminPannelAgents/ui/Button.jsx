import React from 'react';

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-red-100 text-red-600 hover:bg-red-200',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-100 text-red-600 hover:bg-red-200',
  };
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;