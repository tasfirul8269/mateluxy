import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 active:scale-[0.98] focus-visible:ring-red-500",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 active:scale-[0.98] focus-visible:ring-red-700",
        outline: "border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] focus-visible:ring-gray-400",
        secondary: "bg-gradient-to-r from-slate-100 to-gray-200 text-gray-800 shadow-sm hover:shadow hover:from-slate-200 hover:to-gray-300 active:scale-[0.98] focus-visible:ring-gray-400",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98] focus-visible:ring-gray-400",
        link: "text-red-600 underline-offset-4 hover:text-red-700 hover:underline p-0 h-auto active:scale-[0.98] focus-visible:ring-red-500",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 active:scale-[0.98] focus-visible:ring-green-500",
        primary: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 active:scale-[0.98] focus-visible:ring-red-500",
        blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] focus-visible:ring-blue-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10 p-0",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        shine: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  animation,
  asChild = false, 
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp 
      className={cn(
        buttonVariants({ variant, size, animation, className }),
        "transition-all duration-200"
      )} 
      ref={ref} 
      {...props} 
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };