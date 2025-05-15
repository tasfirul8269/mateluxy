import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminFormDialog } from "./AdminFormDialog";
import { convertS3UrlToProxyUrl } from "../../../utils/s3UrlConverter";

export function AdminCard({ admin, onAdminUpdated, onAdminDeleted }) {
  const [imgError, setImgError] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.fullName)}&background=random`;

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${admin.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      toast.success('Admin deleted successfully');
      
      if (onAdminDeleted) {
        onAdminDeleted(admin.id);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="p-5 flex items-center">
          <div className="relative">
            <img 
              src={imgError ? defaultImage : (admin.profileImage ? convertS3UrlToProxyUrl(admin.profileImage) : defaultImage)}
              alt={admin.fullName} 
              className="w-14 h-14 rounded-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{admin.fullName}</h3>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                  onClick={handleEdit}
                  disabled={isDeleting}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mt-1">{admin.email}</p>
            
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-xs text-gray-500">
                Username: {admin.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AdminFormDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        admin={admin}
        onAdminUpdated={onAdminUpdated}
        isEditing={true}
      />
    </>
  );
}