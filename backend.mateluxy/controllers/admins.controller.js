import Admin from "../models/admin.model.js";
import { errorHandler } from "../utils/erros.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const admins = async (req, res, next) => {
    try {
        const allAdmins = await Admin.find().select('-password');  // Exclude password field
        res.status(200).json(allAdmins);
    } catch (error) {
        next(error);
    }
};

export const updateAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, fullName, email, password, profileImage } = req.body;
        
        // Check if admin exists first
        const adminExists = await Admin.findById(id);
        if (!adminExists) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin not found" 
            });
        }

        // Verify the admin is authenticated
        try {
            const token = req.cookies.access_token;
            if (!token) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Authentication required" 
                });
            }
            
            // Verify token but don't restrict to self-updates
            // Any authenticated admin can update any other admin
            jwt.verify(token, process.env.JWT_SECRET);
            
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token or authorization error" 
            });
        }
        
        // Check if username is being changed and already exists
        if (username && username !== adminExists.username) {
            const usernameExists = await Admin.findOne({ 
                username: username.toLowerCase(),
                _id: { $ne: id } // exclude current admin
            });
            
            if (usernameExists) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Username already taken" 
                });
            }
        }
        
        // Check if email is being changed and already exists
        if (email && email !== adminExists.email) {
            const emailExists = await Admin.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: id } // exclude current admin
            });
            
            if (emailExists) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email already in use" 
                });
            }
        }
        
        // Create update object
        const updateData = {};
        
        // Only update fields that were provided
        if (username) updateData.username = username;
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (profileImage) updateData.profileImage = profileImage;

        // Only hash and update password if it's provided
        if (password) {
            updateData.password = await bcryptjs.hash(password, 10);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            ...updatedAdmin._doc
        });
    } catch (error) {
        console.error("Error updating admin:", error);
        next(error);
    }
};

export const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Check if this is the last admin
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
            return res.status(400).json({ 
                message: "Cannot delete the last admin. At least one admin must remain in the system." 
            });
        }

        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const checkUsernameAvailability = async (req, res) => {
    try {
        const { username, currentId } = req.query;
        
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // Build query to check username availability
        const query = { username: username.toLowerCase() };
        
        // If currentId is provided, exclude the current admin from the check
        if (currentId) {
            query._id = { $ne: currentId };
        }

        const existingAdmin = await Admin.findOne(query);
        
        res.json({ available: !existingAdmin });
    } catch (error) {
        console.error("Error checking username availability:", error);
        res.status(500).json({ message: "Error checking username availability" });
    }
};

// Get current admin profile
export const getCurrentAdmin = async (req, res, next) => {
    try {
        // req.user comes from the verifyToken middleware
        const adminId = req.user.id;
        
        // Find the admin by ID, excluding the password field
        const admin = await Admin.findById(adminId).select('-password');
        
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        
        // Return the admin data
        res.status(200).json({
            success: true,
            admin: {
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                username: admin.username,
                profileImage: admin.profileImage || '',
                adminId: admin.adminId,
                createdAt: admin.createdAt,
                role: 'Administrator' // You can expand this later if you add roles to your model
            }
        });
    } catch (error) {
        next(error);
    }
};