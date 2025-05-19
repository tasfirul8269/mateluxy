import React, { useState, useEffect, useRef } from 'react';
import HeaderLogo from './HeaderLogo';
import HeaderNav from './HeaderNav';
import WhatsAppButton from './WhatsAppButton';

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
}

const Header = () => {
    const isMobile = useIsMobile();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);
    
    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // Disable scroll hiding when menu is open
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);
    
    // Track scroll direction and position with debouncing for better performance
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let scrollTimeout;
        
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;
            
            // Determine if we're scrolled down from the top
            if (currentScrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
            
            // Determine scroll direction with a minimum threshold to prevent jitter
            if (currentScrollY > lastScrollY + 5 && currentScrollY > 80) {
                // Scrolling down - only update if not already hidden
                if (isVisible) setIsVisible(false);
            } else if (currentScrollY < lastScrollY - 5 || currentScrollY <= 20) {
                // Scrolling up or at the top - only update if not already visible
                if (!isVisible) setIsVisible(true);
            }
            
            // Update last scroll position
            lastScrollY = currentScrollY;
        };
        
        // Use passive event listener for better performance
        const onScroll = () => {
            // Clear previous timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            // Set a small timeout to debounce the scroll event
            scrollTimeout = setTimeout(controlNavbar, 10);
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isVisible]);
    
    // Handle mobile menu body overflow
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileMenuOpen]);
    
    // Calculate header height for the spacer
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);
    
    // Measure the header height on mount and window resize
    useEffect(() => {
        // Function to update header height
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                // Get the actual rendered height
                const height = headerRef.current.offsetHeight;
                setHeaderHeight(height);
                
                // Also update CSS variable for global access
                document.documentElement.style.setProperty('--header-height', `${height}px`);
            }
        };
        
        // Initial measurement after a slight delay to ensure accurate rendering
        setTimeout(updateHeaderHeight, 100);
        
        // Update on resize
        window.addEventListener('resize', updateHeaderHeight);
        
        // Update when content or window changes that might affect height
        const resizeObserver = new ResizeObserver(updateHeaderHeight);
        if (headerRef.current) {
            resizeObserver.observe(headerRef.current);
        }
        
        return () => {
            window.removeEventListener('resize', updateHeaderHeight);
            resizeObserver.disconnect();
        };
    }, []);
    
    return (
        <>
            {/* Spacer div that takes up the same amount of space as the header */}
            <div className="w-full" style={{ height: `${headerHeight}px`, minHeight: '70px' }} />
            
            <header
                ref={headerRef}
                className={`fixed top-0 left-0 right-0 w-full z-[9998] ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'} ${isVisible ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-out will-change-transform`}
            >
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    <HeaderLogo />
                    
                    {isMobile ? (
                        <div className="flex items-center gap-4 ml-auto">
                            <WhatsAppButton />
                            <HeaderNav
                                isScrolled={isScrolled}
                                isMobileMenuOpen={isMobileMenuOpen}
                                setIsMobileMenuOpen={setIsMobileMenuOpen}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-6 ml-auto">
                            <HeaderNav
                                isScrolled={isScrolled}
                                isMobileMenuOpen={isMobileMenuOpen}
                                setIsMobileMenuOpen={setIsMobileMenuOpen}
                            />
                            <WhatsAppButton />
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;