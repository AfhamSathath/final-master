import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Make sure your User model is correct
import { register, login } from "../Controllers/authController.js";
import Company from "../models/Company.js";
import admin from "../models/admin.js";

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

    // ✅ Step 1: Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // ✅ Step 2: Check if user exists
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }else if(!Company){
      return res.status(404).json({ success: false, message: "Company not found." });
    }else if(!admin){
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    // ✅ Step 3: Generate a reset token (for real apps)
    // For now, we just simulate email sending
    console.log(`Password reset link sent to ${email}`);

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
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
// RESET PASSWORD
// ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Step 1: Validate input
    if (!email || !password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // ✅ Step 2: Find user
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // ✅ Step 3: Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Step 4: Update user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

export default router;
