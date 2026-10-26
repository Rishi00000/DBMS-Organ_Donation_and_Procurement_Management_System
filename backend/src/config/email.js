import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration (only if email is configured)
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
    process.env.EMAIL_USER !== 'your_email@gmail.com') {
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️  Email transporter verification failed:', error.message);
      console.warn('⚠️  Email notifications will not work. This is optional for development.');
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('ℹ️  Email not configured - Email notifications disabled (optional)');
}

// Send email helper function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'LifeLink System <noreply@lifelink.local>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  matchNotification: (recipientName, organType, donorHospital) => ({
    subject: '🎯 Potential Organ Match Found - LifeLink',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Potential Organ Match Found!</h2>
        <p>Dear ${recipientName},</p>
        <p>We have found a potential match for your required <strong>${organType}</strong> transplant.</p>
        <p><strong>Donor Hospital:</strong> ${donorHospital}</p>
        <p>Please contact your transplant coordinator immediately for further details.</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          This is an automated message from LifeLink.
        </p>
      </div>
    `,
    text: `Potential Organ Match Found!\n\nDear ${recipientName},\n\nWe have found a potential match for your required ${organType} transplant.\n\nDonor Hospital: ${donorHospital}\n\nPlease contact your transplant coordinator immediately.`,
  }),

  transplantStatusUpdate: (recipientName, status, details) => ({
    subject: `Transplant Status Update - ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Transplant Status Update</h2>
        <p>Dear ${recipientName},</p>
        <p>Your transplant status has been updated to: <strong>${status}</strong></p>
        ${details ? `<p>${details}</p>` : ''}
        <p>For more information, please contact your healthcare provider.</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          This is an automated message from LifeLink.
        </p>
      </div>
    `,
    text: `Transplant Status Update\n\nDear ${recipientName},\n\nYour transplant status has been updated to: ${status}\n\n${details || ''}`,
  }),

  welcomeEmail: (name, username, role) => ({
    subject: 'Welcome to LifeLink - Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to LifeLink!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been successfully created.</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p>You can now log in to the system and access your dashboard.</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          This is an automated message from LifeLink.
        </p>
      </div>
    `,
    text: `Welcome to LifeLink!\n\nDear ${name},\n\nYour account has been successfully created.\nUsername: ${username}\nRole: ${role}`,
  }),
};

export default transporter;
