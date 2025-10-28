import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ================== CREATE USER ==================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, contactNumber } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      contactNumber,
    });

    await newUser.save();

    // Exclude password from response
    const { password: pw, confirmPassword: cpw, ...userData } = newUser._doc;

    res.status(201).json({ message: "User created successfully", user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// ================== GET ALL USERS ==================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -confirmPassword");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// ================== GET SINGLE USER ==================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -confirmPassword");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// ================== UPDATE USER ==================
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, contactNumber } = req.body;

    const updatedData = { name, email, role, contactNumber };

    // If password provided, hash it
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true }).select("-password -confirmPassword");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// ================== DELETE USER ==================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
