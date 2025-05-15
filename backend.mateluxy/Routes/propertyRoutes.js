import express from 'express';
import { getAllProperties, getPropertyById, createProperty, updateProperty, deleteProperty } from '../controllers/propertyController.js';

const router = express.Router();

// Property routes with /api/properties prefix
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', createProperty);  // Changed to standard path for consistency
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;