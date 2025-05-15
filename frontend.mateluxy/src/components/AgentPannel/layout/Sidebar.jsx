import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LogOut, PlusCircle, MessageCircle, ChevronLeft, ChevronRight, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const [agentData, setAgentData] = useState(null);
  const [propertyCount, setPropertyCount] = useState(0);

  // Function to fetch agent properties and update count
  const fetchAgentProperties = async (agentId) => {
    try {
      console.log("Fetching properties for agent ID:", agentId);
      const propertiesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${agentId}`, {
        credentials: 'include',
      });
      
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        
        // Simply use the length of returned properties as the count
        // The API should already filter by agent ID
        setPropertyCount(propertiesData.length);
        console.log("Updated agent properties count:", propertiesData.length);
      }
    } catch (error) {
      console.error('Error fetching agent properties:', error);
    }
  };

  // Fetch agent data when component mounts
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Get agent data
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/auth-status`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setAgentData(data);
          
          // Fetch properties for this agent
          if (data && data._id) {
            await fetchAgentProperties(data._id);
          }
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      }
    };
    
    fetchAgentData();
    
    // Set up an interval to refresh property count every 30 seconds
    const intervalId = setInterval(() => {
      if (agentData?._id) {
        fetchAgentProperties(agentData._id);
      }
    }, 30000);
    
    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Update property count when location changes (e.g., after adding a property)
  useEffect(() => {
    if (agentData?._id) {
      fetchAgentProperties(agentData._id);
    }
  }, [location.pathname, agentData]);

  const handleLogout = async () => {
    try {
      document.cookie = 'agent_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/agent-login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 h-full transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col h-full relative">
        <div className={cn(
          "flex items-center justify-center h-16 border-b border-gray-200",
          !isOpen && "justify-center"
        )}>
          <span className={cn('text-xl font-semibold text-gray-800', !isOpen && 'hidden')}>
            Agent Panel
          </span>
          {!isOpen && (
            <span className="block text-xl font-semibold text-gray-800">AP</span>
          )}
        </div>

        {agentData && (
          <div className={cn(
            "flex flex-col items-center py-4 border-b border-gray-200",
            !isOpen && "lg:py-3"
          )}>
            <div className={cn(
              "rounded-full bg-gray-300 overflow-hidden mb-2",
              isOpen ? "w-16 h-16" : "lg:w-10 lg:h-10"
            )}>
              {agentData.profileImage ? (
                <img 
                  src={agentData.profileImage} 
                  alt={agentData.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-semibold">
                  {agentData.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isOpen && (
              <>
                <h3 className="text-sm font-semibold text-gray-800">{agentData.fullName}</h3>
                <p className="text-xs text-gray-500">{agentData.email}</p>
              </>
            )}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className={cn(
            "space-y-3",
            isOpen ? "px-3" : "px-0"
          )}>
            <li className="flex justify-center">
              <Link
                to="/agent-pannel/properties"
                className={cn(
                  'flex items-center transition-colors',
                  isOpen ? 'px-3 py-2 rounded-md w-full' : 'w-12 h-12 rounded-lg justify-center',
                  location.pathname.includes('/agent-pannel/properties')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Home size={20} className={cn(!isOpen && "mx-auto")} />
                {isOpen && <span className="ml-3">Properties</span>}
              </Link>
            </li>
           
            <li className="flex justify-center">
              <Link
                to="/agent-pannel/property-requests"
                className={cn(
                  'flex items-center transition-colors',
                  isOpen ? 'px-3 py-2 rounded-md w-full' : 'w-12 h-12 rounded-lg justify-center',
                  location.pathname.includes('/agent-pannel/property-requests')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <MessageCircle size={20} className={cn(!isOpen && "mx-auto")} />
                {isOpen && <span className="ml-3">Property Requests</span>}
              </Link>
            </li>

            <li className="flex justify-center">
              <Link
                to="/agent-pannel/profile"
                className={cn(
                  'flex items-center transition-colors',
                  isOpen ? 'px-3 py-2 rounded-md w-full' : 'w-12 h-12 rounded-lg justify-center',
                  location.pathname.includes('/agent-pannel/profile')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <User size={20} className={cn(!isOpen && "mx-auto")} />
                {isOpen && <span className="ml-3">My Profile</span>}
              </Link>
            </li>

            <li className="flex justify-center">
              <Link
                to="/agent-pannel/settings"
                className={cn(
                  'flex items-center transition-colors',
                  isOpen ? 'px-3 py-2 rounded-md w-full' : 'w-12 h-12 rounded-lg justify-center',
                  location.pathname.includes('/agent-pannel/settings')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Settings size={20} className={cn(!isOpen && "mx-auto")} />
                {isOpen && <span className="ml-3">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">My Listings</p>
                <p className="text-lg font-semibold text-gray-800">{propertyCount}</p>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "border-t border-gray-200",
          isOpen ? "p-4" : "p-2 flex justify-center"
        )}>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center text-red-600 transition-colors',
              isOpen ? 'w-full px-3 py-2 text-sm rounded-md hover:bg-red-50' : 'w-12 h-12 rounded-lg justify-center hover:bg-red-50'
            )}
          >
            <LogOut size={20} className={cn(!isOpen && "mx-auto")} />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
        
        {/* Collapse/Expand Button - Only visible on tablet and desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-1/2 transform -translate-y-1/2 items-center justify-center w-6 h-6 bg-white text-gray-500 border border-gray-200 rounded-full shadow-sm cursor-pointer hover:text-blue-600 transition-all"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
} 