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
import { Button } from "@/components/AdminPannel/ui/button";
import { customToast } from "@/components/AdminPannel/ui/sonner";
import { User, Info, Phone, Lock, Globe, Languages, Check, X, Plus, Trash2, XCircle, FileText, Link } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/AdminPannel/ui/select";
import { uploadFileToS3 } from '../../../utils/s3Upload.js';

// Form validation schema
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional(),
  profileImage: z.any().optional(),
  contactNumber: z.string().optional(),
  position: z.string().optional(),
  whatsapp: z.string().optional(),
  department: z.string().optional(),
  vcard: z.string().optional(),
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

export function AgentFormDialog({ open, onOpenChange, onAgentAdded, agent, onAgentUpdated, isEditing = false }) {
  // Add immediate logging for the agent prop 
  console.log("AgentFormDialog received agent:", agent, "isEditing:", isEditing);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const usernameCheckTimeout = useRef(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedVCardFile, setSelectedVCardFile] = useState(null);
  const [isUploadingVCard, setIsUploadingVCard] = useState(false);
  const vcardInputRef = useRef(null);
  const [addingSocialLink, setAddingSocialLink] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("facebook");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  // Initialize form with resolver and default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      profileImage: "",
      contactNumber: "",
      position: "",
      whatsapp: "",
      department: "",
      vcard: "",
      languages: [],
      aboutMe: "",
      address: "",
      socialLinks: [],
    },
  });

  // Load agent data when editing
  useEffect(() => {
    if (agent) {
      console.log("Loading agent data for editing:", agent);
      
      // Convert languages string to array if it's a string
      const initialLanguages = Array.isArray(agent.languages) 
        ? agent.languages 
        : agent.languages 
          ? agent.languages.split(',').map(lang => lang.trim())
          : [];
      
      setLanguages(initialLanguages);
      
      // Parse social links if available
      const initialSocialLinks = Array.isArray(agent.socialLinks) 
        ? agent.socialLinks.map(url => {
            // Detect platform from URL
            const platform = detectPlatform(url);
            return { platform, url };
          })
        : [];
      
      setSocialLinks(initialSocialLinks);
      
      // Reset form with all agent data and set preview URL from agent profile image
      const formValues = {
        username: agent.username || "",
        fullName: agent.fullName || "",
        email: agent.email || "",
        password: "********", // Set a placeholder for password
        profileImage: agent.profileImage || "",
        contactNumber: agent.contactNumber || "",
        position: agent.position || "",
        whatsapp: agent.whatsapp || "",
        department: agent.department || "",
        vcard: agent.vcard || "",
        languages: initialLanguages,
        aboutMe: agent.aboutMe || "",
        address: agent.address || "",
        // Don't set socialLinks in form as we're managing it separately
      };
      
      console.log("Setting form values:", formValues);
      form.reset(formValues);

      // Set preview URL for profile image from the database
      if (agent.profileImage) {
        setPreviewUrl(agent.profileImage);
      } else {
        setPreviewUrl("");
      }

      // Check username availability for the current username
      if (agent.username) {
        checkUsernameAvailability(agent.username);
      }
    } else {
      // Reset all state when not editing
      setLanguages([]);
      setSocialLinks([]);
      form.reset({
        username: "",
        fullName: "",
        email: "",
        password: "",
        profileImage: "",
        contactNumber: "",
        position: "",
        whatsapp: "",
        department: "",
        vcard: "",
        languages: [],
        aboutMe: "",
        address: "",
        // Don't set socialLinks in form as we're managing it separately
      });
      setPreviewUrl("");
      setIsUsernameAvailable(null);
    }
  }, [agent, form]);

  // Helper function to detect platform from URL
  const detectPlatform = (url) => {
    if (!url) return 'website';
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    if (lowerUrl.includes('pinterest.com')) return 'pinterest';
    
    return 'website'; // Default
  };

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

  // Handle file drop for image upload
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleImageSelection(file);
      } else {
        customToast.error("Please select an image file");
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        handleImageSelection(file);
      } else {
        customToast.error("Please select an image file");
      }
    }
  };

  // Process selected image
  const handleImageSelection = (file) => {
    setSelectedFile(file);
    form.setValue("profileImage", file);
    
    // Create preview URL for UI display
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }
    
    try {
      setIsCheckingUsername(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/check-username?username=${encodeURIComponent(username)}${agent ? `&currentId=${agent.id}` : ''}`,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to check username');
      }
      
      const data = await response.json();
      setIsUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setIsUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Handle username input change
  const handleUsernameChange = (e) => {
    const username = e.target.value;
    form.setValue('username', username);
    
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }
    
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
  };

  // Add new social link
  const handleAddSocialLink = () => {
    if (addingSocialLink) {
      if (newSocialUrl.trim()) {
        // Validate URL format
        let url = newSocialUrl.trim();
        
        // Add https:// if not present
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        
        const updatedLinks = [...socialLinks, { platform: newSocialPlatform, url }];
        setSocialLinks(updatedLinks);
        console.log("Social links updated:", updatedLinks);
        
        // Reset the new link form
        setNewSocialPlatform("facebook");
        setNewSocialUrl("");
        setAddingSocialLink(false);
      } else {
        customToast.error("Please enter a URL for the social link");
      }
    } else {
      setAddingSocialLink(true);
    }
  };

  // Remove social link
  const handleRemoveSocialLink = (index) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updatedLinks);
    console.log("Social link removed. Updated links:", updatedLinks);
  };

  // Update social link
  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setSocialLinks(updatedLinks);
  };

  // Cancel adding social link
  const handleCancelAddSocialLink = () => {
    setAddingSocialLink(false);
    setNewSocialPlatform("facebook");
    setNewSocialUrl("");
  };

  // Cancel form
  const handleCancel = () => {
    if(!isEditing){
    setPreviewUrl("");
    setSelectedFile(null);
    setIsUsernameAvailable(null);
    setSocialLinks([]);
    form.reset();
    onOpenChange(false);
  }else{
    onOpenChange(false);

  }
  };

  // Add new language
  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      const updatedLanguages = [...languages, newLanguage.trim()];
      setLanguages(updatedLanguages);
      form.setValue('languages', updatedLanguages);
      setNewLanguage("");
    }
  };

  // Remove language
  const handleRemoveLanguage = (indexToRemove) => {
    const updatedLanguages = languages.filter((_, index) => index !== indexToRemove);
    setLanguages(updatedLanguages);
    form.setValue('languages', updatedLanguages);
  };

  // Handle language input keypress
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  // Handle vCard file selection
  const handleVCardFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedVCardFile(file);
        customToast.info("PDF selected. Click 'Upload' to upload the file.");
      } else {
        customToast.error("Please select a PDF file");
      }
    }
  };

  // Upload vCard to S3
  const uploadVCardToS3 = async () => {
    if (!selectedVCardFile) {
      customToast.error("Please select a PDF file first");
      return;
    }

    try {
      setIsUploadingVCard(true);
      
      // Upload the file to the 'vcards/' folder in S3
      const vcardUrl = await uploadFileToS3(selectedVCardFile, 'vcards/');
      
      // Update form with vCard URL
      form.setValue('vcard', vcardUrl);
      customToast.success("vCard uploaded successfully");
      setSelectedVCardFile(null);
    } catch (error) {
      console.error("vCard upload error:", error);
      customToast.error("Failed to upload vCard. Please try again.");
    } finally {
      setIsUploadingVCard(false);
    }
  };

  // Form submission handler
  async function onSubmit(values) {
    if (isUsernameAvailable === false) {
      customToast.error("Please choose a different username");
      return;
    }

    // Debugging what we have before submission
    console.log("Form values:", values);
    console.log("Languages state:", languages);
    console.log("Social links state:", socialLinks);

    // Check if any changes were made
    if (isEditing) {
      const hasChanges = 
        values.username !== agent.username ||
        values.fullName !== agent.fullName ||
        values.email !== agent.email ||
        (values.password && values.password !== "********") ||
        values.profileImage !== agent.profileImage ||
        values.contactNumber !== agent.contactNumber ||
        values.position !== agent.position ||
        values.whatsapp !== agent.whatsapp ||
        values.department !== agent.department ||
        values.vcard !== agent.vcard ||
        JSON.stringify(values.languages) !== JSON.stringify(agent.languages) ||
        values.aboutMe !== agent.aboutMe ||
        values.address !== agent.address ||
        JSON.stringify(socialLinks) !== JSON.stringify(agent.socialLinks);

      if (!hasChanges) {
        customToast.info("No changes were made");
        onOpenChange(false);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let imageUrl = values.profileImage;
      if (selectedFile) {
        try {
          customToast.info("Uploading image...");
          imageUrl = await uploadToS3(selectedFile);
        } catch (error) {
          customToast.error("Image upload failed. Using existing image.");
          console.error("Image upload error:", error);
        }
      }

      // Prepare social links - format properly for the backend
      const formattedSocialLinks = socialLinks.map(link => link.url);
      
      // Make sure languages is always an array
      const formattedLanguages = Array.isArray(values.languages) 
        ? values.languages 
        : languages;

      const agentData = {
        username: values.username,
        fullName: values.fullName,
        email: values.email,
        contactNumber: values.contactNumber || "",
        position: values.position || "",
        profileImage: imageUrl || "",
        whatsapp: values.whatsapp || "",
        department: values.department || "",
        vcard: values.vcard || "",
        languages: formattedLanguages,
        aboutMe: values.aboutMe || "",
        address: values.address || "",
        socialLinks: formattedSocialLinks
      };

      if (values.password && values.password !== "********") {
        agentData.password = values.password;
      }

      console.log("Submitting agent data:", JSON.stringify(agentData));

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/agents/${agent.id}`
        : `${import.meta.env.VITE_API_URL}/api/agents/add-agents`;

      console.log("API URL:", url);
      console.log("Method:", isEditing ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
        credentials: 'include',
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || (isEditing ? 'Failed to update agent' : 'Failed to add agent'));
      }

      const responseData = await response.json();
      console.log("API success response:", responseData);

      // Create a formatted agent object from the response
      const updatedAgent = {
        id: responseData._id || agent?.id || 'temp-' + Date.now(),
        fullName: responseData.fullName,
        email: responseData.email,
        username: responseData.username,
        contactNumber: responseData.contactNumber || "",
        position: responseData.position || "",
        profileImage: responseData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(responseData.fullName)}&background=random`,
        whatsapp: responseData.whatsapp || "",
        department: responseData.department || "",
        vcard: responseData.vcard || "",
        languages: responseData.languages || [],
        aboutMe: responseData.aboutMe || "",
        address: responseData.address || "",
        socialLinks: responseData.socialLinks || [],
      };

      if (isEditing && onAgentUpdated) {
        onAgentUpdated(updatedAgent);
        customToast.success("Agent updated successfully!");
      } else if (!isEditing && onAgentAdded) {
        onAgentAdded(updatedAgent);
        customToast.success("Agent added successfully!");
      }

      // Reset form and close dialog
      form.reset();
      setSelectedFile(null);
      setPreviewUrl("");
      setSocialLinks([]);
      setLanguages([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      customToast.error(error.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render username field
  const renderUsernameField = () => (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="relative">
              <Input 
                placeholder="Enter username" 
                {...field} 
                onChange={handleUsernameChange}
                className="text-center bg-gray-50 border-0" 
                disabled={isEditing && !isEditingProfile}
              />
              {isCheckingUsername && (
                <div className="absolute right-2 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
              {!isCheckingUsername && isUsernameAvailable !== null && (
                <div className="absolute right-2 top-2.5">
                  {isUsernameAvailable ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Render password field
  const renderPasswordField = () => (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{isEditing ? "New Password" : "Password"} {isEditing && "(Leave blank to keep current)"}</FormLabel>
          <FormControl>
            <Input 
              type="password" 
              placeholder={isEditing ? "Enter new password" : "Enter password"} 
              {...field} 
              className="bg-white" 
              value={isEditing && field.value === "********" ? "" : field.value}
              onChange={(e) => {
                // For editing mode, if the field is empty, set it to the placeholder value
                // This indicates we're not changing the password
                if (isEditing && e.target.value === "") {
                  field.onChange("********");
                } else {
                  field.onChange(e.target.value);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Render languages field
  const renderLanguagesField = () => (
    <FormField
      control={form.control}
      name="languages"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a language"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white"
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

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
      {isEditing && !isEditingProfile ? (
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold">{agent?.fullName || ''}</h3>
          <p className="text-gray-500">@{agent?.username || ''}</p>
          <p className="text-gray-500">{agent?.email || ''}</p>
          <Button 
            type="button" 
            onClick={() => setIsEditingProfile(true)}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            Edit
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full Name"
                    {...field}
                    className="text-center font-medium text-lg bg-gray-50 border-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {renderUsernameField()}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    {...field}
                    className="text-center bg-gray-50 border-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <div className="text-center">
              <Button 
                type="button" 
                onClick={() => setIsEditingProfile(false)} 
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Agent" : "Add New Agent"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the agent's information below."
              : "Fill in the details to create a new agent account."}
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
                              placeholder="eg. Managing Director" 
                              {...field} 
                              className="bg-gray-50 border-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Departments</h3>
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
                              <SelectTrigger className="bg-gray-50 border-0">
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
                    <h3 className="text-base font-medium text-gray-900 mb-2 flex items-center">
                      Vcard
                      <div className="flex gap-2 ml-2">
                        <input
                          ref={vcardInputRef}
                          type="file"
                          className="hidden"
                          accept="application/pdf"
                          onChange={handleVCardFileChange}
                          disabled={isSubmitting || isUploadingVCard}
                        />
                        <Button
                          type="button"
                          variant="ghost" 
                          className="h-6 text-xs px-2 text-blue-500 hover:text-blue-700"
                          onClick={() => vcardInputRef.current?.click()}
                          disabled={isUploadingVCard}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Select PDF
                        </Button>
                        {selectedVCardFile && (
                          <Button
                            type="button"
                            size="sm"
                            className="ml-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={uploadVCardToS3}
                            disabled={isUploadingVCard || !selectedVCardFile}
                          >
                            {isUploadingVCard ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1"></div>
                            ) : (
                              <Link className="h-3 w-3 mr-1" />
                            )}
                            Upload
                          </Button>
                        )}
                      </div>
                    </h3>
                    <FormField
                      control={form.control}
                      name="vcard"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Upload PDF or enter vCard URL" 
                              {...field} 
                              className="bg-gray-50 border-0" 
                            />
                          </FormControl>
                          {field.value && (
                            <div className="mt-1">
                              <a 
                                href={field.value} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View vCard
                              </a>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">About me</h3>
                    <FormField
                      control={form.control}
                      name="aboutMe"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <textarea
                              placeholder="Describe yourself"
                              className="w-full min-h-[120px] p-3 rounded-md bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                              {...field}
                            />
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
                    <h3 className="text-base font-medium text-gray-900 mb-2">WhatsApp</h3>
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Your WhatsApp number" 
                              {...field} 
                              className="bg-gray-50 border-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Contact Number</h3>
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="+880171-XXXXXX" 
                              {...field} 
                              className="bg-gray-50 border-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Language</h3>
                    {renderLanguagesField()}
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">Address</h3>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Your address" 
                              {...field} 
                              className="bg-gray-50 border-0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8 mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-3">Social Links</h3>
                <div className="mb-2 space-y-2">
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                        {SOCIAL_PLATFORMS.find(p => p.value === link.platform)?.icon || '🌐'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium">
                          {SOCIAL_PLATFORMS.find(p => p.value === link.platform)?.label || 'Website'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{link.url}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveSocialLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {addingSocialLink && (
                    <div className="p-3 border border-dashed border-gray-300 rounded-md bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                        <div className="md:col-span-1">
                          <Select
                            value={newSocialPlatform}
                            onValueChange={setNewSocialPlatform}
                          >
                            <SelectTrigger className="bg-gray-50 border-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <SelectItem key={platform.value} value={platform.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{platform.icon}</span>
                                    <span>{platform.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <Input
                            placeholder="Enter URL (e.g. https://facebook.com/username)"
                            value={newSocialUrl}
                            onChange={(e) => setNewSocialUrl(e.target.value)}
                            className="bg-gray-50 border-0"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelAddSocialLink}
                          className="bg-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddSocialLink}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {!addingSocialLink && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSocialLink}
                    className="bg-white border-dashed border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                )}
              </div>

              {/* Hide password in edit mode unless profile editing is enabled */}
              {(!isEditing || isEditingProfile) && (
                <div className="mb-6 p-4 border border-gray-100 rounded-md bg-gray-50/50">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Password</h3>
                  {renderPasswordField()}
                </div>
              )}
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || isUploadingVCard}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploadingVCard} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isSubmitting 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update" : "Add Agent")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 