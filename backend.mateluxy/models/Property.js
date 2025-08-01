import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    // General Details
    propertyTitle: { type: String },
    propertyDescription: { type: String },
    propertyAddress: { type: String },
    propertyCountry: { type: String },
    propertyState: { type: String },
    propertyZip: { type: String },
    propertyFeaturedImage: { type: String },
    media: [{ type: String }], // links to images/videos

    // Category and Type
    category: { type: String, enum: ['Buy', 'Rent', 'Off Plan', 'Commercial for Buy', 'Commercial for Rent'] },
    propertyType: { type: String }, // e.g. Apartment, Villa, etc.
    
    // Price Details
    propertyPrice: { type: Number },
    numberOfCheques: { type: Number },
    brokerFee: { type: Number },
    
    // Rent-specific
    roiPercentage: { type: Number },
    
    // Off Plan-specific
    completionDate: { type: String },
    paymentPlan: { type: String },
    developer: { type: String },
    developerImage: { type: String }, // Added for off-plan
    launchType: { type: String },     // Added for off-plan
    brochureFile: { type: String },   // Added for off-plan
    shortDescription: { type: String }, // Added for off-plan
    exactLocation: { type: String },  // Added for off-plan
    tags: [{ type: String }], // Added for property tags, primarily for Off Plan
    exteriorsGallery: [{ type: String }], // Gallery of exterior images
    interiorsGallery: [{ type: String }], // Gallery of interior images
    
    // Payment Plan percentages
    afterBookingPercentage: { type: Number, default: 20 },      // Percentage to be paid after booking
    duringConstructionPercentage: { type: Number, default: 50 }, // Percentage to be paid during construction
    afterHandoverPercentage: { type: Number, default: 30 },      // Percentage to be paid after handover
    
    // Commercial-specific
    commercialType: { type: String },
    
    // Property Features
    propertySize: { type: Number }, // in sq ft
    propertyRooms: { type: Number },
    propertyBedrooms: { type: String }, // Changed to String to support formats like "5-6" or "Studio, 1 & 2"
    propertyKitchen: { type: Number },
    propertyBathrooms: { type: Number },
    
    // Legal and Agent
    dldPermitNumber: { type: String },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }, // Reference to Agent model
    dldQrCode: { type: String },
    
    // Location
    latitude: { type: Number },
    longitude: { type: Number },
    locationDescription: { type: String }, // Description of the location and surroundings
    
    // Features and Amenities
    features: [{ type: String }],
    amenities: [{ type: String }]
}, {
    timestamps: true
});

const Property = mongoose.model('Property', propertySchema);

export default Property;