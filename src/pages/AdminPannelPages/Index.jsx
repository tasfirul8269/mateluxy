import React from 'react';
import { Navigate } from 'react-router-dom';

// This component simply redirects to the PropertiesPage which is now our main page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
