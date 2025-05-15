// backend/middleware/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  
  console.log('Verifying token:', token ? 'Token exists' : 'No token');
  console.log('Cookies received:', req.cookies);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

  if (!token) {
    console.log('No access_token cookie found');
    return res.status(401).json({ success: false, message: "No authentication token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
