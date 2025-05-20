import React, { useState } from 'react';
import { LayoutGrid, Users, Phone, Building2, MoreHorizontal, X } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const MobileNav = () => {
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { icon: <LayoutGrid size={24} />, label: 'Dashboard' },
    { icon: <Users size={24} />, label: 'CRM' },
    { icon: <Phone size={24} />, label: 'Contact' },
    { icon: <Building2 size={24} />, label: 'Properties' },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex justify-between items-center">
          {mainItems.map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <MoreHorizontal size={24} />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {showMore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">More Options</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {useSidebar().sidebarItems
                .filter(item => !item.category && !mainItems.find(main => main.label === item.label))
                .map((item, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-red-600"
                  >
                    {item.icon}
                    <span className="text-xs mt-2">{item.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;