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
    const { email, type } = req.body; // type: "user" | "company" | "admin"

    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required." });
    }

    // Choose the correct model
    let Model;
    if (type === "user") Model = User;
    else if (type === "company") Model = Company;
    else if (type === "admin") Model = Admin;
    else return res.status(400).json({ message: "Invalid account type." });

    const entity = await Model.findOne({ email });
    if (!entity) {
      return res.status(404).json({ message: `${type} not found.` });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    entity.resetPasswordToken = resetToken;
    entity.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await entity.save();

    console.log(
      `Password reset link for ${type} (${email}): http://localhost:3000/reset-password?token=${resetToken}&email=${email}&type=${type}`
    );

    return res.status(200).json({
      success: true,
      message: `Password reset link sent to ${email}.`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

/**
 * RESET PASSWORD
 * Supports Users, Companies, and Admins
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, token, type } = req.body;

    if (!email || !password || !token || !type) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Choose the correct model
    let Model;
    if (type === "user") Model = User;
    else if (type === "company") Model = Company;
    else if (type === "admin") Model = Admin;
    else return res.status(400).json({ message: "Invalid account type." });

    const entity = await Model.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token not expired
    });

    if (!entity) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    entity.password = await bcrypt.hash(password, salt);

    // Remove token after successful reset
    entity.resetPasswordToken = undefined;
    entity.resetPasswordExpires = undefined;

    await entity.save();

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
