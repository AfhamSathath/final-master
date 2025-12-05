import Company from "../models/Company.js";
import bcrypt from "bcryptjs";

// ====================
// CREATE Company
// ====================
export const createCompany = async (req, res) => {
  try {
    const { name, email, contactNumber, regNumber, password, confirmPassword } = req.body;

    if (!name || !email || !contactNumber || !regNumber || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ success: false, message: "Company already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCompany = new Company({
      name,
      email,
      contactNumber,
      regNumber,
      password: hashedPassword,
      confirmPassword: hashedPassword, // store hashed password
    });

    await newCompany.save();

    res.status(201).json({ success: true, message: "Company created successfully", company: newCompany });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================
// READ All Companies
// ====================
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select("-password -confirmPassword");
    res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================
// READ Single Company by ID
// ====================
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password -confirmPassword");
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================
// UPDATE Company
// ====================
export const updateCompany = async (req, res) => {
  try {
    const { name, email, contactNumber, regNumber, password } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      company.password = hashedPassword;
      company.confirmPassword = hashedPassword;
    }

    company.name = name || company.name;
    company.email = email || company.email;
    company.contactNumber = contactNumber || company.contactNumber;
    company.regNumber = regNumber || company.regNumber;

    await company.save();

    res.status(200).json({ success: true, message: "Company updated successfully", company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================
// DELETE Company
// ====================
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
