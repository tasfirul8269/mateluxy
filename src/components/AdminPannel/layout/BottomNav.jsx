import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Settings, MessageSquare, Calendar, Image } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();

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
      icon: Calendar,
      label: "Requests",
      href: "/admin-pannel/property-requests",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/admin-pannel/messages",
    },
    {
      icon: Settings,
      label: "More",
      href: "/admin-pannel/admins",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex md:hidden z-30">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center",
              isActive 
                ? "text-primary" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon size={24} className={cn(isActive ? "animate-bounce-once" : "")} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
