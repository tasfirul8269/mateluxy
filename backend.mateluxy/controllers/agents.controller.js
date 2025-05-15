import Agent from "../models/agents.model.js";
import { errorHandler } from "../utils/erros.js";
import bcryptjs from "bcryptjs";

export const agents = async (req, res, next) => {
    try {
        // Fetch all agents from the database
        const allAgents = await Agent.find().select('-password');  // Exclude password field
        res.status(200).json(allAgents);
    } catch (error) {
        next(error);
    }
};

export const getAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agent = await Agent.findById(id).select('-password');  // Exclude password field
        
        if (!agent) {
            return next(errorHandler(404, "Agent not found"));
        }
        
        res.status(200).json(agent);
    } catch (error) {
        console.error("Error fetching agent:", error);
        next(error);
    }
};

export const updateAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Updating agent with ID:", id);
        console.log("Request body:", JSON.stringify(req.body));
        
        const { 
            username, 
            fullName, 
            email, 
            password, 
            profileImage, 
            position, 
            contactNumber,
            whatsapp,
            department,
            vcard,
            languages,
            aboutMe,
            address,
            socialLinks
        } = req.body;

        // Log fields that are commonly missing
        console.log("Fields to check:");
        console.log("- whatsapp:", whatsapp);
        console.log("- department:", department);
        console.log("- vcard:", vcard);
        console.log("- languages:", languages);
        console.log("- aboutMe:", aboutMe);
        console.log("- address:", address);
        console.log("- socialLinks:", socialLinks);

        // Check if agent exists
        const existingAgent = await Agent.findById(id);
        if (!existingAgent) {
            return next(errorHandler(404, "Agent not found"));
        }

        // Existing agent data
        console.log("Existing agent data:", {
            username: existingAgent.username,
            email: existingAgent.email,
            whatsapp: existingAgent.whatsapp,
            department: existingAgent.department,
            vcard: existingAgent.vcard,
            languages: existingAgent.languages,
            aboutMe: existingAgent.aboutMe,
            address: existingAgent.address,
            socialLinks: existingAgent.socialLinks
        });

        // Check username uniqueness if changing username
        if (username !== existingAgent.username) {
            const usernameExists = await Agent.findOne({ 
                username, 
                _id: { $ne: id } 
            });
            
            if (usernameExists) {
                return next(errorHandler(400, "Username already taken"));
            }
        }

        // Check email uniqueness if changing email
        if (email !== existingAgent.email) {
            const emailExists = await Agent.findOne({ 
                email, 
                _id: { $ne: id } 
            });
            
            if (emailExists) {
                return next(errorHandler(400, "Email already in use"));
            }
        }

        // Create update object with all fields
        const updateData = {
            username,
            fullName,
            email,
            profileImage,
            position,
            contactNumber,
            whatsapp,
            department,
            vcard,
            languages,
            aboutMe,
            address,
            socialLinks
        };

        // Only hash and update password if it's provided and not the placeholder
        if (password && password !== "********") {
            updateData.password = await bcryptjs.hash(password, 10);
        }

        console.log("Update data being sent to MongoDB:", JSON.stringify(updateData));

        const updatedAgent = await Agent.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedAgent) {
            return next(errorHandler(404, "Agent not found"));
        }

        console.log("Updated agent response:", JSON.stringify(updatedAgent));
        res.status(200).json(updatedAgent);
    } catch (error) {
        console.error("Error updating agent:", error);
        next(error);
    }
};

export const deleteAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedAgent = await Agent.findByIdAndDelete(id);

        if (!deletedAgent) {
            return next(errorHandler(404, "Agent not found"));
        }

        res.status(200).json({ message: "Agent deleted successfully" });
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
        
        // If currentId is provided, exclude the current agent from the check
        if (currentId) {
            query._id = { $ne: currentId };
        }

        const existingAgent = await Agent.findOne(query);
        
        res.json({ available: !existingAgent });
    } catch (error) {
        console.error("Error checking username availability:", error);
        res.status(500).json({ message: "Error checking username availability" });
    }
};