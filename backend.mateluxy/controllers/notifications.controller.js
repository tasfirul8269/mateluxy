import Notification from "../models/notification.model.js";
import Admin from "../models/admin.model.js";
import { errorHandler } from "../utils/erros.js";

// Get all notifications for the authenticated user
export const getNotifications = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    
    // Populate the createdBy field to get the admin name
    const notifications = await Notification.find({ recipient: adminId })
      .populate('createdBy', 'fullName') // Populate only the fullName field
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`Found ${notifications.length} notifications for admin ${adminId}`);
    
    // Format the response to include createdByName
    const formattedNotifications = notifications.map(notification => {
      const notificationObj = notification.toObject();
      
      // Add createdByName field if createdBy exists and has fullName
      if (notification.createdBy && notification.createdBy.fullName) {
        notificationObj.createdByName = notification.createdBy.fullName;
      }
      
      return notificationObj;
    });
    
    res.status(200).json(formattedNotifications);
  } catch (error) {
    next(error);
  }
};

// Create a new notification
export const createNotification = async (req, res, next) => {
  try {
    const { type, message, entityId, entityName, recipients } = req.body;
    
    // Validate required fields
    if (!type || !message) {
      return next(errorHandler(400, "Type and message are required"));
    }
    
    // The admin who is making the change (the creator of the notification)
    const createdById = req.user.id;
    
    console.log(`Creating notification of type: ${type}`);
    console.log(`- Created by admin: ${createdById}`);
    console.log(`- Message: ${message}`);
    
    // Always get all admins - this ensures notifications go to everyone including initiator
    let notificationRecipients = [];
    try {
      // Get all admins
      const allAdmins = await Admin.find({}, '_id');
      notificationRecipients = allAdmins.map(admin => admin._id.toString());
      console.log(`- Sending to ${notificationRecipients.length} admin(s)`);
    } catch (err) {
      console.error("Error getting admin list:", err);
      // Fallback to specified recipients or just the current admin if we can't get all admins
      notificationRecipients = recipients || [createdById];
      console.log(`- Fallback: sending to ${notificationRecipients.length} admin(s)`);
    }
    
    // Create notifications for all recipients
    const notifications = await Promise.all(
      notificationRecipients.map(recipient => {
        console.log(`- Creating notification for recipient: ${recipient}`);
        return Notification.create({
          type,
          message,
          entityId: entityId || null,
          entityName: entityName || null,
          recipient,
          createdBy: createdById // The admin who made the change
        });
      })
    );
    
    console.log(`Created ${notifications.length} notification(s) successfully`);
    res.status(201).json(notifications);
  } catch (error) {
    console.error("Error creating notifications:", error);
    next(error);
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: adminId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return next(errorHandler(404, "Notification not found"));
    }
    
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    
    const result = await Notification.updateMany(
      { recipient: adminId, read: false },
      { read: true }
    );
    
    res.status(200).json({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    next(error);
  }
}; 