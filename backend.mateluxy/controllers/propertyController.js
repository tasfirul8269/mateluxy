import Property from '../models/Property.js';

// Get all properties - with filtering options
export async function getAllProperties(req, res) {
  try {
    const { agent, includeAgent = 'true' } = req.query;
    
    // Build filter based on query parameters
    const filter = {};
    
    // If agent ID is provided, filter by agent
    if (agent) {
      console.log(`Filtering properties by agent: ${agent}`);
      filter.agent = agent;
    }
    
    console.log("Property filter:", filter);
    
    // Create query
    let query = Property.find(filter);
    
    // Populate agent data if requested
    if (includeAgent === 'true') {
      query = query.populate({
        path: 'agent',
        select: 'fullName profileImage languages position whatsapp contactNumber', // Added contact fields
        model: 'Agent'
      });
    }
    
    // Execute query
    const properties = await query;
    console.log(`Found ${properties.length} properties matching filter`);
    
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({ message: error.message });
  }
}

// Get a single property - simplified with clear error handling
export async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create a new property with agent linking
export async function createProperty(req, res) {
  try {
    console.log("Creating property with data:", req.body);
    
    // Ensure agent is provided
    if (!req.body.agent) {
      console.error("No agent ID provided in property creation");
      return res.status(400).json({ message: "Agent ID is required" });
    }
    
    const newProperty = await new Property(req.body).save();
    console.log(`Property created successfully with ID: ${newProperty._id} for agent: ${req.body.agent}`);
    
    res.status(201).json(newProperty);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(400).json({ message: error.message });
  }
}

// Update a property - simplified with single query
export async function updateProperty(req, res) {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete a property - simplified
export async function deleteProperty(req, res) {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}