import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/erros.js";
import Agent from "../models/agents.model.js";
import jwt from "jsonwebtoken";

export const agentSignIn = async (req, res, next) => {
    console.log("Agent sign-in attempt received with body:", req.body);
    const { email, password } = req.body;
    
    try {
        // Check if email is provided
        if (!email) {
            console.log("Agent sign-in failed: No email provided");
            return next(errorHandler(400, "Email is required"));
        }
        
        // Check if password is provided
        if (!password) {
            console.log("Agent sign-in failed: No password provided");
            return next(errorHandler(400, "Password is required"));
        }
        
        // Find agent by email
        const validAgent = await Agent.findOne({ email });
        
        if (!validAgent) {
            console.log(`Agent sign-in failed: No agent found with email ${email}`);
            return next(errorHandler(404, "Agent Not Found"));
        }
        
        console.log(`Agent found with email ${email}, validating password`);
        
        // Validate password
        const validPassword = await bcryptjs.compare(password, validAgent.password);
        
        if (!validPassword) {
            console.log(`Agent sign-in failed: Invalid password for email ${email}`);
            return next(errorHandler(401, "Invalid credentials"));
        }
        
        console.log(`Agent ${email} authenticated successfully, generating token`);
        
        // Generate token
        const token = jwt.sign({ id: validAgent._id }, process.env.JWT_SECRET);
        
        // Remove password from response
        const { password: pass, ...rest } = validAgent._doc;
        
        console.log(`Setting cookie for agent ${email}`);
        
        // Set cookie with more compatible settings
        res.cookie("agent_token", token, {
            httpOnly: true,
            // In production use secure: true, for local development this can be false
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
            // Set a long expiration (e.g., 30 days)
            maxAge: 30 * 24 * 60 * 60 * 1000
        }).status(200).json(rest);
        
        console.log(`Agent ${email} signed in successfully`);

    } catch (error) {
        console.error("Agent sign-in error:", error);
        next(error);
    }
}; 