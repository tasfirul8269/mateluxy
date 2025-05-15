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
import { toast } from "sonner";
import { Check, X, User, Info, Phone, Lock, Plus, Trash2, XCircle, FileText, Link } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/AdminPannel/ui/select";
// Import the S3 upload utility
import { uploadFileToS3 } from '../../../utils/s3Upload.js';
import { convertS3UrlToProxyUrl } from '../../../utils/s3UrlConverter.js';

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
});

export function AdminFormDialog({ open, onOpenChange, onAdminAdded, admin, onAdminUpdated, isEditing = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  
  const fileInputRef = useRef(null);
  const usernameCheckTimeout = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      profileImage: "",
    },
  });

  useEffect(() => {
    if (admin) {
      form.reset({
        username: admin.username || "",
        fullName: admin.fullName || "",
        email: admin.email || "",
        password: "********",
        profileImage: admin.profileImage || "",
      });
      
      // Set preview URL for profile image from the database
      if (admin.profileImage) {
        setPreviewUrl(admin.profileImage);
      } else {
        setPreviewUrl("");
      }
    } else {
      form.reset({
        username: "",
        fullName: "",
        email: "",
        password: "",
        profileImage: "",
      });
      setPreviewUrl("");
    }
  }, [admin, form]);

  const checkUsernameAvailability = async (username) => {
    // If we're editing and the username hasn't changed, it's available
    if (isEditing && admin && username === admin.username) {
      setIsUsernameAvailable(true);
      return;
    }
    
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }
    
    try {
      setIsCheckingUsername(true);
      
      // Use the correct endpoint based on how routes are registered in backend/index.js
      // This route is registered as /api/check-username in the adminsRouter
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/check-username?username=${encodeURIComponent(username)}${admin ? `&currentId=${admin.id}` : ''}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to check username: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Username availability:', data);
      setIsUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      // If there's an error, assume username is available to allow form submission
      setIsUsernameAvailable(true);
      toast.error("Couldn't verify username availability");
    } finally {
      setIsCheckingUsername(false);
    }
  };

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadToS3 = async (file) => {
    try {
      // Upload the file to the 'admins/' folder in S3
      const imageUrl = await uploadFileToS3(file, 'admins/');
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleImageSelection(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        handleImageSelection(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleImageSelection = (file) => {
    setSelectedFile(file);
    form.setValue("profileImage", file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleCancel = () => {
    setPreviewUrl("");
    setSelectedFile(null);
    setIsUsernameAvailable(null);
    form.reset();
    onOpenChange(false);
  };

  const renderFormFields = () => (
    <div className="space-y-6 w-full">
      {/* Row 1: Username and Full Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Enter username" 
                    {...field} 
                    onChange={handleUsernameChange}
                    className="bg-gray-50 border-0" 
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

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter full name"
                  {...field}
                  className="bg-gray-50 border-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 2: Email and Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                  className="bg-gray-50 border-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password {isEditing && "(Leave blank to keep current)"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditing ? "••••••••" : "Enter password"} 
                  {...field} 
                  className="bg-gray-50 border-0" 
                  value={isEditing && field.value === "********" ? "" : field.value}
                  onChange={(e) => {
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
      </div>
    </div>
  );

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
              src={convertS3UrlToProxyUrl(previewUrl)}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error('Error loading image:', e);
                setPreviewUrl("");
              }}
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
    </div>
  );

  async function onSubmit(values) {
    if (isUsernameAvailable === false) {
      toast.error("Please choose a different username");
      return;
    }

    // Check if any changes were made
    if (isEditing) {
      const hasChanges = 
        values.username !== admin.username ||
        values.fullName !== admin.fullName ||
        values.email !== admin.email ||
        (values.password && values.password !== "********") ||
        values.profileImage !== admin.profileImage;

      if (!hasChanges) {
        toast.info("No changes were made");
        onOpenChange(false);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let imageUrl = admin?.profileImage || "";
      if (selectedFile) {
        try {
          imageUrl = await uploadToS3(selectedFile);
        } catch (error) {
          toast.error("Image upload failed. Using existing image.");
          console.error("Image upload error:", error);
        }
      }

      const adminData = {
        username: values.username,
        fullName: values.fullName,
        email: values.email,
        profileImage: imageUrl,
      };

      if (values.password && values.password !== "********") {
        adminData.password = values.password;
      }

      // Use the correct endpoints based on how routes are registered in backend/index.js
      // For updates: /api/:id (because adminsRouter is mounted at /api)
      // For new admins: /api/admins/add-admins (because addAdmins router is mounted at /api/admins)
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/${admin.id}`
        : `${import.meta.env.VITE_API_URL}/api/admins/add-admins`;

      console.log(`Sending ${isEditing ? 'PUT' : 'POST'} request to: ${url}`);
      console.log('With data:', adminData);

      try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
        credentials: 'include',
      });

        const contentType = response.headers.get("content-type");
        let errorData;

      if (!response.ok) {
          // Try to get detailed error message
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
            console.error('Response error data:', errorData);
            
            // Handle specific permission error
            if (response.status === 403 && errorData.message && errorData.message.includes("permission")) {
              toast.error("Permission error: You don't have permission to update this admin profile.");
              
              // You can add a dialog here to confirm if the user wants to retry or cancel
              if (window.confirm("Permission error: Would you like to try again? This might require higher privileges.")) {
                // User wants to try again - you could implement special handling here
                console.log("User wants to retry the admin update");
              } else {
                // User cancels
                onOpenChange(false);
                return; // Exit early
              }
            }
            
            throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} admin`);
          } else {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`Failed to ${isEditing ? 'update' : 'add'} admin: ${response.status} ${response.statusText}`);
      }
        }

        // Handle successful response
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          throw new Error('Invalid response format from server');
        }

        console.log('Server response:', data);

        // Handle various response formats
        const responseData = data._doc || data || {};

      // Store the original S3 URL in the database but use the proxy URL for display
    const originalProfileImage = responseData.profileImage || adminData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.fullName)}&background=random`;
    
    const updatedAdmin = {
        id: responseData._id || admin?.id || 'temp-' + Date.now(),
        fullName: responseData.fullName || adminData.fullName,
        email: responseData.email || adminData.email,
        username: responseData.username || adminData.username,
        profileImage: originalProfileImage, // Store the original URL
        profileImageProxy: convertS3UrlToProxyUrl(originalProfileImage), // Add a proxy URL for display
        lastLogin: responseData.lastLogin ? new Date(responseData.lastLogin) : new Date(),
        adminId: responseData.adminId || `ADM${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: responseData.createdAt ? new Date(responseData.createdAt) : new Date(),
    };

      if (isEditing && onAdminUpdated) {
        onAdminUpdated(updatedAdmin);
        toast.success("Admin updated successfully!");
      } else if (!isEditing && onAdminAdded) {
        onAdminAdded(updatedAdmin);
        toast.success("Admin added successfully!");
      }

      form.reset();
      setSelectedFile(null);
      setPreviewUrl("");
      onOpenChange(false);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Admin" : "Add New Admin"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the admin's information below."
              : "Fill in the details to create a new admin account."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Profile Section */}
              {renderProfileSection()}

              {/* Form Fields */}
              {renderFormFields()}
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isSubmitting 
                  ? (isEditing ? "Updating..." : "Adding...") 
                  : (isEditing ? "Update" : "Add Admin")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}