import express from "express";
import { register, login } from "../Controllers/authController.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // ✅ Make sure you import your actual User model

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
      return res.status(400).json({ message: "Email is required." });
    }

    // ✅ Step 2: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Step 3: Simulate sending email or token
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

    // ✅ Step 1: Validate fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // ✅ Step 2: Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // ✅ Step 3: Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // ✅ Step 4: Send only one response
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
