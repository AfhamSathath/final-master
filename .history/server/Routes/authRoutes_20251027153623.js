import express from "express";
import { register, login } from "../Controllers/authController.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Admin from "../models/admin.js"; // ✅ Make sure you import your actual User model

const router = express.Router();

// ====================
// REGISTER & LOGIN
// ====================
router.post("/register", register);
router.post("/login", login);

// ====================
// FORGOT PASSWORD
// ====================



// 🔹 Utility function to find user from any collection
async function findAccountByEmail(email) {
  const user = await User.findOne({ email });
  if (user) return { account: user, type: "User" };

  const company = await Company.findOne({ email });
  if (company) return { account: company, type: "Company" };

  const admin = await Admin.findOne({ email });
  if (admin) return { account: admin, type: "Admin" };

  return null;
}

// ====================
// FORGOT PASSWORD
// ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // ✅ Find account (User, Company, or Admin)
    const result = await findAccountByEmail(email);
    if (!result) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    const { account, type } = result;

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    account.resetPasswordToken = resetToken;
    account.resetPasswordExpires = tokenExpiry;
    await account.save();

    // ✅ Send email (for now, console log)
    console.log(`🔗 ${type} password reset link: http://localhost:3000/reset-password/${resetToken}`);

    return res.status(200).json({
      success: true,
      message: `Password reset link sent to ${email} (${type}).`,
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
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    // ✅ Try to find the user from any collection
    let account =
      (await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })) ||
      (await Company.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })) ||
      (await Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }));

    if (!account) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    // ✅ Hash and update password
    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(password, salt);

    // ✅ Remove token fields
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;

    await account.save();

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
