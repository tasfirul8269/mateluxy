import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, X, MessageCircle, BellOff, Settings, CheckCircle2, Eye, MoreHorizontal, Trash2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  isPushNotificationSupported, 
  getNotificationPermissionStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '@/utils/pushNotifications';

export function TopNav() {
  const [agentData, setAgentData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationActionsOpen, setIsNotificationActionsOpen] = useState(false);
  const [propertyRequests, setPropertyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentProperties, setAgentProperties] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [supportsPushNotifications, setSupportsPushNotifications] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'unread', 'read'
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const actionDropdownRef = useRef(null);

  // Check push notification capability and status on load
  useEffect(() => {
    // Check if push notifications are supported
    const pushSupported = isPushNotificationSupported();
    setSupportsPushNotifications(pushSupported);
    
    if (pushSupported) {
      // Check current permission status
      const permission = getNotificationPermissionStatus();
      setNotificationPermission(permission);
      
      // Check if service worker is active and has a subscription
      if (permission === 'granted') {
        checkPushSubscription();
      }
      
      // Register for service worker state changes
      navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker is ready');
      });
    }
  }, []);

  // Check if there's an active push subscription
  const checkPushSubscription = async () => {
    if (!isPushNotificationSupported()) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsPushEnabled(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  // Handle toggle push notifications
  const togglePushNotifications = async () => {
    if (!supportsPushNotifications) {
      toast.error('Push notifications are not supported in your browser');
      return;
    }
    
    if (isPushEnabled) {
      // Unsubscribe
      const result = await unsubscribeFromPushNotifications();
      if (result.success) {
        setIsPushEnabled(false);
        toast.success('Push notifications disabled');
      } else {
        toast.error(`Failed to disable push notifications: ${result.message}`);
      }
    } else {
      // Subscribe
      const result = await subscribeToPushNotifications();
      if (result.success) {
        setIsPushEnabled(true);
        setNotificationPermission('granted');
        toast.success('Push notifications enabled');
      } else {
        toast.error(`Failed to enable push notifications: ${result.message}`);
        // Update permission status
        setNotificationPermission(getNotificationPermissionStatus());
      }
    }
  };

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/auth-status`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setAgentData(data);
          
          // Fetch agent properties and property requests when agent data loads
          if (data && data._id) {
            await fetchAgentProperties(data._id);
          }
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      }
    };
    
    fetchAgentData();
    
    // Set up polling for new property requests
    const intervalId = setInterval(() => {
      if (agentData?._id) {
        fetchAgentProperties(agentData._id, true); // true = silent refresh
      }
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch properties assigned to this agent
  const fetchAgentProperties = async (agentId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const propertiesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?agent=${agentId}`, {
        credentials: 'include',
      });
      
      if (!propertiesRes.ok) {
        throw new Error('Failed to fetch agent properties');
      }
      
      const propertiesData = await propertiesRes.json();
      setAgentProperties(propertiesData);
      
      // Now fetch property requests for these properties
      await fetchPropertyRequests(propertiesData, silent);
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      if (!silent) toast.error('Failed to load properties');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch property requests related to the agent's properties
  const fetchPropertyRequests = async (properties, silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      if (!properties || properties.length === 0) {
        setPropertyRequests([]);
        setUnreadCount(0);
        if (!silent) setLoading(false);
        return;
      }
      
      // Get all property IDs assigned to this agent
      const propertyIds = properties.map(property => property._id);
      
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Fetch all property requests
      const response = await fetch(`${apiUrl}/api/property-requests`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Filter requests to only include those for properties assigned to this agent
        const filteredRequests = data.data.filter(request => 
          propertyIds.includes(request.propertyInfo?.propertyId)
        );
        
        // Sort by date - newest first
        filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const oldRequests = propertyRequests;
        setPropertyRequests(filteredRequests);
        
        // Count new (unread) requests
        const newCount = filteredRequests.filter(req => req.status === 'new').length;
        setUnreadCount(newCount);
        
        // Notify about new requests if not the initial load
        if (oldRequests.length > 0 && !silent) {
          const newRequests = filteredRequests.filter(
            req => !oldRequests.some(oldReq => oldReq._id === req._id)
          );
          
          if (newRequests.length > 0) {
            toast.success(`You have ${newRequests.length} new property request(s)!`);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching property requests:", err);
      if (!silent) toast.error("Failed to load property requests");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (requestId) => {
    try {
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/property-requests/${requestId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'contacted' })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Update local state
      setPropertyRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: 'contacted' } : req
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Marked notification as read');
    } catch (error) {
      console.error('Error marking request as read:', error);
      toast.error('Failed to update notification status');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const newRequests = propertyRequests.filter(req => req.status === 'new');
      
      if (newRequests.length === 0) {
        toast.info('No new notifications to mark as read');
        return;
      }
      
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Create array of promises for each request update
      const updatePromises = newRequests.map(req => 
        fetch(`${apiUrl}/api/property-requests/${req._id}/status`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'contacted' })
        })
      );
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Update local state
      setPropertyRequests(prev => prev.map(req => 
        req.status === 'new' ? { ...req, status: 'contacted' } : req
      ));
      
      // Reset unread count
      setUnreadCount(0);
      
      toast.success('Marked all notifications as read');
      
      // Close action dropdown
      setIsNotificationActionsOpen(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  // Delete all read notifications (This is a client-side only function as the API might not support this)
  const deleteAllRead = () => {
    try {
      // Filter out notifications that are 'contacted' (read) or 'completed'
      const newRequests = propertyRequests.filter(req => req.status === 'new');
      
      if (newRequests.length === propertyRequests.length) {
        toast.info('No read notifications to delete');
        return;
      }
      
      setPropertyRequests(newRequests);
      toast.success('Deleted all read notifications');
      
      // Close action dropdown
      setIsNotificationActionsOpen(false);
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
        setIsNotificationActionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, notificationsRef, actionDropdownRef]);

  const handleLogout = async () => {
    try {
      document.cookie = 'agent_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/agent-login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleRefresh = () => {
    if (agentData?._id) {
      fetchAgentProperties(agentData._id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">New</span>;
      case 'contacted':
        return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Contacted</span>;
      case 'completed':
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>;
      default:
        return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Unknown</span>;
    }
  };
  
  // Filter notifications based on selected filter
  const getFilteredNotifications = () => {
    switch(notificationFilter) {
      case 'unread':
        return propertyRequests.filter(req => req.status === 'new');
      case 'read':
        return propertyRequests.filter(req => req.status !== 'new');
      default:
        return propertyRequests;
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 bg-white">
      {/* Logo or title */}
      <div className="font-semibold text-lg text-gray-800">Agent Panel</div>
      
      {/* Right side with notifications and profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 flex items-center justify-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </button>
          
          {/* Notifications Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-[350px] bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
              {/* Header */}
              <div className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {/* Filter dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationActionsOpen(!isNotificationActionsOpen)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {isNotificationActionsOpen && (
                      <div 
                        ref={actionDropdownRef}
                        className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 text-sm"
                      >
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                          Filter
                        </div>
                        <button
                          onClick={() => setNotificationFilter('all')}
                          className={`flex w-full items-center px-3 py-1.5 ${notificationFilter === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <Filter size={14} className="mr-2 opacity-70" />
                          All notifications
                        </button>
                        <button
                          onClick={() => setNotificationFilter('unread')}
                          className={`flex w-full items-center px-3 py-1.5 ${notificationFilter === 'unread' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <Eye size={14} className="mr-2 opacity-70" />
                          Unread only
                        </button>
                        <button
                          onClick={() => setNotificationFilter('read')}
                          className={`flex w-full items-center px-3 py-1.5 ${notificationFilter === 'read' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <CheckCircle2 size={14} className="mr-2 opacity-70" />
                          Read only
                        </button>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                          Actions
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="flex w-full items-center px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                          >
                            <CheckCircle2 size={14} className="mr-2 opacity-70" />
                            Mark all as read
                          </button>
                        )}
                        <button
                          onClick={deleteAllRead}
                          className="flex w-full items-center px-3 py-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} className="mr-2 opacity-70" />
                          Clear read notifications
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleRefresh}
                    className="text-xs text-blue-600 hover:text-blue-700"
                    disabled={loading}
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {/* Notifications List */}
              <div className="bg-gray-50 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : getFilteredNotifications().length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {getFilteredNotifications().slice(0, 10).map(request => (
                      <div key={request._id} className="relative">
                        <Link
                          to="/agent-pannel/property-requests"
                          className={cn(
                            "p-4 flex gap-3 hover:bg-gray-100/50 transition-all cursor-pointer",
                            request.status === 'new' ? "bg-blue-50/50" : "bg-white"
                          )}
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            if (request.status === 'new') {
                              markAsRead(request._id);
                            }
                          }}
                        >
                          {/* Notification icon */}
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                            <MessageCircle className="h-5 w-5" />
                          </div>
                          
                          {/* Notification content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                Request from {request.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                {request.status === 'new' && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                              {request.propertyInfo?.propertyTitle}
                            </p>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                              <span>{formatDate(request.createdAt)}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                        </Link>
                        
                        {/* Mark as read button for new notifications */}
                        {request.status === 'new' && (
                          <button
                            onClick={() => markAsRead(request._id)}
                            className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-green-600"
                            title="Mark as read"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle size={24} className="text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">No {notificationFilter !== 'all' ? notificationFilter : ''} notifications</h4>
                    <p className="text-sm text-gray-500 max-w-[250px]">
                      {notificationFilter === 'all' && 'When you receive property inquiries, they\'ll show up here'}
                      {notificationFilter === 'unread' && 'You have no unread notifications'}
                      {notificationFilter === 'read' && 'You have no read notifications'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Push Notification Banner */}
              {supportsPushNotifications && notificationPermission !== 'granted' && (
                <div className="bg-blue-50 p-3 border-t border-blue-100">
                  <p className="text-xs text-blue-800 mb-2">
                    Enable push notifications to receive alerts even when the app is closed.
                  </p>
                  <button
                    onClick={togglePushNotifications}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    Enable Push Notifications
                  </button>
                </div>
              )}
              
              {/* Footer */}
              <div className="bg-white p-3 border-t border-gray-100 text-center">
                <Link
                  to="/agent-pannel/property-requests"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setIsNotificationsOpen(false)}
                >
                  View all requests
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        {agentData && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                {agentData.profileImage ? (
                  <img 
                    src={agentData.profileImage} 
                    alt={agentData.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-sm font-semibold">
                    {agentData.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <Link
                  to="/agent-pannel/profile"
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                
                <Link
                  to="/agent-pannel/settings"
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}