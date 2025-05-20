import React, { createContext, useState, useContext } from 'react';

// Create a context for managing full-screen state
const FullScreenContext = createContext();

// Provider component
export const FullScreenProvider = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle full-screen state
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // When opening full-screen, make sure body doesn't scroll
    if (!isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Set full-screen state directly
  const setFullScreen = (state) => {
    setIsFullScreen(state);
    // Update body overflow based on state
    document.body.style.overflow = state ? 'hidden' : '';
  };

  return (
    <FullScreenContext.Provider value={{ isFullScreen, toggleFullScreen, setFullScreen }}>
      {children}
    </FullScreenContext.Provider>
  );
};

// Custom hook for using the context
export const useFullScreen = () => {
  const context = useContext(FullScreenContext);
  if (!context) {
    throw new Error('useFullScreen must be used within a FullScreenProvider');
  }
  return context;
};
