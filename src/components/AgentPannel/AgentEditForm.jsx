import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/AdminPannel/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/AdminPannel/ui/form";
import { Input } from "@/components/AdminPannel/ui/input";
import { Textarea } from "@/components/AdminPannel/ui/textarea";
import { Button } from "@/components/AdminPannel/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/AdminPannel/ui/select";
import { toast } from "sonner";
import { User, Phone, Languages, X, Plus, Globe, MessageSquare, MapPin, XCircle } from "lucide-react";
// Import S3 upload utility
import { uploadFileToS3 } from '../../utils/s3Upload.js';

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  profileImage: z.any().optional(),
  contactNumber: z.string().optional(),
  position: z.string().optional(),
  whatsapp: z.string().optional(),
  department: z.string().optional(),
  languages: z.array(z.string()).optional(),
  aboutMe: z.string().optional(),
  address: z.string().optional(),
  socialLinks: z.array(z.string()).optional(),
});

// Social platforms for dropdown
const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '🎥' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌' },
  { value: 'website', label: 'Website', icon: '🌐' },
];

export function AgentEditForm({ open, onOpenChange, agent, onAgentUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [addingSocialLink, setAddingSocialLink] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("facebook");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  // Initialize form with resolver and default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      profileImage: "",
      contactNumber: "",
      position: "",
      whatsapp: "",
      department: "",
      languages: [],
      aboutMe: "",
      address: "",
      socialLinks: [],
    },
  });

  // Load agent data
  useEffect(() => {
    if (agent) {
      // Convert languages string to array if it's a string
      const initialLanguages = Array.isArray(agent.languages) 
        ? agent.languages 
        : agent.languages 
          ? agent.languages.split(',').map(lang => lang.trim())
          : [];
      
      setLanguages(initialLanguages);
      
      // Parse social links if available
      const initialSocialLinks = Array.isArray(agent.socialLinks) 
        ? agent.socialLinks
        : [];
      
      setSocialLinks(initialSocialLinks);
      
      // Reset form with all agent data and set preview URL from agent profile image
      form.reset({
        fullName: agent.fullName || "",
        profileImage: agent.profileImage || "",
        contactNumber: agent.contactNumber || "",
        position: agent.position || "",
        whatsapp: agent.whatsapp || "",
        department: agent.department || "",
        languages: initialLanguages,
        aboutMe: agent.aboutMe || "",
        address: agent.address || "",
      });

      // Set preview URL for profile image
      if (agent.profileImage) {
        setPreviewUrl(agent.profileImage);
      } else {
        setPreviewUrl("");
      }
    }
  }, [agent, form]);

  // Handle drag events for image upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelection(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection from input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelection(e.target.files[0]);
    }
  };

  // Process the selected image file
  const handleImageSelection = (file) => {
    setSelectedFile(file);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Upload image to S3
  const uploadToS3 = async (file) => {
    try {
      // Upload the file to the 'agents/' folder in S3
      const imageUrl = await uploadFileToS3(file, 'agents/');
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  // Handle form submission
  async function onSubmit(values) {
    try {
      setIsSubmitting(true);
      
      // Upload image if a new one was selected
      let profileImageUrl = previewUrl;
      if (selectedFile) {
        profileImageUrl = await uploadToS3(selectedFile);
      }
      
      // Prepare the updated agent data
      const updatedAgent = {
        fullName: values.fullName,
        profileImage: profileImageUrl,
        contactNumber: values.contactNumber,
        position: values.position,
        whatsapp: values.whatsapp,
        department: values.department,
        languages: languages,
        aboutMe: values.aboutMe,
        address: values.address,
        socialLinks: socialLinks,
      };
      
      console.log("Updating agent with data:", JSON.stringify(updatedAgent));
      
      // Send the update request - using PUT method as in the admin panel
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agent.id}`, {
        method: "PUT", // Changed from PATCH to PUT to match the admin panel implementation
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedAgent),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      const result = await response.json();
      console.log("API success response:", result);
      
      // Update the agent data in the parent component
      if (onAgentUpdated) {
        onAgentUpdated({
          ...agent,
          ...updatedAgent,
        });
      }
      
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle adding a new language
  const handleAddLanguage = () => {
    if (newLanguage.trim() !== "" && !languages.includes(newLanguage.trim())) {
      const updatedLanguages = [...languages, newLanguage.trim()];
      setLanguages(updatedLanguages);
      form.setValue("languages", updatedLanguages);
      setNewLanguage("");
    }
  };

  // Handle removing a language
  const handleRemoveLanguage = (indexToRemove) => {
    const updatedLanguages = languages.filter((_, index) => index !== indexToRemove);
    setLanguages(updatedLanguages);
    form.setValue("languages", updatedLanguages);
  };

  // Handle enter key press for adding languages
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  // Handle adding a social link
  const handleAddSocialLink = () => {
    if (newSocialUrl.trim() !== "") {
      const updatedLinks = [...socialLinks, newSocialUrl.trim()];
      setSocialLinks(updatedLinks);
      form.setValue("socialLinks", updatedLinks);
      setNewSocialUrl("");
      setAddingSocialLink(false);
    }
  };

  // Handle removing a social link
  const handleRemoveSocialLink = (indexToRemove) => {
    const updatedLinks = socialLinks.filter((_, index) => index !== indexToRemove);
    setSocialLinks(updatedLinks);
    form.setValue("socialLinks", updatedLinks);
  };

  // Handle cancelling adding a social link
  const handleCancelAddSocialLink = () => {
    setAddingSocialLink(false);
    setNewSocialUrl("");
  };

  // Helper function to get platform name from URL
  const getPlatformName = (url) => {
    if (url.includes('facebook')) return 'Facebook';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('linkedin')) return 'LinkedIn';
    if (url.includes('twitter') || url.includes('x.com')) return 'Twitter';
    if (url.includes('youtube')) return 'YouTube';
    if (url.includes('tiktok')) return 'TikTok';
    if (url.includes('pinterest')) return 'Pinterest';
    return 'Website';
  };

  // Render profile section
  const renderProfileSection = () => (
    <div className="flex flex-col items-center mb-8">
      {/* Profile Image */}
      <div className="relative mb-4">
        <div 
          className={`h-28 w-28 flex items-center justify-center rounded-full overflow-hidden border-2 
          ${dragActive ? "border-blue-500" : "border-gray-200"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={() => setPreviewUrl("")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 text-sm">
              <Plus className="h-6 w-6 mb-1" />
              <span>Upload Photo</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Profile Info */}
      <div className="w-full max-w-md">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Full Name"
                  {...field}
                  className="text-center font-medium text-lg bg-gray-50 border-0 shadow-none ring-0 focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pt-4 px-6">
              {/* Profile Section */}
              {renderProfileSection()}

              {/* Main Form - Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Position</h3>
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="eg. Real Estate Agent" 
                              {...field} 
                              className="bg-gray-50 border-0 shadow-none ring-0 focus:ring-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Department</h3>
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="bg-gray-50 border-0 shadow-none ring-0 focus:ring-0">
                                <SelectValue placeholder="Select your department" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="operations">Operations</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="hr">Human Resources</SelectItem>
                                <SelectItem value="it">IT</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Phone Number</h3>
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-500" />
                              <Input 
                                placeholder="+1 234 567 8900" 
                                {...field} 
                                className="bg-gray-50 border-0 shadow-none ring-0 focus:ring-0" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">WhatsApp</h3>
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                              <Input 
                                placeholder="+1 234 567 8900" 
                                {...field} 
                                className="bg-gray-50 border-0 shadow-none ring-0 focus:ring-0" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Address</h3>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <Input 
                                placeholder="123 Main St, City" 
                                {...field} 
                                className="bg-gray-50 border-0 shadow-none ring-0 focus:ring-0" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Languages</h3>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add a language"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="bg-gray-50 border-0 shadow-none ring-0 focus:ring-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddLanguage}
                          className="bg-white hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {languages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {languages.map((language, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{language}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(index)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">About Me</h3>
                    <FormField
                      control={form.control}
                      name="aboutMe"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell clients about yourself, your experience, and expertise..." 
                              className="min-h-[100px] bg-gray-50 border-0 shadow-none ring-0 focus:ring-0"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="mt-8 mb-4">
                <h3 className="text-base font-medium text-gray-900 mb-4">Social Links</h3>
                
                {socialLinks.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{getPlatformName(link)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {link}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveSocialLink(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {addingSocialLink ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Add Social Link:</label>
                    </div>
                    <div className="mb-3">
                      <Input
                        placeholder="https://example.com/yourprofile"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        className="bg-white border-0 shadow-none ring-0 focus:ring-0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAddSocialLink}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        Add Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelAddSocialLink}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="inline-flex items-center"
                    onClick={() => setAddingSocialLink(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Social Link
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 