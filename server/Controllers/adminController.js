import User from "../models/User.js";
import Company from "../models/Company.js";
import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";
import generateToken from "../src/utils/generateToken.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

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
        break;
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

    let account = await User.findOne({ email: normalizedEmail });
    let role = "user";

    if (!account) {
      account = await Company.findOne({ email: normalizedEmail });
      role = "company";
    }

    if (!account) {
      account = await Admin.findOne({ email: normalizedEmail });
      role = "admin";
    }

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
      role,
      token: generateToken(account._id, role),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN CRUD =================

// GET all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password"); // hide passwords
    res.status(200).json(admins);
  } catch (error) {
    console.error("Get Admins error:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

// CREATE new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    });
  } catch (error) {
    console.error("Create Admin error:", error);
    res.status(500).json({ message: "Failed to create admin" });
  }
};

// UPDATE admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, { new: true }).select("-password");

    if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error("Update Admin error:", error);
    res.status(500).json({ message: "Failed to update admin" });
  }
};

// DELETE admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete Admin error:", error);
    res.status(500).json({ message: "Failed to delete admin" });
  }
};
