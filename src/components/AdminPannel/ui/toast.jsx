import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center overflow-hidden rounded-md bg-white shadow-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border border-gray-200",
        success: "border border-gray-200 pl-14 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-10 before:bg-green-500",
        destructive: "border border-gray-200 pl-14 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-10 before:bg-red-500",
        error: "border border-gray-200 pl-14 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-10 before:bg-red-500",
        info: "border border-gray-200 pl-14 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-10 before:bg-blue-500",
        warning: "border border-gray-200 pl-14 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-10 before:bg-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "border border-slate-200 hover:bg-slate-100",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full w-5 h-5 flex items-center justify-center p-0 text-gray-400 opacity-70 transition-opacity hover:text-gray-900 hover:opacity-100 focus:opacity-100 focus:outline-none",
      className
    )}
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, variant, ...props }, ref) => {
  const variantClassNames = {
    success: "text-green-600",
    destructive: "text-red-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
    default: "text-slate-900",
  };

  return (
    <ToastPrimitives.Title 
      ref={ref} 
      className={cn(
        "text-sm font-semibold",
        variant && variantClassNames[variant],
        className
      )} 
      {...props} 
    />
  );
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm text-gray-600 mt-1", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};