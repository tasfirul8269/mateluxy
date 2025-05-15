import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    // General Details
    propertyTitle: { type: String, required: true },
    propertyDescription: { type: String, required: true },
    propertyAddress: { type: String, required: true },
    propertyCountry: { type: String, required: true },
    propertyState: { type: String, required: true },
    propertyZip: { type: String, required: true },
    propertyFeaturedImage: { type: String, required: true },
    media: [{ type: String }], // links to images/videos

    // Category and Type
    category: { type: String, required: true, enum: ['Buy', 'Rent', 'Off Plan', 'Commercial for Buy', 'Commercial for Rent'] },
    propertyType: { type: String, required: true }, // e.g. Apartment, Villa, etc.
    
    // Price Details
    propertyPrice: { type: Number, required: true },
    numberOfCheques: { type: Number },
    brokerFee: { type: Number, required: true },
    
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
    duringConstructionPercentage: { type: Number, default: 50 }, // Percentage to be paid during construction
    onCompletionPercentage: { type: Number, default: 50 },     // Percentage to be paid on completion
    
    // Commercial-specific
    commercialType: { type: String },
    
    // Property Features
    propertySize: { type: Number, required: true }, // in sq ft
    propertyRooms: { type: Number, required: true },
    propertyBedrooms: { type: Number, required: true },
    propertyKitchen: { type: Number, required: true },
    propertyBathrooms: { type: Number, required: true },
    
    // Legal and Agent
    dldPermitNumber: { type: String, required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }, // Reference to Agent model
    dldQrCode: { type: String, required: true },
    
    // Location
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    
    // Features and Amenities
    features: [{ type: String }],
    amenities: [{ type: String }]
}, {
    timestamps: true
});

const Property = mongoose.model('Property', propertySchema);

export default Property;