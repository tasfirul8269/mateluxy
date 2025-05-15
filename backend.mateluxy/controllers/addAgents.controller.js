import Agent from "../models/agents.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/erros.js";

export const addAgents = async (req, res, next) => {
    try {
        console.log("Add agent request body:", JSON.stringify(req.body));
        
        const {
            username,
            fullName,
            email,
            password,
            profileImage,
            contactNumber,
            position,
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

        // Validate required fields
        if (!username || !fullName || !email || !password) {
            return next(errorHandler(400, "Required fields are missing"));
        }

        // Check if username or email already exists
        const existingAgent = await Agent.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (existingAgent) {
            if (existingAgent.username === username) {
                return next(errorHandler(400, "Username already exists"));
            }
            if (existingAgent.email === email) {
                return next(errorHandler(400, "Email already exists"));
            }
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new agent with all fields
        const newAgent = new Agent({
            username,
            fullName,
            email,
            password: hashedPassword,
            profileImage: profileImage || "",
            contactNumber: contactNumber || "",
            position: position || "",
            whatsapp: whatsapp || "",
            department: department || "",
            vcard: vcard || "",
            languages: languages || [],
            aboutMe: aboutMe || "",
            address: address || "",
            socialLinks: socialLinks || []
        });

        // Save agent to database
        console.log("New agent data to save:", JSON.stringify(newAgent));
        await newAgent.save();
        
        // Return agent data without password
        const agentResponse = newAgent.toObject();
        delete agentResponse.password;
        
        console.log("Add agent response:", JSON.stringify(agentResponse));
        res.status(201).json(agentResponse);
    } catch (error) {
        console.error("Error adding agent:", error);
        next(error);
    }
};