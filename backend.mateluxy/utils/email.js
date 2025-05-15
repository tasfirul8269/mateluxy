import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For production, use actual SMTP credentials
  // For development, use a testing service like Ethereal or Mailtrap
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @param {string} options.from - Sender email (optional, defaults to configured email)
 * @returns {Promise} - Resolves with info about the sent email
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"MateLuxy Team" <${process.env.EMAIL_USER || 'noreply@mateluxy.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
