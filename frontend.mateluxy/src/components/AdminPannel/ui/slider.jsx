import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ 
  className, 
  showValues = false,
  unit = "",
  color = "blue",
  ...props 
}, ref) => {
  const colorOptions = {
    blue: {
      track: "bg-blue-500",
      border: "border-blue-500",
      hover: "hover:border-blue-600 hover:bg-blue-50",
      ring: "focus-visible:ring-blue-400"
    },
    red: {
      track: "bg-red-500",
      border: "border-red-500",
      hover: "hover:border-red-600 hover:bg-red-50",
      ring: "focus-visible:ring-red-400"
    },
    green: {
      track: "bg-green-500",
      border: "border-green-500",
      hover: "hover:border-green-600 hover:bg-green-50",
      ring: "focus-visible:ring-green-400"
    },
    purple: {
      track: "bg-purple-500",
      border: "border-purple-500",
      hover: "hover:border-purple-600 hover:bg-purple-50",
      ring: "focus-visible:ring-purple-400"
    },
  };
  
  const colorClasses = colorOptions[color] || colorOptions.blue;
  
  return (
    <div className={cn("w-full", showValues && "pb-6", className)}>
  <SliderPrimitive.Root
    ref={ref}
        className="relative flex w-full touch-none select-none items-center"
    {...props}
  >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className={cn("absolute h-full", colorClasses.track)} />
    </SliderPrimitive.Track>
        
        {props.defaultValue?.map((value, i) => (
          <React.Fragment key={i}>
            <SliderPrimitive.Thumb
              className={cn(
                "block h-5 w-5 rounded-full border-2 bg-white shadow-md",
                "transition-all duration-200 ease-in-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "hover:h-6 hover:w-6 disabled:pointer-events-none disabled:opacity-50",
                colorClasses.border,
                colorClasses.hover,
                colorClasses.ring
              )}
            />
            
            {showValues && (
              <div className="absolute text-xs font-medium text-gray-600" style={{
                left: `calc(${((value - props.min) / (props.max - props.min)) * 100}% - 10px)`,
                top: '2rem'
              }}>
                {value}{unit}
              </div>
            )}
          </React.Fragment>
        ))}
  </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };