import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import DropdownMenu from '@/components/Navbar/DropdownMenu';
import { Menu, X } from 'lucide-react';

const navigation = [
  { label: 'Buy', path: '/buy' },
  { label: 'Rent', path: '/rent' },
  {
    label: 'Off Plan',
    path: '/off-plan',
    children: [
        { label: 'About', path: '/off-plan/about' },
        { label: 'Off Plan Properties', path: '/off-plan-properties' },
        { label: 'Developers', path: '/off-plan/developers' },
    ],
  },
  {
    label: 'Commercial',
    path: '/commercial',
    children: [
      { label: 'Commercial Properties for Buy', path: '/commercial/buy' },
      { label: 'Commercial Properties for Rent', path: '/commercial/rent' },
    ],
  },
  { label: 'Contact', path: '/contact' },
  { label: 'Team', path: '/our-team' },
  { label: 'News', path: '/news' },

];

const HeaderNav = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const currentPath = window.location.pathname;
  const [mobileMenuPortal, setMobileMenuPortal] = React.useState(null);
  
  // Create a portal container for the mobile menu
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof document !== 'undefined') {
      // Create or get the portal container
      let portalContainer = document.getElementById('mobile-menu-portal');
      if (!portalContainer) {
        portalContainer = document.createElement('div');
        portalContainer.id = 'mobile-menu-portal';
        portalContainer.style.position = 'fixed';
        portalContainer.style.top = '0';
        portalContainer.style.left = '0';
        portalContainer.style.width = '100%';
        portalContainer.style.height = '100%';
        portalContainer.style.zIndex = '999999';
        portalContainer.style.pointerEvents = 'none';
        document.body.appendChild(portalContainer);
      }
      setMobileMenuPortal(portalContainer);
    }
    
    return () => {
      // Clean up the portal container on unmount
      if (typeof document !== 'undefined') {
        const portalContainer = document.getElementById('mobile-menu-portal');
        if (portalContainer && portalContainer.childNodes.length === 0) {
          document.body.removeChild(portalContainer);
        }
      }
    };
  }, []);
  
  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const linkBaseClasses = `px-4 py-2 transition-all duration-300 whitespace-nowrap`;
  const linkClasses = (active) => `
    ${linkBaseClasses} 
    ${active ? 'text-red-600' : 'text-gray-700 hover:text-red-600'} 
    relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 
    after:bg-red-600 after:transition-transform after:duration-300
    ${active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
  `;

  return (
    <>
      <nav className="hidden lg:flex items-center space-x-1">
        {navigation.map((item, index) => (
          item.children ? (
            <DropdownMenu key={index} item={item} isActive={isActive(item.path)} />
          ) : (
            <a 
              key={index} 
              href={item.path} 
              className={`${linkClasses(isActive(item.path))} font-medium`}
            >
              {item.label}
            </a>
          )
        ))}
      </nav>

      <button
        className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 ml-0"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        style={{ zIndex: 10001 }} // Ensure button is above everything
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Menu Button - Always visible */}
      
      {/* Mobile Menu Portal Content */}
      {mobileMenuPortal && ReactDOM.createPortal(
        <>
          {/* Mobile Menu Overlay */}
          <div 
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ zIndex: 999998 }}
          />

          {/* Mobile Menu */}
          <div 
            className={`
              fixed top-0 right-0 h-full w-[300px] max-w-[90vw] bg-white shadow-2xl lg:hidden
              transform transition-all duration-300 ease-in-out
              ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{ 
              willChange: 'transform', 
              zIndex: 999999,
              pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
            }}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-primary-600 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto p-6">
              {navigation.map((item, index) => (
                <div key={index} className="py-2 border-b border-gray-100">
                  {item.children ? (
                    <>
                      <div className={`text-lg font-medium mb-2 ${isActive(item.path) ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className="pl-4 space-y-2">
                        {item.children.map((child, childIndex) => (
                          <a 
                            key={childIndex} 
                            href={child.path} 
                            className={`
                              block py-1 transition-all duration-200
                              ${isActive(child.path) 
                                ? 'text-red-600 pl-6' 
                                : 'text-gray-600 hover:text-red-600 hover:pl-6'}
                            `}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <a 
                      href={item.path} 
                      className={`
                        block text-lg font-medium py-1 transition-all duration-200
                        ${isActive(item.path)
                          ? 'text-red-600 pl-2'
                          : 'text-gray-900 hover:text-red-600 hover:pl-2'}
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>,
        mobileMenuPortal
      )}
    </>
  );
};

export default HeaderNav;