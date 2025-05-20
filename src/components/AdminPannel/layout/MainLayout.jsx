import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export function MainLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const location = useLocation();

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Dispatch a custom event that page components can listen for
    const searchEvent = new CustomEvent("search", { detail: query });
    window.dispatchEvent(searchEvent);
  };

  // Get page title based on current route
  const getCurrentPageTitle = () => {
    const pathname = location.pathname;
    
    if (pathname === "/agents") return "Agents";
    if (pathname === "/admins") return "Admins";
    return "Properties";
  };

  // Get search placeholder based on current route
  const getSearchPlaceholder = () => {
    const pathname = location.pathname;
    
    if (pathname === "/agents") return "Search agents by name, email or phone...";
    if (pathname === "/admins") return "Search admins by name, email or role...";
    return "Search properties by title, address or type...";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex w-full h-full">
        {!isMobile && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <Header 
            title={getCurrentPageTitle()} 
            searchPlaceholder={getSearchPlaceholder()}
            onSearch={handleSearch}
          />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
      </div>
      
      {isMobile && <BottomNav />}
    </div>
  );
}