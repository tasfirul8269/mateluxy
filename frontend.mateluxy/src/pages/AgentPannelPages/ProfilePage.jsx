import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Languages, Facebook, Twitter, Instagram, Linkedin, Globe, MessageSquare, Edit, PenSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/AdminPannel/ui/button';
import { AgentEditForm } from '@/components/AgentPannel/AgentEditForm';

const ProfilePage = () => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const defaultImage = agent 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.fullName)}&background=random`
    : "";

  useEffect(() => {
    fetchAgentDetails();
  }, []);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/auth-status`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }
      
      const data = await response.json();
      
      setAgent({
        id: data._id,
        username: data.username,
        fullName: data.fullName,
        profileImage: data.profileImage,
        position: data.position || "",
        email: data.email,
        contactNumber: data.contactNumber || "",
        whatsapp: data.whatsapp || "",
        department: data.department || "",
        vcard: data.vcard || "",
        languages: data.languages || [],
        aboutMe: data.aboutMe || "",
        address: data.address || "",
        socialLinks: data.socialLinks || [],
      });
    } catch (error) {
      console.error('Error fetching agent details:', error);
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditFormOpen(true);
  };

  const handleAgentUpdated = (updatedAgent) => {
    setAgent(updatedAgent);
    setIsEditFormOpen(false);
    toast.success("Profile updated successfully");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
          <span className="mt-4 text-gray-600">Loading profile information...</span>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load profile information.</p>
          <Button 
            onClick={fetchAgentDetails} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-5xl mx-auto pt-8 pb-16">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Profile</h1>
          <Button 
            onClick={handleEdit} 
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </Button>
        </div>

        {/* Profile Content */}
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500">
                <img 
                  src={imgError ? defaultImage : (agent.profileImage || defaultImage)}
                  alt={agent.fullName} 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{agent.fullName}</h2>
              <p className="text-gray-600 mb-3">@{agent.username}</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{agent.email}</p>
                </div>
              </div>
              
              {agent.contactNumber && (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{agent.contactNumber}</p>
                  </div>
                </div>
              )}
              
              {agent.whatsapp && (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <p className="font-medium">{agent.whatsapp}</p>
                  </div>
                </div>
              )}
              
              {agent.address && (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
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
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">About Me</h3>
              <p className="text-gray-700 whitespace-pre-line">{agent.aboutMe}</p>
            </div>
          )}

          {/* Languages Section */}
          {agent.languages && agent.languages.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Languages className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-800">Languages</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.languages.map((language, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links Section */}
          {agent.socialLinks && agent.socialLinks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Connect with me</h3>
              <div className="flex flex-wrap gap-3">
                {agent.socialLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {getSocialIcon(link)}
                    <span>{getSocialPlatformName(link)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {agent && (
        <AgentEditForm
          open={isEditFormOpen}
          onOpenChange={(open) => {
            setIsEditFormOpen(open);
            if (!open) {
              // Refresh agent data when edit form is closed
              fetchAgentDetails();
            }
          }}
          agent={agent}
          onAgentUpdated={handleAgentUpdated}
        />
      )}
    </>
  );
};

export default ProfilePage; 