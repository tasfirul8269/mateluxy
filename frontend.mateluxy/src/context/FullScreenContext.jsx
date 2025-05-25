import React, { createContext, useState, useContext } from 'react';

// Create a context for managing full-screen state
const FullScreenContext = createContext();

// Provider component
export const FullScreenProvider = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [localFullScreenStates, setLocalFullScreenStates] = useState({});

  // Toggle full-screen state
  const toggleFullScreen = (componentId = null) => {
    if (componentId) {
      // Handle local fullscreen state
      setLocalFullScreenStates(prev => ({
        ...prev,
        [componentId]: !prev[componentId]
      }));
    } else {
      // Handle global fullscreen state
      setIsFullScreen(!isFullScreen);
      // When opening full-screen, make sure body doesn't scroll
      if (!isFullScreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  };

  // Set full-screen state directly
  const setFullScreen = (state, componentId = null) => {
    if (componentId) {
      // Handle local fullscreen state
      setLocalFullScreenStates(prev => ({
        ...prev,
        [componentId]: state
      }));
    } else {
      // Handle global fullscreen state
      setIsFullScreen(state);
      // Update body overflow based on state
      document.body.style.overflow = state ? 'hidden' : '';
    }
  };

  // Get fullscreen state for a component
  const getFullScreenState = (componentId = null) => {
    if (componentId) {
      return localFullScreenStates[componentId] || false;
    }
    return isFullScreen;
  };

  return (
    <FullScreenContext.Provider value={{ 
      isFullScreen, 
      toggleFullScreen, 
      setFullScreen,
      getFullScreenState 
    }}>
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
