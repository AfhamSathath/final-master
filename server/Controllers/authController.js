import User from "../models/User.js";
import Company from "../models/Company.js";
import Admin from "../models/admin.js"; // ✅ import Admin
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

    // Check if email exists in any collection
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
      default: // user
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

// ================= LOGIN (Users, Companies & Admins) =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try User
    let account = await User.findOne({ email: normalizedEmail });
    let role = "user";

    // Try Company
    if (!account) {
      account = await Company.findOne({ email: normalizedEmail });
      role = "company";
    }

    // Try Admin
    if (!account) {
      account = await Admin.findOne({ email: normalizedEmail });
      role = "admin";
    }

    if (!account || !account.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success: return account info and token
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


