import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

const white = "#fff";
const gray900 = "#111827";
const gray600 = "#4B5563";
const green = "#22c55e";
const yellow = "#facc15";
const red = "#ef4444";
const blue = "#3b82f6";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors={false}
      closeButton={true}
      expand={false}
      position="bottom-right"
      toastOptions={{
        style: {
          borderRadius: "16px",
          border: "none",
          background: white,
          color: gray900,
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.10)",
          padding: 10,
          overflow: "hidden",
          width: "370px",
          minWidth: "320px",
          transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        },
        classNames: {
          toast: "group  flex items-start pl-5 pr-4 py-5 overflow-hidden shadow-xl border-0",
          title: "text-base font-bold text-gray-900 mb-0.5 mt-0",
          description: "text-sm  text-gray-600 mb-0.5 mt-0",
          actionButton: "bg-slate-900 text-white",
          cancelButton: "bg-slate-100 text-slate-900",
          closeButton: "absolute right-3 top-3 rounded-full w-7 h-7 flex items-center justify-center p-0 text-gray-400 opacity-80 hover:text-gray-700 hover:opacity-100 focus:opacity-100 focus:outline-none hover:bg-gray-100 transition-all duration-200",
          // success: `before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1.5 before:rounded-l-md before:bg-[${green}] [&>.my-toast-title]:text-gray-900`,
          // error: `before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1.5 before:rounded-l-md before:bg-[${red}] [&>.my-toast-title]:text-gray-900`,
          // warning: `before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1.5 before:rounded-l-md before:bg-[${yellow}] [&>.my-toast-title]:text-gray-900`,
          // info: `before:absolute before:top-0 before:left-0 before:bottom-0 before:w-1.5 before:rounded-l-md before:bg-[${blue}] [&>.my-toast-title]:text-gray-900`,
        },
      }}
      {...props}
    />
  );
};

// Custom toast functions with proper styling
const customToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      classNames: {
        toast: "success",
        title: "relative ml-[15px] my-toast-title",
      },
      icon: (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mr-4 mt-0.5">
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#22c55e"/><path d="M7 11.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      ),
      ...options,
    });
  },
  error: (message, options = {}) => {
    return toast.error(message, {
      classNames: {
        toast: "error",
        title: "relative ml-[15px] my-toast-title",
      },
      icon: (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mr-4 mt-0.5">
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#ef4444"/><path d="M8 8l6 6M14 8l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
      ),
      ...options,
    });
  },
  warning: (message, options = {}) => {
    return toast(message, {
      classNames: {
        toast: "warning",
        title: "relative ml-[15px] my-toast-title",
      },
      icon: (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 mr-4 mt-0.5">
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#facc15"/><path d="M11 7v5m0 3h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
      ),
      ...options,
    });
  },
  info: (message, options = {}) => {
    return toast.info(message, {
      classNames: {
        toast: "info",
        title: "relative ml-[15px] my-toast-title",
      },
      icon: (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-4 mt-0.5">
          <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#3b82f6"/><path d="M11 8v4m0 4h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
      ),
      ...options,
    });
  },
};

export { Toaster, toast, customToast };