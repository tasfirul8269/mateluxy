import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { useSidebar } from '../context/SidebarContext';

const Layout = ({ children }) => {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen bg-[#F8F9FD]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <main className={`flex-1 flex flex-col h-screen transition-all duration-300 ${
        isExpanded ? 'lg:ml-[220px]' : 'lg:ml-[80px]'
      }`}>
        <TopBar />
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-20 lg:pb-6">
          {children}
        </div>
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </main>
    </div>
  );
};

export default Layout;