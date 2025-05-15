import React from "react";
import { Button } from "@/components/AdminPannel/ui/button";
import { Building, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export const PropertyCategorySelector = ({ onSelectCategory }) => {
  return (
    <div className="bg-white py-6">
      <h2 className="text-lg font-semibold mb-4 text-center">Select Property Category</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Button
          onClick={() => onSelectCategory("Buy")}
          variant="outline"
          className={cn(
            "h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300",
          )}
        >
          <Home size={24} className="text-blue-600" />
          <span className="font-medium">Buy</span>
          <span className="text-xs text-gray-500">Properties for sale</span>
        </Button>
        
        <Button
          onClick={() => onSelectCategory("Rent")}
          variant="outline" 
          className={cn(
            "h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300",
          )}
        >
          <Home size={24} className="text-green-600" />
          <span className="font-medium">Rent</span>
          <span className="text-xs text-gray-500">Properties for rent</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Button
          onClick={() => onSelectCategory("Off Plan")}
          variant="outline"
          className={cn(
            "h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300",
          )}
        >
          <Home size={24} className="text-purple-600" />
          <span className="font-medium">Off Plan</span>
          <span className="text-xs text-gray-500">Properties under construction</span>
        </Button>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Commercial Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => onSelectCategory("Commercial for Buy")}
            variant="outline"
            className={cn(
              "h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-300",
            )}
          >
            <Building size={24} className="text-orange-600" />
            <span className="font-medium">Commercial for Buy</span>
            <span className="text-xs text-gray-500">Commercial properties for sale</span>
          </Button>
          
          <Button
            onClick={() => onSelectCategory("Commercial for Rent")}
            variant="outline"
            className={cn(
              "h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 hover:border-amber-300",
            )}
          >
            <Building size={24} className="text-amber-600" />
            <span className="font-medium">Commercial for Rent</span>
            <span className="text-xs text-gray-500">Commercial properties for rent</span>
          </Button>
        </div>
      </div>
    </div>
  );
};