import React, { useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import Header from '../components/Navbar';
import { FullScreenProvider, useFullScreen } from '../context/FullScreenContext';

// Inner component that uses the context
const LayoutContent = () => {
    const { isFullScreen } = useFullScreen();
    const location = useLocation();
    
    // Scroll to top whenever the route changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <div>
            {/* Only show header when not in full-screen mode */}
            {!isFullScreen && <Header />}
            <Outlet />
            {!isFullScreen && <Footer />}
        </div>
    );
};

const Layout = () => {
    return (
        <FullScreenProvider>
            <LayoutContent />
        </FullScreenProvider>
    );
};

export default Layout;