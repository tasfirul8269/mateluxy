import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Settings, Building, Shield, MessageCircle, ChevronLeft, ChevronRight, MenuIcon, MessageSquare, Image, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/AdminPannel/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png"; // Adjust the path to your logo

const navItems = [
  {
    icon: Home,
    label: "Properties",
    href: "/admin-pannel/properties",
  },
  {
    icon: Users,
    label: "Agents",
    href: "/admin-pannel/agents",
  },
 
  {
    icon: MessageCircle,
    label: "Messages",
    href: "/admin-pannel/messages",
  },
  {
    icon: Calendar,
    label: "Property Requests",
    href: "/admin-pannel/property-requests",
  },
  {
    icon: Image,
    label: "Banners",
    href: "/admin-pannel/banners",
  },
  {
    icon: FileText,
    label: "News",
    href: "/admin-pannel/news",
  },
  {
    icon: Shield,
    label: "Admins",
    href: "/admin-pannel/admins",
  },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.aside
      className="h-[100vh] bg-white border-r border-gray-200 flex flex-col z-10"
      initial={{ width: expanded ? "16rem" : "5rem" }}
      animate={{ width: expanded ? "16rem" : "5rem" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
            key="full-logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center"
          >
            <img className="w-15" src={logo} alt="LOGO" />
            <div className="ml-2">
              <h3 className="text-[18px] font-bold tracking-tight text-[#000000]">
                MATELUXY
              </h3>
              <p className="text-[13px] uppercase tracking-widest text-black">
                REAL ESTATE
              </p>
            </div>
          </motion.div>
          ) : (
            <motion.div
            key="short-logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center"
          >
            <img className="w-15" src={logo} alt="LOGO" />
          
          </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center py-3 px-3 rounded-lg transition-all duration-200",
                    expanded ? "justify-start" : "justify-center",
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(isActive && "animate-pulse-once", !expanded && "mx-auto")}
                  />
                  {expanded && (
                    <motion.span
                      className="ml-3 text-sm font-medium whitespace-nowrap"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse/Expand Button at the bottom */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-center py-2 hover:text-white text-gray-600 hover:bg-red-500 rounded-md transition-colors ",
            expanded && "justify-between"
          )}
        >
          {expanded ? (
            <>
              <span className="text-sm">Collapse</span>
              <ChevronLeft size={18} />
            </>
          ) : (
            <ChevronRight size={18} />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}