import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, error, icon, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    <input
      type={type}
      className={cn(
          "flex h-11 w-full rounded-md border-2 border-gray-200 bg-white px-4 py-2 text-base shadow-sm transition-all duration-200",
          "placeholder:text-gray-400 placeholder:text-opacity-80",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200 pr-10",
          icon && "pl-10",
        className
      )}
      ref={ref}
      {...props}
    />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };