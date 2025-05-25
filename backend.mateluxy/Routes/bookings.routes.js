import express from 'express';
import { authMiddleware, adminAuthMiddleware } from '../middleware/auth.middleware.js';
import Booking from '../models/booking.model.js';

const router = express.Router();

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      date,
      time,
      message,
      propertyId,
      propertyTitle,
      propertyAddress,
      agentId
    } = req.body;

    // Basic validation
    if (!name || !email || !phone || !date || !time || !propertyId || !propertyTitle || !propertyAddress || !agentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    const newBooking = new Booking({
      name,
      email,
      phone,
      date,
      time,
      message,
      propertyId,
      propertyTitle,
      propertyAddress,
      agentId
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit booking request',
      error: error.message
    });
  }
});

// GET /api/bookings - Get all bookings (admin only)
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build filter object
    const filter = {};
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status) {
      filter.status = status;
    }

    // Count total documents for pagination
    const total = await Booking.countDocuments(filter);
    
    // Get documents with pagination, sorting, and filtering
    const bookings = await Booking.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('propertyId', 'propertyTitle propertyAddress')
      .populate('agentId', 'name email');

    res.status(200).json({
      success: true,
      data: bookings,
      count: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// GET /api/bookings/:id - Get a specific booking
router.get('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('propertyId', 'propertyTitle propertyAddress')
      .populate('agentId', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// PATCH /api/bookings/:id - Update booking status
router.patch('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('propertyId', 'propertyTitle propertyAddress')
     .populate('agentId', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

// DELETE /api/bookings/:id - Delete a booking
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

export default router; 