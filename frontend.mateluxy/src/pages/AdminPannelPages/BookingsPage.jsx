import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Filter, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from "@/components/AdminPannel/ui/sonner";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/AdminPannel/ui/dialog";
import { Button } from "@/components/AdminPannel/ui/button";

const BookingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings from:', `${import.meta.env.VITE_API_URL}/api/bookings`);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings?page=${currentPage}&limit=10&search=${searchQuery}&status=${statusFilter}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      setBookings(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchQuery, statusFilter]);

  // Handle status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      const data = await response.json();
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? data.data : booking
      ));
      
      toast.success('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
      
      setBookings(bookings.filter(booking => booking._id !== bookingId));
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Property Viewing Bookings</h1>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                        <div className="text-sm text-gray-500">{booking.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.propertyTitle}</div>
                        <div className="text-sm text-gray-500">{booking.propertyAddress}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                      <div className="text-sm text-gray-500">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDialogOpen(true);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                          title="View Details"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Client Information</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.name}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.email}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Property Information</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.propertyTitle}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.propertyAddress}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Viewing Details</h4>
                <p className="mt-1 text-sm text-gray-900">
                  Date: {formatDate(selectedBooking.date)}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {selectedBooking.time}
                </p>
              </div>

              {selectedBooking.message && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Message</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.message}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking._id, 'confirmed');
                          setIsDialogOpen(false);
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking._id, 'cancelled');
                          setIsDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteBooking(selectedBooking._id);
                      setIsDialogOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage; 