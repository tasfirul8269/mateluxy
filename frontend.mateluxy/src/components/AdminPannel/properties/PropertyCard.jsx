import React, { useState } from "react";
import { MapPin, Building, Calendar, Bed, Bath, Move, Edit, Trash2, X } from "lucide-react";
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

export function PropertyCard({ property, onEdit, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Open dialog when clicking on the card but not on the buttons
  const handleCardClick = (e) => {
    // Prevent opening dialog if clicking on buttons
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <div 
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          {/* Tags on top */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            {property.type && (
              <span className={`
                px-4 py-1.5 bg-white rounded-full text-xs font-semibold
                ${property.type === 'Rent' ? 'text-green-600' : 
                 property.type === 'Buy' ? 'text-blue-600' :
                 property.type === 'Off Plan' ? 'text-purple-600' :
                 property.type === 'Commercial for Rent' ? 'text-amber-600' :
                 property.type === 'Commercial for Buy' ? 'text-orange-600' :
                 'text-gray-600'}
              `}>
                {property.type}
              </span>
            )}
            {/* Display tags for Off Plan properties */}
            {property.type === 'Off Plan' && property.tags && property.tags.map((tag, index) => (
              <span key={index} className="px-4 py-1.5 bg-white rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          
          {/* Property Image */}
          <div className="h-52 overflow-hidden">
            <img 
              src={property.imageUrl} 
              alt={property.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* Location on image bottom left */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1.5 bg-black bg-opacity-50 rounded-full text-xs font-medium text-white flex items-center">
              <MapPin size={12} className="mr-1 text-white flex-shrink-0" />
              {property.location || property.address?.split(',').pop()?.trim()}
            </span>
          </div>
        </div>
        
        <div className="p-5">
          {/* Title only - removed price */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{property.title}</h3>
          </div>
          {/* Address */}
          {property.type != 'Off Plan' && (
            <div className="mb-3 text-sm text-left text-gray-500">
              <span className="flex items-top text-ellipsis whitespace-wrap w-[80$] overflow-hidden justify-start">
                <MapPin size={16} className="mr-1.5 flex-shrink-0" />
                {property.address}
              </span>
            </div>
          )}
           {/* Off Plan Completion Date */}
           {property.type === 'Off Plan' && property.completionDate && (
            <div className="mb-3 text-sm text-left text-gray-500">
              <span className="flex items-center justify-start">
                <Calendar size={16} className="mr-1.5 flex-shrink-0" />
                Delivery: {new Date(property.completionDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
          
          {/* Developer for Off Plan - removed location */}
          {property.type === 'Off Plan' && property.developer && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Building size={16} className="mr-1.5 text-gray-400 flex-shrink-0" />
              <span>Developer: {property.developer}</span>
            </div>
          )}
          
          {/* Horizontal line */}
          <div className="border-t border-gray-100 my-3"></div>
          
          {/* Price display - Left aligned */}
          <div className="flex justify-start mb-4">
            <div className="text-left">
              <p className="text-blue-600 font-bold text-xl">{property.price}</p>
              {/* <p className="text-xs text-gray-500">{property.type === 'Rent' ? 'Per Month' : 'Price'}</p> */}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between items-center">
            <a 
              href={property.type === 'Off Plan' ? `/off-plan-single/${property.id}` : `/property-details/${property.id}`}
              className="px-5 py-2 bg-blue-50 text-blue-500 rounded-full text-sm font-medium"
            >
              View Details
            </a>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onEdit && onEdit(property.id)}
                className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete && onDelete(property.id)}
                className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">{property.title}</DialogTitle>
            <DialogDescription className="text-gray-500">
              {property.type === 'Off Plan' 
                ? `${property.developer} | ${property.location}`
                : property.address
              }
            </DialogDescription>
          </DialogHeader>

          {/* Property Image */}
          <div className="rounded-lg overflow-hidden h-64 mb-4">
            <img 
              src={property.imageUrl} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Property Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Always show price and type */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-lg font-bold text-blue-600">{property.price}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Type</p>
              <p className="text-lg font-semibold">{property.type}</p>
            </div>

            {/* Dynamically display basic property details */}
            {property.propertySize && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Size</p>
                <p className="text-lg font-semibold">{property.propertySize} sq.ft</p>
              </div>
            )}
            {property.propertyBedrooms && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="text-lg font-semibold">{property.propertyBedrooms}</p>
              </div>
            )}
            {property.propertyBathrooms && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="text-lg font-semibold">{property.propertyBathrooms}</p>
              </div>
            )}
            {property.propertyRooms && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Rooms</p>
                <p className="text-lg font-semibold">{property.propertyRooms}</p>
              </div>
            )}
            {property.propertyKitchen && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Kitchens</p>
                <p className="text-lg font-semibold">{property.propertyKitchen}</p>
              </div>
            )}
            {property.completionDate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="text-lg font-semibold">
                  {new Date(property.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            {property.propertyState && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">State/City</p>
                <p className="text-lg font-semibold">{property.propertyState}</p>
              </div>
            )}
            {property.propertyCountry && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Country</p>
                <p className="text-lg font-semibold">{property.propertyCountry}</p>
              </div>
            )}
          </div>

          {/* Additional Property Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.propertyZip && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Zip Code:</span>
                  <span className="font-medium">{property.propertyZip}</span>
                </div>
              )}
              {property.propertyType && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
              )}
              {property.propertyStatus && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{property.propertyStatus}</span>
                </div>
              )}
              {property.brokerFee !== undefined && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Broker Fee:</span>
                  <span className="font-medium">{property.brokerFee}%</span>
                </div>
              )}
              {property.developer && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Developer:</span>
                  <span className="font-medium">{property.developer}</span>
                </div>
              )}
              {property.latitude && property.longitude && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="font-medium">{property.latitude}, {property.longitude}</span>
                </div>
              )}
              {property.agent && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Agent:</span>
                  <span className="font-medium">{typeof property.agent === 'object' ? property.agent.fullName || property.agent.name : property.agent}</span>
                </div>
              )}
              {property.createdAt && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {property.updatedAt && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(property.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Description */}
          {property.propertyDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{property.propertyDescription}</p>
              </div>
            </div>
          )}

          {/* Property Features */}
          {property.propertyAmenities && property.propertyAmenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Amenities</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {property.propertyAmenities.map((amenity, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Property Images Gallery */}
          {property.propertyImages && property.propertyImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.propertyImages.slice(0, 6).map((image, index) => (
                  <div key={index} className="h-24 rounded-lg overflow-hidden">
                    <img src={image} alt={`Property ${index+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  onEdit && onEdit(property.id);
                }}
              >
                Edit Property
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setIsDialogOpen(false);
                  onDelete && onDelete(property.id);
                }}
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}