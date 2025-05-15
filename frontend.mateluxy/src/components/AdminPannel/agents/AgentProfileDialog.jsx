import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/AdminPannel/ui/dialog";
import { Mail, Phone, MapPin, Languages, Facebook, Twitter, Instagram, Linkedin, Globe, MessageSquare, Edit, Trash2, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { AgentFormDialog } from "./AgentFormDialog";
import { convertS3UrlToProxyUrl } from "../../../utils/s3UrlConverter";

export function AgentProfileDialog({ open, onOpenChange, agentId }) {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultImage = agent 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.fullName)}&background=random`
    : "";

  useEffect(() => {
    if (open && agentId) {
      fetchAgentDetails();
    }
  }, [open, agentId]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }
      
      const data = await response.json();
      
      // Process the agent data to ensure image URLs are properly proxied
      if (data) {
        // Process profile image to use proxy
        if (data.profileImage) {
          data.profileImage = convertS3UrlToProxyUrl(data.profileImage);
        }
        
        // Process vcard to use proxy with special vCard handling
        if (data.vcard) {
          data.vcard = convertS3UrlToProxyUrl(data.vcard, { isVCard: true });
        }
        
        setAgent(data);
      }
    } catch (error) {
      console.error('Error fetching agent details:', error);
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

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
      onOpenChange(false); // Close the dialog
      // We should refresh the agents list or notify the parent component
      window.location.reload();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAgentUpdated = (updatedAgent) => {
    setAgent(updatedAgent);
    fetchAgentDetails(); // Refresh data after update
  };

  // Helper function to get display name for social platform
  const getSocialPlatformName = (url) => {
    if (url.includes('facebook')) return 'Facebook';
    if (url.includes('twitter') || url.includes('x.com')) return 'Twitter';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('linkedin')) return 'LinkedIn';
    return 'Website';
  };

  // Helper function to get icon for social platform
  const getSocialIcon = (url) => {
    if (url.includes('facebook')) return <Facebook className="h-4 w-4" />;
    if (url.includes('twitter') || url.includes('x.com')) return <Twitter className="h-4 w-4" />;
    if (url.includes('instagram')) return <Instagram className="h-4 w-4" />;
    if (url.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  // Add a new handler for vCard downloads
  const handleVCardDownload = (e) => {
    e.preventDefault();
    
    if (!agent.vcard) {
      toast.error("No vCard available for this agent");
      return;
    }
    
    // Create filename from agent name
    const fileName = `${agent.fullName.replace(/[^\w\s]/gi, "_")}.vcf`;
    
    // Create link and trigger download
    const link = document.createElement("a");
    link.href = agent.vcard;
    link.setAttribute("download", fileName);
    link.setAttribute("target", "_blank");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!agent) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] pt-[50px] overflow-y-auto bg-white">
          <DialogHeader className="relative">
            <div className="absolute right-0 top-0 flex space-x-2">
              <button 
                className="p-2 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                onClick={handleEdit}
                disabled={isDeleting}
                title="Edit Agent"
              >
                <Edit size={18} />
              </button>
              <button 
                className="p-2 text-red-600 rounded-full hover:bg-red-50 transition-colors"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete Agent"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <DialogTitle className="text-xl font-semibold text-center">Agent Profile</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Detailed information about {agent.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Profile Header Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 mb-4 relative">
                <img 
                  src={imgError ? defaultImage : (agent.profileImage || defaultImage)}
                  alt={agent.fullName} 
                  className="w-full h-full rounded-full object-cover border-4 border-red-500"
                  onError={() => setImgError(true)}
                />
              </div>
              
              <h2 className="text-2xl font-bold text-center">{agent.fullName}</h2>
              <p className="text-gray-600 mt-1">@{agent.username}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  {agent.position || "Real Estate Agent"}
                </span>
                
                {agent.department && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {agent.department}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium truncate">{agent.email}</p>
                  </div>
                </div>
                
                {agent.contactNumber && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{agent.contactNumber}</p>
                    </div>
                  </div>
                )}
                
                {agent.whatsapp && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-medium">{agent.whatsapp}</p>
                    </div>
                  </div>
                )}
                
                {agent.address && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{agent.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Me Section */}
            {agent.aboutMe && (
              <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">About Me</h3>
                <p className="text-gray-700 whitespace-pre-line">{agent.aboutMe}</p>
              </div>
            )}

            {/* Languages Section */}
            {agent.languages && agent.languages.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Languages className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Languages</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {agent.languages.map((language, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links Section */}
            {agent.socialLinks && agent.socialLinks.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Social Links</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agent.socialLinks.map((link, index) => (
                    <a 
                      key={index} 
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {getSocialIcon(link)}
                      <span>{getSocialPlatformName(link)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Business Card */}
            {agent.vcard && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Business Card</h3>
                <button 
                  onClick={handleVCardDownload}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Download className="h-4 w-4" />
                  <span>Download vCard</span>
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AgentFormDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        agent={agent}
        onAgentUpdated={handleAgentUpdated}
        isEditing={true}
      />
    </>
  );
} 