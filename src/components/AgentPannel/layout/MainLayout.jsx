import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { NotificationHelper } from '../NotificationHelper';

export function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    fontPreference: 'default',
    accentColor: 'red'
  });

  // Load user settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('agent_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setUserSettings(parsedSettings);
        
        // Apply sidebar state from settings
        setIsSidebarOpen(!parsedSettings.sidebarCollapsed);
        
        // Apply theme
        if (parsedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (parsedSettings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else if (parsedSettings.theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        }
        
        // Apply font preference
        if (parsedSettings.fontPreference === 'serif') {
          document.documentElement.style.fontFamily = 'Georgia, serif';
        } else if (parsedSettings.fontPreference === 'mono') {
          document.documentElement.style.fontFamily = 'Monaco, monospace';
        } else {
          document.documentElement.style.fontFamily = '';
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    
    // Update the settings in localStorage when sidebar state changes
    const updatedSettings = {
      ...userSettings,
      sidebarCollapsed: isSidebarOpen
    };
    localStorage.setItem('agent_settings', JSON.stringify(updatedSettings));
    setUserSettings(updatedSettings);
  };

  return (
    <>
      {/* Invisible helper component to manage notifications */}
      <NotificationHelper />
      
      <div className={`flex h-screen ${userSettings.theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Sidebar only visible on desktop */}
        <div className="hidden lg:block">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopNav visible on all screen sizes */}
          <TopNav />
          
          <main className={`flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 ${
            userSettings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'
          }`}>
            <div className="container mx-auto">
              {children}
            </div>
          </main>

          {/* Bottom navigation for mobile */}
          <BottomNav />
        </div>
      </div>
    </>
  );
} 