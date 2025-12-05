import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User.js";
import { register, login } from "../Controllers/authController.js";

dotenv.config();
const router = express.Router();

// ====================
// REGISTER & LOGIN
// ====================
router.post("/register", register);
router.post("/login", login);

// ====================
// FORGOT PASSWORD
// ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    // Save token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;

    // ====================
    // Nodemailer setup (Gmail with App Password)
    // ====================
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || "User"},</p>
          <p>You recently requested to reset your password.</p>
          <p>Click the link below to reset it. The link will expire in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" 
             style="background-color:#007BFF; color:#fff; padding:10px 15px; text-decoration:none; border-radius:5px;">
             Reset Password
          </a>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <br/>
          <p>Thanks,<br/>Your Support Team</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Password reset link sent successfully. Check your email inbox.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({
      message: "Error sending reset email. Please try again later.",
    });
  }
});

// ====================
// RESET PASSWORD
// ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res
        .status(400)
        .json({ message: "Email, token, and new password are required." });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({
      message: "Server error while resetting password. Try again later.",
    });
  }
});

export default router;
