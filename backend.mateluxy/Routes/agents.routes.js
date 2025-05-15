import express from "express";
import { agents, getAgent, updateAgent, deleteAgent, checkUsernameAvailability } from "../controllers/agents.controller.js";
import { agentSignIn } from "../controllers/agentSignIn.controller.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/erros.js";
import Agent from "../models/agents.model.js";

const router = express.Router();

// Test route to check JWT secret
router.get("/agents/check-env", async (req, res, next) => {
    try {
        console.log("Checking environment variables");
        // Don't expose the actual secret, just check if it exists
        const hasJwtSecret = !!process.env.JWT_SECRET;
        res.status(200).json({ 
            hasJwtSecret,
            message: hasJwtSecret ? "JWT_SECRET is configured" : "JWT_SECRET is not configured"
        });
    } catch (error) {
        console.error("Environment check error:", error);
        next(error);
    }
});

// Add agent login route - specific routes first
router.post("/agents/login", agentSignIn);

// Add agent auth status route
router.get("/agents/auth-status", async (req, res, next) => {
    console.log("Agent auth-status check initiated");
    console.log("Cookies received:", req.cookies);
    
    try {
        // Check if token exists
        const token = req.cookies.agent_token;
        console.log("Agent token from cookies:", token ? "Token present" : "No token found");
        
        if (!token) {
            console.log("Agent auth-status failed: No token provided");
            return next(errorHandler(401, "Unauthorized - No token provided"));
        }

        // Verify token
        try {
            // Check if JWT_SECRET is defined
            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET environment variable is not defined");
                return next(errorHandler(500, "Server configuration error"));
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Agent token decoded successfully, agent ID:", decoded.id);
            
            // Find agent by ID
            const agent = await Agent.findById(decoded.id).select("-password");
            
            if (!agent) {
                console.log(`Agent auth-status failed: No agent found with ID ${decoded.id}`);
                return next(errorHandler(404, "Agent not found"));
            }
            
            console.log(`Agent found with ID ${decoded.id}, auth-status successful`);
            
            // Return agent data
            res.status(200).json(agent);
        } catch (jwtError) {
            console.error("JWT verification failed:", jwtError);
            return next(errorHandler(401, "Unauthorized - Invalid token"));
        }
    } catch (error) {
        console.error("Agent auth-status error:", error);
        next(errorHandler(401, "Unauthorized - Server error"));
    }
});

// General routes after specific ones
router.get("/agents", agents);
router.get("/check-username", checkUsernameAvailability);
router.get("/agents/:id", getAgent);
router.put("/agents/:id", updateAgent);
router.delete("/agents/:id", deleteAgent);

export default router;