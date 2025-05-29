import Property from '../models/Property.js';

// Get all properties - with filtering options
export async function getAllProperties(req, res) {
  try {
    const { agent, includeAgent = 'true', category, state, exclude, limit } = req.query;
    
    // Build filter based on query parameters
    const filter = {};
    
    // If agent ID is provided, filter by agent
    if (agent) {
      console.log(`Filtering properties by agent: ${agent}`);
      filter.agent = agent;
    }

    // If category is provided, filter by category
    if (category) {
      console.log(`Filtering properties by category: ${category}`);
      filter.category = category;
    }

    // If state is provided, filter by state
    if (state) {
      console.log(`Filtering properties by state: ${state}`);
      filter.propertyState = state;
    }

    // If exclude is provided, exclude that property
    if (exclude) {
      console.log(`Excluding property: ${exclude}`);
      filter._id = { $ne: exclude };
    }
    
    console.log("Property filter:", filter);
    
    // Create query
    let query = Property.find(filter);
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    // Populate agent data if requested
    if (includeAgent === 'true') {
      query = query.populate({
        path: 'agent',
        select: 'fullName profileImage languages position whatsapp contactNumber',
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

// Get a single property with agent data populated
export async function getPropertyById(req, res) {
  try {
    console.log(`Fetching property with ID: ${req.params.id}`);
    
    // Find property by ID and populate agent data
    const property = await Property.findById(req.params.id).populate({
      path: 'agent',
      select: 'fullName profileImage languages position whatsapp contactNumber email',
      model: 'Agent'
    });
    
    if (!property) {
      console.log(`Property not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Property not found' });
    }
    
    console.log(`Property found with ID: ${req.params.id}`);
    if (property.agent) {
      console.log(`Agent data included: ${property.agent._id}`);
    } else {
      console.log('No agent associated with this property');
    }
    
    res.status(200).json(property);
  } catch (error) {
    console.error(`Error fetching property: ${error.message}`);
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
    
    // Ensure propertyBedrooms and completionDate are always treated as strings
    const propertyData = { ...req.body };
    if (propertyData.propertyBedrooms !== undefined) {
      propertyData.propertyBedrooms = String(propertyData.propertyBedrooms);
      console.log("Converted propertyBedrooms to string:", propertyData.propertyBedrooms);
    }
    
    if (propertyData.completionDate !== undefined) {
      propertyData.completionDate = String(propertyData.completionDate);
      console.log("Converted completionDate to string:", propertyData.completionDate);
    }
    
    const newProperty = await new Property(propertyData).save();
    console.log(`Property created successfully with ID: ${newProperty._id} for agent: ${propertyData.agent}`);
    
    res.status(201).json(newProperty);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(400).json({ message: error.message });
  }
}

// Update a property - simplified with single query
export async function updateProperty(req, res) {
  try {
    // Ensure propertyBedrooms and completionDate are always treated as strings
    const propertyData = { ...req.body };
    if (propertyData.propertyBedrooms !== undefined) {
      propertyData.propertyBedrooms = String(propertyData.propertyBedrooms);
      console.log("Converted propertyBedrooms to string during update:", propertyData.propertyBedrooms);
    }
    
    if (propertyData.completionDate !== undefined) {
      propertyData.completionDate = String(propertyData.completionDate);
      console.log("Converted completionDate to string during update:", propertyData.completionDate);
    }
    
    const property = await Property.findByIdAndUpdate(req.params.id, propertyData, { new: true });
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