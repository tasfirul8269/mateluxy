import Contact from '../models/contact.model.js';
import { errorHandler } from '../utils/erros.js';

// Create a new contact message
export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, interest, message, contactPreferences } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return next(errorHandler(400, 'Name, email and message are required'));
    }
    
    const newContact = new Contact({
      name,
      email,
      phone,
      interest,
      message,
      contactPreferences: {
        contactPhone: contactPreferences?.contactPhone || false,
        contactWhatsApp: contactPreferences?.contactWhatsApp || false,
        contactEmail: contactPreferences?.contactEmail || false
      }
    });
    
    await newContact.save();
    
    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      data: newContact
    });
  } catch (error) {
    console.error('Error in createContact:', error);
    next(error);
  }
};

// Get all contact messages (for admin)
export const getAllContacts = async (req, res, next) => {
  try {
    const { status, sort = '-createdAt' } = req.query;
    
    // Build filter based on query parameters
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    // Sort options
    const sortOptions = {};
    if (sort.startsWith('-')) {
      sortOptions[sort.substring(1)] = -1;
    } else {
      sortOptions[sort] = 1;
    }
    
    const contacts = await Contact.find(filter)
      .sort(sortOptions)
      .lean();
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error in getAllContacts:', error);
    next(error);
  }
};

// Get a single contact message by ID
export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return next(errorHandler(404, 'Contact message not found'));
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error in getContactById:', error);
    next(error);
  }
};

// Update contact status
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['new', 'in-progress', 'resolved'].includes(status)) {
      return next(errorHandler(400, 'Valid status is required'));
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return next(errorHandler(404, 'Contact message not found'));
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error in updateContactStatus:', error);
    next(error);
  }
};

// Delete a contact message
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return next(errorHandler(404, 'Contact message not found'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteContact:', error);
    next(error);
  }
};
