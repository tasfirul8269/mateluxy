import React, { useState } from "react";
import { Mail, Phone, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AgentFormDialog } from "./AgentFormDialog";
import { AgentProfileDialog } from "./AgentProfileDialog";
import { convertS3UrlToProxyUrl } from "../../../utils/s3UrlConverter";

export function AgentCard({ agent, onAgentUpdated, onAgentDeleted }) {
  const [imgError, setImgError] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.fullName)}&background=random`;

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agent.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      toast.success('Agent deleted successfully');
      if (onAgentDeleted) {
        onAgentDeleted(agent.id);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = () => {
    setIsProfileDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
        {/* Edit and Delete buttons */}
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
          <button
            className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
            onClick={handleEdit}
            disabled={isDeleting}
            title="Edit Agent"
          >
            <Edit size={16} />
          </button>
          <button
            className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-sm"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Agent"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Card Content */}
        <div className="flex flex-col items-center p-6">
          {/* Profile Image */}
          <div className="mb-4">
            <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-white shadow-sm">
              <img
                src={imgError ? defaultImage : (agent.profileImage ? convertS3UrlToProxyUrl(agent.profileImage) : defaultImage)}
                alt={agent.fullName}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          </div>

          {/* Agent Name and Title */}
          <div className="text-center  mb-2">
            <h3 className="text-xl font-bold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap inline-block max-w-[200px] align-middle">
              {agent.fullName}
            </h3>
            <p className="text-gray-600">{agent.position || "Real Estate Agent"}</p>
          </div>

          {/* Property Count */}
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
              {agent.listings || 0} Properties
            </span>
          </div>

          {/* Contact Information */}
          <div className="w-full space-y-3 mb-5">
            <div className="flex items-center justify-center text-gray-600 w-full px-4">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
              <span className="text-sm truncate max-w-full overflow-hidden">{agent.email}</span>
            </div>
            <div className="flex items-center justify-center text-gray-600 w-full px-4">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
              <span className="text-sm truncate">{agent.contactNumber || "+1 (555) 123-4567"}</span>
            </div>
          </div>

          {/* View Profile Button */}
          <button
            onClick={handleViewProfile}
            className="w-full text-center text-purple-600 hover:text-purple-800 font-medium py-2 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>

      <AgentFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        agent={agent}
        onAgentUpdated={onAgentUpdated}
        isEditing={true}
      />

      <AgentProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        agentId={agent.id}
      />
    </>
  );
}