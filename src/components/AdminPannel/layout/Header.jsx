import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, LogOut, Settings, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/AdminPannel/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/AdminPannel/ui/popover";
import { Button } from "@/components/AdminPannel/ui/button";
import { toast } from "@/components/AdminPannel/ui/sonner";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { propertyApi, agentApi, adminApi } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/AdminPannel/ui/dialog";
import { Label } from "@/components/AdminPannel/ui/label";
import { Input } from "@/components/AdminPannel/ui/input";
import { logout } from "@/utils/isLoggedIn";
import { motion } from "framer-motion";
import { uploadFileToS3 } from "@/utils/s3Upload.js";
import { convertS3UrlToProxyUrl } from "@/utils/s3UrlConverter.js";

export function Header({ searchPlaceholder, onSearch }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
    previewImage: "",
    selectedFile: null
  });
  
  // Add notification filter state
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine page title and search placeholder based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/properties')) return 'Properties';
    if (path.includes('/agents')) return 'Agents';
    if (path.includes('/admins')) return 'Admins';
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/messages')) return 'Messages';
    
    // Default title or extract from the path
    return 'Admin Panel';
  };
  
  // Get dynamic search placeholder based on current page
  const getDynamicPlaceholder = () => {
    const path = location.pathname;
    
    if (path.includes('admin-pannel/properties')) return 'Search for properties...';
    if (path.includes('admin-pannel/agents')) return 'Search for agents...';
    if (path.includes('admin-pannel/admins')) return 'Search for admins...';
    if (path.includes('admin-pannel/dashboard')) return 'Search dashboard...';
    
    // Default placeholder
    return 'Search...';
  };
  
  // Check if search should be hidden on current page
  const shouldHideSearch = () => {
    const path = location.pathname;
    return path.includes('/messages');
  };
  
  // Get the current page title
  const pageTitle = getPageTitle();
  
  // Add state for selected notification and dialog
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Filter notifications based on the selected filter
  useEffect(() => {
    if (notifications.length > 0) {
      switch (notificationFilter) {
        case 'unread':
          setFilteredNotifications(notifications.filter(n => !n.read));
          break;
        case 'properties':
          setFilteredNotifications(notifications.filter(n => n.type && n.type.startsWith('PROPERTY')));
          break;
        default:
          setFilteredNotifications(notifications);
      }
    } else {
      setFilteredNotifications([]);
    }
  }, [notifications, notificationFilter]);
  
  // Calculate counts for each filter category
  const getFilterCounts = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    const propertiesCount = notifications.filter(n => n.type && n.type.startsWith('PROPERTY')).length;
    
    return {
      all: notifications.length,
      unread: unreadCount,
      properties: propertiesCount
    };
  };
  
  // Get counts for the filter tabs
  const filterCounts = getFilterCounts();
  
  // Load notifications from service
  useEffect(() => {
    // Initial load of notifications
    loadNotifications();
    
    // Listen for notification events to update the UI
    const handleNotificationEvent = (event) => {
      console.log("Notification event received in Header:", event.detail);
      loadNotifications();
    };
    
    window.addEventListener('notification', handleNotificationEvent);
    
    // Poll for notifications every 30 seconds as a fallback
    const intervalId = setInterval(() => {
      console.log("Polling for notifications");
      loadNotifications();
    }, 30000);
    
    return () => {
      window.removeEventListener('notification', handleNotificationEvent);
      clearInterval(intervalId);
    };
  }, []);
  
  // Function to load notifications
  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      // Get notifications from the service (which now communicates with backend)
      const allNotifications = await getNotifications();
      console.log("Loaded notifications in Header:", allNotifications);
      setNotifications(allNotifications);
      
      // Get the unread count
      const unreadNotificationCount = getUnreadCount();
      setUnreadCount(unreadNotificationCount);
      
      // Update filtered notifications based on current filter
      // This will be handled by the filter effect, but we'll set empty initially
      if (allNotifications.length === 0) {
        setFilteredNotifications([]);
      }
      
      // If we have the selected notification open in the dialog, update its read status
      if (selectedNotification && isDetailDialogOpen) {
        const updatedNotification = allNotifications.find(n => n.id === selectedNotification.id);
        if (updatedNotification) {
          setSelectedNotification(updatedNotification);
        } else {
          // If the notification was deleted or cleared, close the dialog
          setIsDetailDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Even on error, ensure we reset the state if needed
      setUnreadCount(0);
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };
  
  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoadingAdminData(true);
      try {
        // Use the correct endpoint path based on how routes are registered in the backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          method: 'GET',
          credentials: 'include', // Important to send cookies
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin profile');
        }

        const data = await response.json();
        
        if (data.success && data.admin) {
          // Extract first name from fullName for the avatar
          const nameParts = data.admin.fullName.split(' ');
          const firstName = nameParts[0] || '';
          
          const adminDetails = {
            id: data.admin._id,
            fullName: data.admin.fullName,
            firstName: firstName,
            
            email: data.admin.email,
            username: data.admin.username,
            role: data.admin.role || 'Administrator',
            profileImage: data.admin.profileImage || '',
            adminId: data.admin.adminId
          };
          
          setAdminData(adminDetails);
          setFormData({
            fullName: adminDetails.fullName || '',
            email: adminDetails.email || '',
            username: adminDetails.username || '',
            password: '',
            confirmPassword: '',
            profileImage: adminDetails.profileImage || '',
            previewImage: null,
            selectedFile: null
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // Fallback to default data if fetch fails
        setAdminData({
          fullName: "Admin User",
          firstName: "Admin",
          email: "admin@example.com",
          role: "Administrator",
          profileImage: ""
        });
        
        // Also set form data with defaults
        setFormData({
          fullName: "Admin User",
          email: "admin@example.com",
          username: "admin",
          password: '',
          confirmPassword: '',
          profileImage: '',
          previewImage: null,
          selectedFile: null
        });
      } finally {
        setIsLoadingAdminData(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  // Fetch dynamic suggestions based on current location and search value
  useEffect(() => {
    if (!searchValue || searchValue.length < 2) {
      // Don't fetch suggestions for very short queries
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const pathname = location.pathname;
        
        if (pathname.includes("properties") || pathname === "/") {
          // Fetch property suggestions
          const properties = await propertyApi.getProperties();
          
          // Create suggestions from property titles
          const titleSuggestions = properties
            .filter(p => p.propertyTitle?.toLowerCase().includes(searchValue.toLowerCase()))
            .slice(0, 5)
            .map(p => ({ id: p._id, value: p.propertyTitle, type: "property" }));
          
          // Create suggestions from property addresses
          const addressSuggestions = properties
            .filter(p => p.propertyAddress?.toLowerCase().includes(searchValue.toLowerCase()))
            .slice(0, 3)
            .map(p => ({ id: `addr-${p._id}`, value: p.propertyAddress, type: "address" }));
          
          // Create suggestions from property types
          const typeSuggestions = [...new Set(
            properties
              .filter(p => p.propertyType?.toLowerCase().includes(searchValue.toLowerCase()))
              .map(p => p.propertyType)
          )]
            .slice(0, 3)
            .map((type, i) => ({ id: `type-${i}`, value: type, type: "type" }));
          
          // Create suggestions from locations
          const locationSuggestions = [...new Set(
            properties
              .filter(p => p.propertyState?.toLowerCase().includes(searchValue.toLowerCase()))
              .map(p => p.propertyState)
          )]
            .slice(0, 3)
            .map((location, i) => ({ id: `loc-${i}`, value: location, type: "location" }));
          
          // Combine suggestions
          setSuggestions([
            ...titleSuggestions,
            ...addressSuggestions,
            ...typeSuggestions,
            ...locationSuggestions
          ]);
        } 
        else if (pathname.includes("agents")) {
          // Fetch agents from API
          const agents = await agentApi.getAgents();
          
          // Create suggestions from agent names
          const nameSuggestions = agents
            .filter(a => a.fullName?.toLowerCase().includes(searchValue.toLowerCase()))
            .map(a => ({ id: a._id, value: a.fullName, type: "name" }));
          
          // Create suggestions from agent emails
          const emailSuggestions = agents
            .filter(a => a.email?.toLowerCase().includes(searchValue.toLowerCase()))
            .map(a => ({ id: `email-${a._id}`, value: a.email, type: "email" }));
          
          // Create suggestions from agent phone numbers
          const phoneSuggestions = agents
            .filter(a => a.contactNumber?.includes(searchValue))
            .map(a => ({ id: `phone-${a._id}`, value: a.contactNumber, type: "phone" }));
          
          // Combine suggestions
          setSuggestions([...nameSuggestions, ...emailSuggestions, ...phoneSuggestions]);
        } 
        else if (pathname.includes("admins")) {
          // Fetch admins from API
          const admins = await adminApi.getAdmins();
          
          // Create suggestions from admin names
          const nameSuggestions = admins
            .filter(a => a.fullName?.toLowerCase().includes(searchValue.toLowerCase()))
            .map(a => ({ id: a._id, value: a.fullName, type: "name" }));
          
          // Create suggestions from admin emails
          const emailSuggestions = admins
            .filter(a => a.email?.toLowerCase().includes(searchValue.toLowerCase()))
            .map(a => ({ id: `email-${a._id}`, value: a.email, type: "email" }));
          
          // Create suggestions from admin usernames
          const usernameSuggestions = admins
            .filter(a => a.username?.toLowerCase().includes(searchValue.toLowerCase()))
            .map(a => ({ id: `user-${a._id}`, value: a.username, type: "username" }));
          
          // Combine suggestions
          setSuggestions([...nameSuggestions, ...emailSuggestions, ...usernameSuggestions]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    
    // Debounce the fetch to prevent too many API calls
    const timeoutId = setTimeout(fetchSuggestions, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchValue, location.pathname]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue);
    setShowSuggestions(false);
    if (searchValue.trim()) {
      toast.success(`Searching for "${searchValue}"`);
    }
  };

  const handleSelectSuggestion = (value) => {
    setSearchValue(value);
    onSearch(value);
    setShowSuggestions(false);
    toast.success(`Searching for "${value}"`);
  };

  // Handle notification click to show details
  const handleNotificationClick = (notification) => {
    // Set the selected notification and open the dialog
    setSelectedNotification(notification);
    setIsDetailDialogOpen(true);
    
    // Close the notifications popover
    setIsNotificationsOpen(false);
  };
  
  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      await markAllAsRead();
      await loadNotifications(); // Reload notifications after marking all as read
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Reset body styles when settings dialog closes to prevent UI lockup
  useEffect(() => {
    if (!isSettingsOpen) {
      // Short timeout to ensure the dialog has fully closed
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Use the centralized logout utility
      const success = await logout();
      
      if (success) {
        toast.success("Signed out successfully");
      } else {
        throw new Error('Failed to sign out');
      }
      
      // Force client-side logout by redirecting
      setTimeout(() => {
        navigate('/admin-login'); // Redirect to login page
      }, 500);
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if the server-side logout fails, we'll still redirect
      toast.error("Failed to sign out properly, redirecting anyway");
      setTimeout(() => {
        navigate('/admin-login');
      }, 500);
    }
  };

  // Handle settings form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile image change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show a temporary preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, previewImage: reader.result }));
      };
      reader.readAsDataURL(file);
      
      try {
        // Upload the file to S3
        const imageUrl = await uploadFileToS3(file, 'admins/');
        setFormData(prev => ({ 
          ...prev, 
          profileImage: imageUrl,
          selectedFile: file
        }));
        console.log("Image uploaded to S3:", imageUrl);
      } catch (error) {
        console.error("Error uploading image to S3:", error);
        toast.error("Failed to upload image. Please try again.");
      }
    }
  };

  // Handle settings form submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!adminData?.id) return;
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.username) {
      toast.error("Full name, email, and username are required");
      return;
    }
    
    // Validate passwords if entered
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data to send
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        profileImage: formData.profileImage
      };
      
      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // IMPORTANT FIX: Check backend/index.js to see that adminsRouter is mounted at /api not /api/admins
      // This means the PUT route for updating admins is at /api/{id} not /api/admins/{id}
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${adminData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Check if the response is JSON before parsing
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        } else {
          // If not JSON, use the status text
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Check if the response is JSON before parsing
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error('Invalid response format from server');
      }
      
      // Update local admin data state
      setAdminData(prev => ({
        ...prev,
        fullName: data.fullName || formData.fullName,
        firstName: (data.fullName || formData.fullName).split(' ')[0] || '',
        email: data.email || formData.email,
        username: data.username || formData.username,
        profileImage: data.profileImage || formData.profileImage || prev.profileImage
      }));
      
      toast.success("Profile updated successfully");
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time for display (fallback if time not provided)
  const formatNotificationTime = (notification) => {
    if (notification.time) {
      return notification.time;
    }
    
    if (notification.timestamp || notification.createdAt) {
      try {
        const date = new Date(notification.timestamp || notification.createdAt);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return date.toLocaleDateString();
      } catch (e) {
        return 'Recently';
      }
    }
    
    return 'Recently';
  };

  // Helper function to get color class based on notification type
  const getNotificationColorClass = (notification) => {
    if (!notification || !notification.type) return "bg-gray-100 text-gray-500";
    
    // Get the entity type from the notification type (e.g., PROPERTY_ADDED -> PROPERTY)
    const type = notification.type.split('_')[0]; 
    
    switch (type) {
      case 'PROPERTY':
        return "bg-green-100 text-green-600";
      case 'AGENT':
        return "bg-blue-100 text-blue-600";
      case 'ADMIN':
        return "bg-purple-100 text-purple-600";
      case 'SYSTEM':
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // Get notification title based on type
  const getNotificationTitle = (notification) => {
    if (notification.title) return notification.title;
    
    if (!notification.type) return "Notification";
    
    const parts = notification.type.split('_');
    if (parts.length !== 2) return "Notification";
    
    const entity = parts[0].charAt(0) + parts[0].slice(1).toLowerCase();
    const action = parts[1].charAt(0) + parts[1].slice(1).toLowerCase();
    
    return `${entity} ${action}`;
  };
  
  // Get appropriate icon for notification
  const getNotificationIcon = (notification) => {
    if (notification.icon) return notification.icon;
    
    if (!notification.type) return "📢";
    
    const type = notification.type.split('_')[0];
    const action = notification.type.split('_')[1];
    
    // Default icons based on entity type and action
    switch (type) {
      case 'PROPERTY':
        return action === 'ADDED' ? "🏠" : (action === 'DELETED' ? "🗑️" : "🔄");
      case 'AGENT':
        return action === 'ADDED' ? "👤" : (action === 'DELETED' ? "🗑️" : "🔄");
      case 'ADMIN':
        return action === 'ADDED' ? "👑" : (action === 'DELETED' ? "🗑️" : "🔄");
      default:
        return "📢";
    }
  };

  // Function to handle filter change
  const handleFilterChange = (filter) => {
    setNotificationFilter(filter);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{pageTitle}</h1>

      <div className="flex items-center space-x-3 sm:space-x-6">
        {!shouldHideSearch() ? (
          <div className="relative">
            <form 
              onSubmit={handleSearchSubmit}
              className={cn(
                "relative flex items-center transition-all duration-300 bg-gray-100 rounded-full overflow-hidden",
                isSearchFocused 
                  ? 'w-40 sm:w-64 md:w-80 ring-2 ring-red-500' 
                  : 'w-40 sm:w-48 hover:bg-gray-200'
              )}
            >
              <Search 
                size={18} 
                className="absolute left-3 text-gray-500" 
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={getDynamicPlaceholder()}
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full py-2 pl-10 pr-4 bg-transparent text-sm outline-none text-gray-700"
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchValue) setShowSuggestions(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50 animate-fade-in">
                {isLoadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2"></div>
                    Loading suggestions...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-64 overflow-auto">
                    {suggestions.map(suggestion => (
                      <li 
                        key={suggestion.id}
                        onClick={() => handleSelectSuggestion(suggestion.value)}
                        className="px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center justify-between"
                      >
                        <span>{suggestion.value}</span>
                        <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchValue.length < 2 ? "Type at least 2 characters" : "No suggestions found"}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[10px] text-white font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[380px] p-0 mr-4 shadow-xl border border-gray-200 rounded-xl overflow-hidden"
            align="end"
            sideOffset={8}
          >
            {/* Header with title and actions */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
              <div className="flex justify-between items-center px-4 py-3">
                <h3 className="font-semibold text-lg text-gray-900">Notifications</h3>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                    disabled={!notifications.some(n => !n.read)}
                  >
                    Mark all read
                  </Button>
                </div>
              </div>
              
              {/* Filter tabs */}
              <div className="flex border-b border-gray-100">
                <button 
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
                    notificationFilter === 'all' 
                      ? "text-gray-900 border-blue-500" 
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                  {filterCounts.all > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full text-xs bg-gray-100 px-1.5 min-w-[1.25rem] h-5">
                      {filterCounts.all}
                    </span>
                  )}
                </button>
                <button 
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
                    notificationFilter === 'unread' 
                      ? "text-gray-900 border-blue-500" 
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handleFilterChange('unread')}
                >
                  Unread
                  {filterCounts.unread > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full text-xs bg-blue-100 text-blue-700 px-1.5 min-w-[1.25rem] h-5">
                      {filterCounts.unread}
                    </span>
                  )}
                </button>
                <button 
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
                    notificationFilter === 'properties' 
                      ? "text-gray-900 border-blue-500" 
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handleFilterChange('properties')}
                >
                  Properties
                  {filterCounts.properties > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full text-xs bg-green-100 text-green-700 px-1.5 min-w-[1.25rem] h-5">
                      {filterCounts.properties}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Notification list */}
            <div className="bg-gray-50 max-h-[400px] overflow-y-auto">
              {isLoadingNotifications && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
              
              {!isLoadingNotifications && filteredNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map(notification => (
                    <motion.div 
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "p-4 flex gap-3 hover:bg-gray-100/50 transition-all cursor-pointer",
                        notification.read ? "bg-white" : "bg-blue-50/50"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Notification icon with color */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        getNotificationColorClass(notification)
                      )}>
                        <span className="text-lg">{getNotificationIcon(notification)}</span>
                      </div>
                      
                      {/* Notification content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 text-sm truncate pr-4">
                            {getNotificationTitle(notification)}
                          </h4>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 my-0.5">{notification.message}</p>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span>{formatNotificationTime(notification)}</span>
                          {notification.entityName && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="truncate max-w-[150px]">{notification.entityName}</span>
                            </>
                          )}
                          {notification.createdByName && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="truncate max-w-[100px]">By: {notification.createdByName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell size={24} className="text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    {notificationFilter === 'all' && "No notifications yet"}
                    {notificationFilter === 'unread' && "No unread notifications"}
                    {notificationFilter === 'properties' && "No property notifications"}
                  </h4>
                  <p className="text-sm text-gray-500 max-w-[250px]">
                    {notificationFilter === 'all' && "When you get notifications, they'll show up here"}
                    {notificationFilter === 'unread' && "You've read all your notifications"}
                    {notificationFilter === 'properties' && "No property updates to show"}
                  </p>
                  {notificationFilter !== 'all' && (
                    <button
                      className="mt-4 px-4 py-1.5 rounded-md bg-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => handleFilterChange('all')}
                    >
                      View all notifications
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer with link to all notifications */}
            <div className="bg-white border-t border-gray-100 p-3">
              <button 
                onClick={() => {
                  // Close the popover and navigate to all notifications
                  setIsNotificationsOpen(false);
                  // You could add navigate("/admin/notifications") here if you have a dedicated page
                }}
                className="w-full py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                View All Notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-200 p-0">
              {!isLoadingAdminData && adminData?.profileImage ? (
                <img 
                  src={convertS3UrlToProxyUrl(adminData.profileImage)} 
                  alt={adminData?.fullName || 'Admin'} 
                  className="rounded-full object-cover w-full h-full"
                  onError={(e) => {
                    console.error("Error loading admin image:", e);
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData?.firstName || 'A')}&background=random`;
                  }}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
                  {isLoadingAdminData ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    adminData?.firstName?.[0]?.toUpperCase() || 'A'
                  )}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white rounded-md p-0 overflow-hidden" align="end">
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
              <div className="h-12 w-12 rounded-full overflow-hidden border">
                {adminData?.profileImage ? (
                  <img 
                    src={convertS3UrlToProxyUrl(adminData.profileImage)} 
                    alt={adminData.fullName} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error("Error loading admin image:", e);
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.firstName || 'A')}&background=random`;
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {adminData?.firstName?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{adminData?.fullName || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{adminData?.email || 'admin@example.com'}</p>
              </div>
            </div>
            
            <div className="py-2">
              <DropdownMenuItem 
                className="cursor-pointer px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={16} className="mr-2 text-blue-500" />
                <span>Account Settings</span>
            </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
                onClick={handleSignOut}
              >
              <LogOut size={16} className="mr-2" />
                <span>Sign Out</span>
            </DropdownMenuItem>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 text-xs text-center text-gray-500 border-t border-gray-100">
              <p>Admin Panel v1.2.0</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Account Settings</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProfile} className="grid gap-4 py-4">
            <div className="flex justify-center mb-2">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                {(formData.previewImage || formData.profileImage) ? (
                  <img 
                    src={formData.previewImage || (formData.profileImage ? convertS3UrlToProxyUrl(formData.profileImage) : '')} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <User size={40} className="text-gray-400" />
                  </div>
                )}
                <label 
                  htmlFor="profileImage" 
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Change
                </label>
                <input 
                  type="file" 
                  id="profileImage" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleFormChange} 
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleFormChange} 
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                value={formData.username} 
                onChange={handleFormChange} 
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Leave blank to keep current" 
                  value={formData.password} 
                  onChange={handleFormChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  disabled={!formData.password}
                  value={formData.confirmPassword} 
                  onChange={handleFormChange} 
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}