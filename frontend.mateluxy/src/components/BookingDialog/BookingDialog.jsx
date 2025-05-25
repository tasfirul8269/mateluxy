import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/AdminPannel/ui/dialog";
import { Button } from "@/components/AdminPannel/ui/button";
import { Input } from "@/components/AdminPannel/ui/input";
import { Label } from "@/components/AdminPannel/ui/label";
import { Textarea } from "@/components/AdminPannel/ui/textarea";
import { toast } from "@/components/AdminPannel/ui/sonner";
import axios from 'axios';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatPrice';
import { useFullScreen } from '../../context/FullScreenContext';
import { motion } from 'framer-motion';

const BookingDialog = ({ isOpen, onClose, property }) => {
  const { setFullScreen } = useFullScreen();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update fullscreen state when dialog opens/closes
  useEffect(() => {
    setFullScreen(isOpen);
  }, [isOpen, setFullScreen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        {
          ...formData,
          propertyId: property._id,
          propertyTitle: property.propertyTitle,
          propertyAddress: property.propertyAddress,
          agentId: property.agentId || property.agent?._id
        },
        { withCredentials: true }
      );

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        message: ''
      });

      // Close dialog after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] [&>header]:hidden">
        <DialogHeader>
          <DialogTitle>Book a Viewing</DialogTitle>
          <DialogDescription>
            Fill in your details to schedule a property viewing
          </DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center"
          >
            <div className="bg-green-50 p-4 rounded-2xl text-green-600 flex items-center justify-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg font-medium">Booking request submitted successfully!</span>
            </div>
            <p className="text-gray-600">
              Your viewing for {property.propertyTitle} has been scheduled for {new Date(formData.date).toLocaleDateString()} at {formData.time}. We will contact you shortly to confirm your appointment.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any specific requirements or questions?"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Book Viewing'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
