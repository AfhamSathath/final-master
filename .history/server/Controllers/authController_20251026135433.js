// Controllers/authController.js
import User from "../models/User.js";
import Company from "../models/Company.js";
import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import generateToken from "../src/utils/generateToken.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate accounts
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingCompany = await Company.findOne({ email: normalizedEmail });
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingUser || existingCompany || existingAdmin) {
      return res.status(400).json({ message: "Account already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let account;
    switch (role) {
      case "company":
        account = await Company.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "company",
        });
        break;
      case "admin":
        account = await Admin.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "admin",
        });
        break;
      default:
        account = await User.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "user",
        });
    }

    return res.status(201).json({
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      token: generateToken(account._id, account.role),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const account =
      (await User.findOne({ email: normalizedEmail })) ||
      (await Company.findOne({ email: normalizedEmail })) ||
      (await Admin.findOne({ email: normalizedEmail }));

    if (!account || !account.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      token: generateToken(account._id, account.role),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();

    const user =
      (await User.findOne({ email: normalizedEmail })) ||
      (await Company.findOne({ email: normalizedEmail })) ||
      (await Admin.findOne({ email: normalizedEmail }));

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: ${resetLink}`,
    });

    return res.json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user =
      (await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })) ||
      (await Company.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })) ||
      (await Admin.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } }));

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
