import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User.js";
import { register, login } from "../Controllers/authController.js";

dotenv.config();
const router = express.Router();

// Register & Login
router.post("/register", register);
router.post("/login", login);

// Forgot Password (Mailtrap version)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;

    // =====================
    // Mailtrap SMTP Setup
    // =====================
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: `"Dev Team" <no-reply@example.com>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.name || "User"},</p>
        <p>Click the link below to reset your password. The link expires in 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent (check Mailtrap)." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Reset Password
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
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
