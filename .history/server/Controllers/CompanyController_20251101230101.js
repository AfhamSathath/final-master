import Company from "../models/Company.js";
import bcrypt from "bcryptjs";
import generateToken from "../src/utils/generateToken.js";
import * as fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";

// Robust import for Jimp to handle default vs named export across environments
import * as JimpPkg from "jimp";
const Jimp = (JimpPkg && JimpPkg.default) ? JimpPkg.default : JimpPkg;

// ================== UPLOAD DIR / MULTER CONFIGURATION ==================
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "companies");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({ dest: UPLOAD_DIR });

// ================== HELPER: COMPUTE IMAGE HASH (stable) ==================
// We resize + grayscale then compute a sha256 of the bitmap bytes.
// This avoids relying on Jimp's optional `hash()` method (not always available).
async function computeHash(filePath) {
  const image = await Jimp.read(filePath);
  // normalize size to reduce sensitivity to small differences
  image.resize(128, 128);
  image.grayscale();
  const buffer = image.bitmap.data; // Buffer/Uint8Array
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return hash;
}

// Safe file delete helper
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    // don't crash on cleanup errors; log for debugging
    console.warn("Failed to unlink file:", filePath, err && err.message);
  }
}

// ================== CREATE COMPANY ==================
export const createCompany = [
  upload.single("logo"), // multer middleware to accept 'logo'
  async (req, res) => {
    try {
      const { name, location, email, contactNumber, regNumber, password } = req.body;

      // basic required fields check
      if (!name || !email || !contactNumber || !regNumber || !password || !location) {
        // cleanup uploaded file if any
        if (req.file?.path) safeUnlink(req.file.path);
        return res.status(400).json({ message: "Please provide all required fields" });
      }

      const existingCompany = await Company.findOne({ email });
      if (existingCompany) {
        if (req.file?.path) safeUnlink(req.file.path);
        return res.status(400).json({ message: "Company already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let logoHash = null;
      let logoFile = null;

      if (req.file && req.file.path) {
        try {
          logoFile = req.file.filename; // stored filename by multer
          logoHash = await computeHash(req.file.path);
        } catch (err) {
          // if hashing fails, cleanup file and return error
          safeUnlink(req.file.path);
          console.error("Error processing logo:", err);
          return res.status(500).json({ message: "Error processing uploaded logo" });
        } finally {
          // remove temp file after hashing (we're storing only hash + filename)
          if (req.file?.path) safeUnlink(req.file.path);
        }
      }

      const newCompany = new Company({
        name,
        location,
        email,
        contactNumber,
        regNumber,
        password: hashedPassword,
        logo: logoFile,   // optional - if you want to persist file path elsewhere adjust logic
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
      // cleanup uploaded file if present (defensive)
      if (req.file?.path) safeUnlink(req.file.path);
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
