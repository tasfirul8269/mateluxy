import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-20 lg:hidden">
      <div className="flex items-center justify-around">
        <Link
          to="/agent-pannel/properties"
          className={cn(
            'flex flex-col items-center p-2',
            location.pathname.includes('/agent-pannel/properties')
              ? 'text-blue-600'
              : 'text-gray-500'
          )}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Properties</span>
        </Link>

        <Link
          to="/agent-pannel/property-requests"
          className={cn(
            'flex flex-col items-center p-2',
            location.pathname.includes('/agent-pannel/property-requests')
              ? 'text-blue-600'
              : 'text-gray-500'
          )}
        >
          <MessageCircle size={24} />
          <span className="text-xs mt-1">Requests</span>
        </Link>

        <Link
          to="/agent-pannel/profile"
          className={cn(
            'flex flex-col items-center p-2',
            location.pathname.includes('/agent-pannel/profile')
              ? 'text-blue-600'
              : 'text-gray-500'
          )}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>

        <Link
          to="/agent-pannel/settings"
          className={cn(
            'flex flex-col items-center p-2',
            location.pathname.includes('/agent-pannel/settings')
              ? 'text-blue-600'
              : 'text-gray-500'
          )}
        >
          <Settings size={24} />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
} 