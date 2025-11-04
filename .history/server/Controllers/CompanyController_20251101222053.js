import Company from "../models/Company.js";
import bcrypt from "bcryptjs";
import generateToken from "../src/utils/generateToken.js";
import * as Jimp from "jimp";
import fs from "fs";
import path from "path";
import multer from "multer";


// ================== MULTER CONFIGURATION ==================
const upload = multer({ dest: path.join("uploads/companies/") });

// ================== HELPER: COMPUTE IMAGE HASH ==================
async function computeHash(filePath) {
  const img = await Jimp.read(filePath);
  return img.hash(); // returns a perceptual hash string
}

// ================== CREATE COMPANY ==================
export const createCompany = [
  upload.single("logo"), // handle logo upload
  async (req, res) => {
    try {
      const { name, location, email, contactNumber, regNumber, password } = req.body;

      if (!name || !email || !contactNumber || !regNumber || !password || !location) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Please provide all required fields" });
      }

      const existingCompany = await Company.findOne({ email });
      if (existingCompany) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Company already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let logoHash = null;
      let logoFile = null;

      if (req.file) {
        logoFile = req.file.filename;
        logoHash = await computeHash(req.file.path);
        fs.unlinkSync(req.file.path); // delete temp file
      }

      const newCompany = new Company({
        name,
        location,
        email,
        contactNumber,
        regNumber,
        password: hashedPassword,
        logo: logoFile,
        logoHash,
        role: "company",
      });

      await newCompany.save();

      res.status(201).json({
        message: "Company created successfully",
        company: {
          _id: newCompany._id,
          name: newCompany.name,
          email: newCompany.email,
          contactNumber: newCompany.contactNumber,
          regNumber: newCompany.regNumber,
          location: newCompany.location,
          role: newCompany.role,
          token: generateToken(newCompany._id, "company"),
        },
      });
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Error creating company", error: error.message });
    }
  },
];

// ================== GET ALL COMPANIES ==================
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ role: "company" }).select("-password");
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching companies", error: error.message });
  }
};

// ================== GET SINGLE COMPANY ==================
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password");
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Error fetching company", error: error.message });
  }
};

// ================== UPDATE COMPANY (ADMIN/GENERAL) ==================
export const updateCompany = async (req, res) => {
  try {
    const { name, location, email, contactNumber, regNumber, password, address } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (location) updatedData.location = location;
    if (email) updatedData.email = email;
    if (contactNumber) updatedData.contactNumber = contactNumber;
    if (regNumber) updatedData.regNumber = regNumber;
    if (address) updatedData.address = address;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const company = await Company.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    }).select("-password");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company updated successfully", company });
  } catch (error) {
    res.status(500).json({ message: "Error updating company", error: error.message });
  }
};

// ================== DELETE COMPANY (ADMIN/GENERAL) ==================
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error: error.message });
  }
};

// ================== GET LOGGED-IN COMPANY PROFILE ==================
export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.id).select("-password");
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Error fetching company profile", error: error.message });
  }
};

// ================== UPDATE LOGGED-IN COMPANY ==================
export const updateMyCompany = async (req, res) => {
  try {
    const { name, location, email, contactNumber, regNumber, password, address } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (location) updatedData.location = location;
    if (email) updatedData.email = email;
    if (contactNumber) updatedData.contactNumber = contactNumber;
    if (regNumber) updatedData.regNumber = regNumber;
    if (address) updatedData.address = address;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const company = await Company.findByIdAndUpdate(req.user.id, updatedData, {
      new: true,
    }).select("-password");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company updated successfully", company });
  } catch (error) {
    res.status(500).json({ message: "Error updating company", error: error.message });
  }
};

// ================== DELETE LOGGED-IN COMPANY ==================
export const deleteMyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.user.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error: error.message });
  }
};
