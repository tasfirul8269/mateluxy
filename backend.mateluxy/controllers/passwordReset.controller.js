import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/erros.js";
import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Create a schema for password reset tokens if it doesn't exist
import mongoose from "mongoose";

// Check if the schema already exists to avoid model overwrite errors
const PasswordResetToken = mongoose.models.PasswordResetToken || 
  mongoose.model('PasswordResetToken', new mongoose.Schema({
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Admin'
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600 // Token expires after 1 hour
    }
  }));

// Create a test account for development and a real transporter for production
const createTransporter = async () => {
  // For development/testing, create a test account if no email credentials are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('No email credentials found, creating a test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test email account created:');
    console.log('- Email:', testAccount.user);
    console.log('- Password:', testAccount.pass);
    
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      }),
      isTestAccount: true,
      testAccount
    };
  }
  
  // For production, use Gmail SMTP
  return {
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }),
    isTestAccount: false
  };
};

// Request a password reset
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log('Email requested:', email);
    
    // Find the admin by email
    console.log('Searching for admin with email:', email);
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('No admin found with email:', email);
      // Return an error message indicating no admin was found with this email
      return res.status(404).json({ 
        success: false,
        message: "No admin account found with this email address."
      });
    }
    
    console.log('Admin found:', admin.username || admin._id);

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the token to the database
    await PasswordResetToken.findOneAndDelete({ adminId: admin._id });
    await new PasswordResetToken({
      adminId: admin._id,
      token: hashedToken
    }).save();

    // Create reset URL using the existing CLIENT_URL environment variable
    // First try the dedicated reset page, but fall back to admin login if needed
    let baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Check if the frontend has been updated with the reset password page
    // If not, redirect to admin login with a reset token parameter as a temporary solution
    const useAdminLoginFallback = process.env.USE_ADMIN_LOGIN_FALLBACK === 'true';
    
    const resetUrl = useAdminLoginFallback
      ? `${baseUrl}/admin-login?reset_token=${resetToken}`
      : `${baseUrl}/reset-password/${resetToken}`;
      
    console.log('Generated reset URL:', resetUrl);
    console.log('CLIENT_URL value:', baseUrl);
    console.log('Using admin login fallback:', useAdminLoginFallback);

    try {
      console.log('Setting up email transport...');
      // Create a transporter (either test or production)
      const { transporter, isTestAccount, testAccount } = await createTransporter();
      console.log('Email transport created, using', isTestAccount ? 'test account' : 'production settings');
      
      // Set up email options
      const from = process.env.EMAIL_FROM || 
                 (isTestAccount ? '"MateLuxy Test" <test@example.com>' : '"MateLuxy" <info@frooxi.com>');
      
      const mailOptions = {
        from,
        to: admin.email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>Hello ${admin.fullName || admin.username},</p>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link is valid for 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thank you,</p>
          <p>The MateLuxy Team</p>
        `
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      
      // If using a test account, log the preview URL
      if (isTestAccount) {
        console.log('\n===== TEST EMAIL SENT =====');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('Click the link above to view the test email');
        console.log('Reset token for testing:', resetToken);
        console.log('Reset URL:', resetUrl);
        console.log('===========================\n');
      }
    } catch (emailError) {
      // If email sending fails, just log the error but don't stop the process
      console.error('\n===== EMAIL SENDING FAILED =====');
      console.error('Error details:', emailError.message);
      console.error('Error stack:', emailError.stack);
      console.log('For development testing, use this reset token:', resetToken);
      console.log('Reset URL:', resetUrl);
      console.log('===============================\n');
    }

    res.status(200).json({
      success: true,
      message: "If your email exists in our system, you will receive a password reset link."
    });

  } catch (error) {
    next(error);
  }
};

// Reset password with token
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from the URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the token in the database
    const resetToken = await PasswordResetToken.findOne({ token: hashedToken });
    if (!resetToken) {
      return next(errorHandler(400, "Invalid or expired token"));
    }

    // Find the admin
    const admin = await Admin.findById(resetToken.adminId);
    if (!admin) {
      return next(errorHandler(400, "Admin not found"));
    }

    // Validate the new password
    if (!password || password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }

    // Hash the new password
    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    // Update the admin's password
    admin.password = hashedPassword;
    await admin.save();

    // Delete the reset token
    await PasswordResetToken.findByIdAndDelete(resetToken._id);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    next(error);
  }
};
