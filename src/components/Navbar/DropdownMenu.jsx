import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const DropdownMenu = ({ item, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentPath = window.location.pathname;
  const hasActiveChild = item.children?.some(child => 
    currentPath === child.path || currentPath.startsWith(child.path + '/')
  );

  const linkBaseClasses = `px-4 py-2 flex items-center gap-1 whitespace-nowrap transition-all duration-300`;
  const linkClasses = `
    ${linkBaseClasses} 
    ${isActive || hasActiveChild ? 'text-red-600' : 'text-gray-700 hover:text-red-600'} 
    relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 
    after:bg-red-600 after:transition-transform after:duration-300
    ${isActive || hasActiveChild ? 'after:scale-x-100' : 'after:scale-x-0 group-hover:after:scale-x-100'}
  `;

  return (
    <div 
      ref={dropdownRef} 
      className="relative  group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${linkClasses} font-medium`}
        aria-expanded={isOpen}
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`
          absolute top-full left-0 min-w-[240px] z-50 
          transition-all duration-300 ease-in-out origin-top-left
          bg-white border border-gray-100 shadow-lg rounded-lg
          group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
          opacity-0 scale-95 pointer-events-none
        `}
      >
        <div className="py-2">
          {item.children?.map((child, index) => {
            const isChildActive = currentPath === child.path || 
                                currentPath.startsWith(child.path + '/');
            return (
              <a
                key={index}
                href={child.path}
                className={`
                  block px-4 py-2 text-sm transition-all duration-300
                  ${isChildActive 
                    ? 'text-red-600 bg-red-50 pl-6' 
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600 hover:pl-6'}
                `}
              >
                {child.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;