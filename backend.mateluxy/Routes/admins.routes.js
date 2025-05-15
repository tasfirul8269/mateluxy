import express from "express";
import { 
  admins, 
  updateAdmin, 
  deleteAdmin, 
  checkUsernameAvailability,
  getCurrentAdmin
} from "../controllers/admins.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Protected routes - require authentication
router.get("/profile", verifyToken, getCurrentAdmin);
router.put("/:id", verifyToken, updateAdmin);

// Admin-only routes - in a real app, you'd add additional middleware to check admin role
router.get("/", verifyToken, admins);
router.delete("/:id", verifyToken, deleteAdmin);

// Public routes
router.get("/check-username", checkUsernameAvailability);

export default router;