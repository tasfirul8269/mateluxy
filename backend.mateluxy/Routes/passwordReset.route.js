import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordReset.controller.js";

const router = express.Router();

// Route for requesting a password reset
router.post("/forgot-password", forgotPassword);

// Route for resetting the password with a token
router.post("/reset-password/:token", resetPassword);

export default router;
