import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import { 
  LayoutGrid, 
  Users, 
  Phone, 
  Building2, 
  Image, 
  Code, 
  UserRound, 
  Settings, 
  ChevronsLeft 
} from 'lucide-react';

const Sidebar = () => {
  const { isExpanded, toggleSidebar } = useSidebar();

  const sidebarItems = [
    { id: 'general', label: 'General', path: '', category: 'header' },
    { id: 'dashboard', icon: <LayoutGrid size={20} />, label: 'Dashboard', path: '/dashboard' },
    { id: 'crm', icon: <Users size={20} />, label: 'CRM', path: '/crm' },
    { id: 'contact', icon: <Phone size={20} />, label: 'Contact Info', path: '/contact' },
    { id: 'manage', label: 'Manage', path: '', category: 'header' },
    { id: 'properties', icon: <Building2 size={20} />, label: 'Properties', path: '/properties' },
    { id: 'banners', icon: <Image size={20} />, label: 'Banners', path: '/banners' },
    { id: 'api', icon: <Code size={20} />, label: 'API', path: '/api' },
    { id: 'agents', icon: <Users size={20} />, label: 'Agents', path: '/agents', active: true },
    { id: 'settings', label: 'Settings', path: '', category: 'header' },
    { id: 'users', icon: <UserRound size={20} />, label: 'Users', path: '/users' },
    { id: 'settings-page', icon: <Settings size={20} />, label: 'Settings', path: '/settings' }
  ];

  return (
    <aside 
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-[220px]' : 'w-[80px]'
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        {isExpanded ? (
          <div className="flex items-center">
            <div className="text-red-600 font-bold flex items-center">
              <svg viewBox="0 0 100 100" className="w-8 h-8 mr-2">
                <path d="M50 0 L100 30 L100 70 L50 100 L0 70 L0 30 Z" fill="#e11d48" />
                <path d="M20 40 L50 20 L80 40 L80 60 L50 80 L20 60 Z" fill="white" />
              </svg>
              <div>
                <div className="text-sm">MATELUXY</div>
                <div className="text-[10px] uppercase tracking-wider">REAL ESTATE</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <svg viewBox="0 0 100 100" className="w-9 h-9">
              <path d="M50 0 L100 30 L100 70 L50 100 L0 70 L0 30 Z" fill="#e11d48" />
              <path d="M20 40 L50 20 L80 40 L80 60 L50 80 L20 60 Z" fill="white" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {sidebarItems.map((item) =>
          item.category === 'header' ? (
            isExpanded ? (
              <div key={item.id} className="px-4 pt-6 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {item.label}
              </div>
            ) : null
          ) : (
            <div
              key={item.id}
              className={`flex items-center px-4 py-3 ${
                item.active 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              } cursor-pointer transition-colors`}
            >
              <div className="flex items-center">
                {item.icon}
                {isExpanded && <span className="ml-3 text-sm">{item.label}</span>}
              </div>
            </div>
          )
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronsLeft 
            size={18} 
            className={`transform transition-transform ${!isExpanded ? 'rotate-180' : ''}`} 
          />
          {isExpanded && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;