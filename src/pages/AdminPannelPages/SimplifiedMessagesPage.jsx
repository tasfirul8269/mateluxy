import React, { useState, useEffect } from "react";

// Simple MessagesPage implementation without complex UI dependencies
const SimplifiedMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        console.log("Fetching messages from:", `${apiUrl}/api/messages`);
        
        const response = await fetch(`${apiUrl}/api/messages`, {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('access_token') ? {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            } : {})
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Messages data:", data);
        
        if (data.success) {
          setMessages(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch messages");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">New</span>;
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">In Progress</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Resolved</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Unknown</span>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      ) : messages.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No messages found</h3>
          <p className="text-gray-500">No contact messages have been received yet</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map(message => (
                <tr key={message._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{message.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{message.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">{message.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(message.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(message.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SimplifiedMessagesPage; 