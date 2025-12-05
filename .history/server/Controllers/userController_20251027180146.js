import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ================== CREATE USER ==================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, contactNumber, role } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      contactNumber,
      role: role || "user",
    });

    await user.save();
    res.status(201).json({ success: true, message: "User created successfully.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ================== GET ALL USERS ==================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -confirmPassword");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ================== GET SINGLE USER ==================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -confirmPassword");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ================== UPDATE USER ==================
export const updateUser = async (req, res) => {
  try {
    const { name, email, contactNumber, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.contactNumber = contactNumber || user.contactNumber;
    user.role = role || user.role;

    await user.save();
    res.status(200).json({ success: true, message: "User updated successfully.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ================== DELETE USER ==================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ================== RESET PASSWORD ==================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();
    res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
