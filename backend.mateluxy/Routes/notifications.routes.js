import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { 
  getNotifications, 
  createNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "../controllers/notifications.controller.js";

const router = express.Router();

// Get all notifications
router.get("/", verifyToken, getNotifications);

// Create a new notification
router.post("/", verifyToken, createNotification);

// Mark all notifications as read
router.put("/mark-all-read", verifyToken, markAllNotificationsAsRead);

// Mark a notification as read
router.put("/:id/read", verifyToken, markNotificationAsRead);

export default router; 