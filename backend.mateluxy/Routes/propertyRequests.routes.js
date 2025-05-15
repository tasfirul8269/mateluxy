import express from 'express';
import { authMiddleware, adminAuthMiddleware } from '../middleware/auth.middleware.js';
import PropertyRequest from '../models/propertyRequest.model.js';
import mongoose from 'mongoose';

const router = express.Router();

// POST /api/property-requests - Create a new property request
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      countryCode, 
      phone, 
      propertyInfo, 
      privacyConsent, 
      marketingConsent 
    } = req.body;

    // Basic validation
    if (!name || !email || !countryCode || !phone || !propertyInfo || !privacyConsent) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Convert propertyId to ObjectId if provided as a string
    let propertyInfoWithId = propertyInfo;
    if (propertyInfo.propertyId && typeof propertyInfo.propertyId === 'string') {
      try {
        propertyInfoWithId = {
          ...propertyInfo,
          propertyId: mongoose.Types.ObjectId(propertyInfo.propertyId)
        };
      } catch (err) {
        console.log('Invalid propertyId format, keeping as string:', err.message);
      }
    }

    const newRequest = new PropertyRequest({
      name,
      email,
      countryCode,
      phone,
      propertyInfo: propertyInfoWithId,
      privacyConsent,
      marketingConsent
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Property request submitted successfully',
      data: newRequest
    });
  } catch (error) {
    console.error('Error creating property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit property request',
      error: error.message
    });
  }
});

// GET /api/property-requests - Get all property requests (for testing, removed admin auth middleware)
router.get('/', async (req, res) => {
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
        { 'propertyInfo.propertyTitle': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status) {
      filter.status = status;
    }

    // Count total documents for pagination
    const total = await PropertyRequest.countDocuments(filter);
    
    // Get documents with pagination, sorting, and filtering
    const propertyRequests = await PropertyRequest.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: propertyRequests,
      count: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching property requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property requests',
      error: error.message
    });
  }
});

// GET /api/property-requests/:id - Get a specific property request (for testing, removed admin auth middleware)
router.get('/:id', async (req, res) => {
  try {
    const propertyRequest = await PropertyRequest.findById(req.params.id);
    
    if (!propertyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: propertyRequest
    });
  } catch (error) {
    console.error('Error fetching property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property request',
      error: error.message
    });
  }
});

// PATCH /api/property-requests/:id - Update a property request (for testing, removed admin auth middleware)
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const propertyRequest = await PropertyRequest.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    
    if (!propertyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Property request updated successfully',
      data: propertyRequest
    });
  } catch (error) {
    console.error('Error updating property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property request',
      error: error.message
    });
  }
});

// DELETE /api/property-requests/:id - Delete a property request (for testing, removed admin auth middleware)
router.delete('/:id', async (req, res) => {
  try {
    const propertyRequest = await PropertyRequest.findByIdAndDelete(req.params.id);
    
    if (!propertyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Property request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property request',
      error: error.message
    });
  }
});

export default router; 