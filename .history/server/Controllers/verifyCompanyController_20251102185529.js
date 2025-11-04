import fs from "fs";
import path from "path";
import axios from "axios";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const Jimp = JimpPkg.default || JimpPkg;
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ============= Utility Functions =============
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("Failed to unlink:", err.message);
  }
}

async function computeHash(filePath) {
  const image = await Jimp.read(filePath);
  image.resize(256, 256);
  return image.hash();
}

function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  let dist = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

// ============= Controller Methods =============

// ✅ Verify company by logo
export const verifyCompany = async (req, res) => {
  let tempPath = null;
  try {
    const { companyName } = req.body;

    if (!companyName || !req.file) {
      return res.status(400).json({
        verified: false,
        message: "Missing company name or logo file.",
      });
    }

    const company = await Company.findOne({ name: companyName });
    if (!company) {
      safeUnlink(req.file.path);
      return res
        .status(404)
        .json({ verified: false, message: "Company not found." });
    }

    if (!company.logoHash) {
      safeUnlink(req.file.path);
      return res
        .status(400)
        .json({ verified: false, message: "Stored logo hash not found." });
    }

    tempPath = req.file.path;
    const uploadedHash = await computeHash(tempPath);
    const distance = hammingDistance(uploadedHash, company.logoHash);
    const THRESHOLD = 10;

    safeUnlink(tempPath);

    if (distance <= THRESHOLD) {
      return res.json({
        verified: true,
        message: "✅ Company verified successfully!",
        distance,
      });
    } else {
      return res.json({
        verified: false,
        message: "❌ Logo mismatch. Please upload the correct logo.",
        distance,
      });
    }
  } catch (err) {
    console.error("❌ Verification Error:", err);
    if (tempPath) safeUnlink(tempPath);
    res.status(500).json({
      verified: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// ✅ CRUD
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, email, address, website } = req.body;
    let updateData = { name, email, address, website };

    if (req.file) {
      const hash = await computeHash(req.file.path);
      updateData.logoHash = hash;
      safeUnlink(req.file.path);
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
