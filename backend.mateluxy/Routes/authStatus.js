// backend/routes/auth.js
import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

router.get("/check-auth", verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: "Authorized" });
});

// Enhanced logout endpoint
router.post("/logout", (req, res) => {
  // Clear the authentication cookie - make sure to match the cookie settings from login
  res.clearCookie('access_token', { 
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/'
  }).status(200).json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

export default router;
