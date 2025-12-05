import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Admin from "../models/admin.js";
import { register, login } from "../Controllers/authController.js";

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

    // ✅ Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const trimmedEmail = email.trim();

    // ✅ Check if email exists in User, Company, or Admin
    const user = await User.findOne({ email: trimmedEmail });
    const company = await Company.findOne({ email: trimmedEmail });
    const admin = await Admin.findOne({ email: trimmedEmail });

    if (!user && !company && !admin) {
      return res.status(404).json({ success: false, message: "Email not found in any account." });
    }

    // ✅ Simulate sending reset link (in real app, generate token and send email)
    console.log(`Password reset link sent to ${trimmedEmail}`);

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

    // ✅ Validate input
    if (!email || !password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const trimmedEmail = email.trim();

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

export default router;
