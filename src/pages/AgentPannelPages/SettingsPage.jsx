import React, { useState, useEffect } from 'react';
import { 
  Bell, Settings, Moon, Sun, PaintBucket, Eye, 
  AlignLeft, Palette, Save, Loader2, Monitor 
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/AdminPannel/ui/button';
import { useLocation } from 'react-router-dom';
import {
  isPushNotificationSupported,
  getNotificationPermissionStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '@/utils/pushNotifications';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [supportsPushNotifications, setSupportsPushNotifications] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    notificationsEnabled: true,
    pushNotificationsEnabled: false,
    fontPreference: 'default',
    accentColor: 'red'
  });
  
  // Check notification permissions on component mount
  useEffect(() => {
    // Check if push notifications are supported
    const pushSupported = isPushNotificationSupported();
    setSupportsPushNotifications(pushSupported);
    
    if (pushSupported) {
      // Check current permission status
      const permission = getNotificationPermissionStatus();
      setNotificationPermission(permission);
      
      // If permission is not granted, disable push notifications in settings
      if (permission !== 'granted') {
        setSettings(prev => ({
          ...prev,
          pushNotificationsEnabled: false
        }));
      }
    }
  }, []);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('agent_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = async () => {
    setLoading(true);
    
    try {
      // If push notifications are toggled on, request permission and subscribe
      if (settings.pushNotificationsEnabled && notificationPermission !== 'granted') {
        if (supportsPushNotifications) {
          const result = await subscribeToPushNotifications();
          if (result.success) {
            setNotificationPermission('granted');
            toast.success('Push notifications enabled');
          } else {
            // If subscription failed, update the settings to reflect the actual state
            setSettings(prev => ({
              ...prev,
              pushNotificationsEnabled: false
            }));
            
            toast.error(`Failed to enable push notifications: ${result.message}`);
            // Return early to prevent saving the incorrect settings
            setLoading(false);
            return;
          }
        } else {
          toast.error('Push notifications are not supported in your browser');
          setSettings(prev => ({
            ...prev,
            pushNotificationsEnabled: false
          }));
          setLoading(false);
          return;
        }
      }
      // If push notifications are toggled off, unsubscribe
      else if (!settings.pushNotificationsEnabled && notificationPermission === 'granted') {
        const result = await unsubscribeFromPushNotifications();
        if (!result.success) {
          toast.error(`Failed to disable push notifications: ${result.message}`);
        }
      }
      
      // Save updated settings to localStorage
      localStorage.setItem('agent_settings', JSON.stringify(settings));
      
      // Apply settings immediately
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
      
      // Apply font preference
      if (settings.fontPreference === 'serif') {
        document.documentElement.style.fontFamily = 'Georgia, serif';
      } else if (settings.fontPreference === 'mono') {
        document.documentElement.style.fontFamily = 'Monaco, monospace';
      } else {
        document.documentElement.style.fontFamily = '';
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle settings
  const handleToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  // Handle select settings
  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="container max-w-5xl mx-auto pt-8 pb-16">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
        <Button
          onClick={saveSettings}
          className="bg-red-600 hover:bg-red-700 gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>Save Settings</span>
        </Button>
      </div>

      {/* Settings Content */}
      <div className="space-y-8">
        {/* Appearance Settings */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-800">Appearance</h3>
          </div>
          
          <div className="space-y-6">
            {/* Theme Setting */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Theme</label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSelectChange('theme', 'light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    settings.theme === 'light'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                
                <button
                  onClick={() => handleSelectChange('theme', 'dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
                
                <button
                  onClick={() => handleSelectChange('theme', 'system')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    settings.theme === 'system'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Monitor size={16} />
                  <span>System</span>
                </button>
              </div>
            </div>
            
            {/* Accent Color Setting */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Accent Color</label>
              <div className="flex flex-wrap gap-3">
                {['red', 'blue', 'green', 'purple', 'orange'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleSelectChange('accentColor', color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      settings.accentColor === color
                        ? 'border-gray-900 ring-2 ring-offset-2'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`${color} accent color`}
                  />
                ))}
              </div>
            </div>
            
            {/* Font Preference */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Font</label>
              <select
                value={settings.fontPreference}
                onChange={(e) => handleSelectChange('fontPreference', e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default (Inter)</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlignLeft className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Layout</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Collapsed Sidebar</h4>
                <p className="text-sm text-gray-500">Keep the sidebar collapsed by default</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.sidebarCollapsed}
                  onChange={() => handleToggle('sidebarCollapsed')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-amber-600" />
            <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">In-App Notifications</h4>
                <p className="text-sm text-gray-500">Show notifications for property requests inside the app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notificationsEnabled}
                  onChange={() => handleToggle('notificationsEnabled')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Push Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive notifications even when the app is closed
                  {!supportsPushNotifications && (
                    <span className="block text-red-500 text-xs mt-1">
                      Not supported in your browser
                    </span>
                  )}
                  {supportsPushNotifications && notificationPermission === 'denied' && (
                    <span className="block text-red-500 text-xs mt-1">
                      Notifications blocked by browser. Please update your browser settings.
                    </span>
                  )}
                </p>
              </div>
              <label className={`relative inline-flex items-center ${!supportsPushNotifications || notificationPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.pushNotificationsEnabled}
                  onChange={() => handleToggle('pushNotificationsEnabled')}
                  disabled={!supportsPushNotifications || notificationPermission === 'denied'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 