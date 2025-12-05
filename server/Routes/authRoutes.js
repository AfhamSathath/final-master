import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Admin from "../models/admin.js";
import OTP from "../models/OTP.js";
import { register, login } from "../Controllers/authController.js";

const router = express.Router();

// ================== EMAIL TRANSPORTER ==================
// Development mode: skip actual email sending, just log OTP to console
const transporter = {
  sendMail: async (options) => {
    console.log("\n📧 EMAIL WOULD BE SENT:");
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    // Extract OTP from HTML
    const otpMatch = options.html.match(/style="color: #2563eb;[^>]*>(\d{6})</);
    const otp = otpMatch ? otpMatch[1] : "OTP_NOT_FOUND";
    console.log(`   🔑 OTP: ${otp}`);
    console.log("   (Copy this OTP and use it to verify)\n");
    return { messageId: "dev-mode" };
  },
};

console.log("✅ Email transporter (DEV MODE - Console logging) is ready");
// ====================
// REGISTER & LOGIN
// ====================
router.post("/register", register);
router.post("/login", login);

// ====================
// FORGOT PASSWORD - SEND OTP
// ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // ✅ Check if email exists in User, Company, or Admin
    const user = await User.findOne({ email: trimmedEmail });
    const company = await Company.findOne({ email: trimmedEmail });
    const admin = await Admin.findOne({ email: trimmedEmail });

    if (!user && !company && !admin) {
      return res.status(404).json({ success: false, message: "Email not found in any account." });
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Delete any previous OTP for this email
    await OTP.deleteMany({ email: trimmedEmail });

    // ✅ Save new OTP to database
    const otpRecord = new OTP({ email: trimmedEmail, otp });
    await otpRecord.save();

    // ✅ Send OTP via email
    const mailOptions = {
      from: "kristofer.hane@ethereal.email", // Ethereal test email
      to: trimmedEmail,
      subject: "Password Reset OTP - Job Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 16px;">You have requested to reset your password. Here is your One-Time Password (OTP):</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>⏱️ This OTP will expire in 10 minutes.</strong>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you did not request a password reset, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Job Portal. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email successfully.",
      email: trimmedEmail, // Include email for frontend verification page
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// ====================
// VERIFY OTP
// ====================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ✅ Validate input
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // ✅ Find OTP in database
    const otpRecord = await OTP.findOne({ email: trimmedEmail, otp });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // ✅ OTP is valid - delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    // ✅ Check if user exists (for frontend to proceed to password reset)
    const user = await User.findOne({ email: trimmedEmail });
    const company = await Company.findOne({ email: trimmedEmail });
    const admin = await Admin.findOne({ email: trimmedEmail });

    if (!user && !company && !admin) {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      email: trimmedEmail,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// ====================
// RESET PASSWORD
// ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // ✅ Find account in User, Company, or Admin
    let account = await User.findOne({ email: trimmedEmail });
    let accountType = "User";

    if (!account) {
      account = await Company.findOne({ email: trimmedEmail });
      accountType = "Company";
    }
    if (!account) {
      account = await Admin.findOne({ email: trimmedEmail });
      accountType = "Admin";
    }

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    // ✅ Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Update password
    account.password = hashedPassword;
    await account.save();

    return res.status(200).json({
      success: true,
      message: `${accountType} password updated successfully!`,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// ====================
// REGISTRATION - SEND OTP
// ====================
router.post("/register-send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;

    // ✅ Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // ✅ Check if email is already registered
    const existingUser = await User.findOne({ email: trimmedEmail });
    const existingCompany = await Company.findOne({ email: trimmedEmail });
    const existingAdmin = await Admin.findOne({ email: trimmedEmail });

    if (existingUser || existingCompany || existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered. Please login or use a different email.",
      });
    }

    // ✅ Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Delete any existing OTP for this email
    await OTP.deleteMany({ email: trimmedEmail });

    // ✅ Save new OTP to database (with 10-minute TTL)
    const otpRecord = new OTP({
      email: trimmedEmail,
      otp: otpCode,
    });
    await otpRecord.save();

    // ✅ Send email via Nodemailer
    const mailOptions = {
      from: "noreply@jobportal.com",
      to: trimmedEmail,
      subject: "Email Verification - Registration OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Job Portal!</h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${name || "User"}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
            Thank you for registering. Please verify your email address to complete your registration.
          </p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 10px 0;">
              <span style="color: #2563eb;">${otpCode}</span>
            </p>
            <p style="color: #9ca3af; font-size: 13px;">This code will expire in 10 minutes</p>
          </div>
          <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">
            If you did not sign up for this account, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 20px;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © 2025 Job Portal. All rights reserved.
          </p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Send registration OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
  }
});

// ====================
// REGISTRATION - VERIFY OTP
// ====================
router.post("/register-verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ✅ Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!otp || otp.trim() === "") {
      return res.status(400).json({ success: false, message: "OTP is required." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.trim();

    // ✅ Find OTP in database
    const otpRecord = await OTP.findOne({ email: trimmedEmail });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found or has expired. Please request a new one.",
      });
    }

    // ✅ Verify OTP matches
    if (otpRecord.otp !== trimmedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // ✅ Delete OTP after successful verification (one-time use)
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Proceed with registration.",
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

export default router;
