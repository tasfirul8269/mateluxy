import React from 'react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ 
  size = "md", 
  variant = "default",
  className,
  showText = false,
  text = "Loading..."
}) {
  const sizeClasses = {
    xs: "h-3 w-3 border-2",
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4"
  };
  
  const variantClasses = {
    default: "border-blue-600 border-t-transparent",
    primary: "border-blue-600 border-t-transparent",
    secondary: "border-gray-600 border-t-transparent",
    success: "border-green-600 border-t-transparent",
    danger: "border-red-600 border-t-transparent",
    warning: "border-yellow-600 border-t-transparent",
    gradient: "border-t-transparent border-l-blue-600 border-r-red-600 border-b-yellow-400"
  };
  
  const textSizeClasses = {
    xs: "text-xs mt-1",
    sm: "text-xs mt-1",
    md: "text-sm mt-2",
    lg: "text-base mt-2",
    xl: "text-lg mt-3"
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={cn(
        "animate-spin rounded-full border-solid",
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.default,
        className
      )}></div>
      
      {showText && (
        <div className={cn(
          "text-gray-500 font-medium",
          textSizeClasses[size] || textSizeClasses.md
        )}>
          {text}
        </div>
      )}
    </div>
  );
} 