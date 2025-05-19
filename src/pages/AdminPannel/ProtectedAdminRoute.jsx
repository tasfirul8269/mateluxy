import React from 'react';
import { useEffect, useState } from 'react';
import { isLoggedIn } from '../../utils/isLoggedIn';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { toast } from '@/components/AdminPannel/ui/sonner';

export const ProtectedAdminRoute = () => {
    const [authorized, setAuthorized] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        setAuthorized(loggedIn);
        
        if (!loggedIn) {
          // If not logged in, show message and redirect
          toast.error("Authentication required. Please log in.");
          navigate('/admin-login', { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthorized(false);
      } finally {
        setAuthChecked(true);
      }
      };
  
      checkAuth();
    
    // Set up periodic authentication check every 5 minutes
    const authInterval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(authInterval);
  }, [navigate]);
  
  if (!authChecked) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
  </div>;

  return authorized ? <Outlet /> : null; // Using null here as navigate is already called
};

export const PublicRoute = () => {
    const [authorized, setAuthorized] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        setAuthorized(loggedIn);
        
        if (loggedIn) {
          // If already logged in, redirect to admin panel
          navigate('/admin-pannel', { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthorized(false);
      }
      };
  
      checkAuth();
  }, [navigate]);
  
  if (authorized === null) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
  </div>;
  
  return !authorized ? <Outlet /> : null; // Using null as navigate is already called
};