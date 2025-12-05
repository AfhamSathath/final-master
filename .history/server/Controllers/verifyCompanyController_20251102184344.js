import fs from "fs";
import path from "path";
import axios from "axios";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const Jimp = JimpPkg.default || JimpPkg;

// ====================== HELPERS ======================
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");

function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("⚠️ Failed to unlink:", err.message);
  }
}

async function downloadImage(url) {
  const fileName = `url_logo_${Date.now()}.jpg`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  try {
    const response = await axios({ url, responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);
    return filePath;
  } catch (err) {
    console.error("❌ Failed to download logo:", err.message);
    return null;
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
  const len = Math.min(hashA.length, hashB.length);
  for (let i = 0; i < len; i++) if (hashA[i] !== hashB[i]) dist++;
  return dist;
}

// =============================================================
// ✅ VERIFY COMPANY
// =============================================================
export const verifyCompany = async (req, res) => {
  let tempPath = null;
  try {
    const { companyName, logoUrl } = req.body;

    if (!companyName || (!req.file && !logoUrl)) {
      return res.status(400).json({
        verified: false,
        message: "Missing company name or logo (file or URL).",
      });
    }

    const company = await Company.findOne({ name: companyName });
    if (!company) {
      if (req.file?.path) safeUnlink(req.file.path);
      return res.status(404).json({
        verified: false,
        message: "Company not found in database.",
      });
    }

    if (!company.logoHash) {
      if (req.file?.path) safeUnlink(req.file.path);
      return res.status(400).json({
        verified: false,
        message: "No stored logo hash for this company.",
      });
    }

    // Determine logo source
    if (req.file?.path) {
      tempPath = req.file.path;
    } else if (logoUrl) {
      tempPath = await downloadImage(logoUrl);
      if (!tempPath)
        return res.status(400).json({
          verified: false,
          message: "Failed to download logo from URL.",
        });
    }

    const uploadedHash = await computeHash(tempPath);
    const distance = hammingDistance(uploadedHash, company.logoHash);
    const THRESHOLD = 10;

    console.log(
      `🔍 Compare → Uploaded: ${uploadedHash.slice(0, 10)} | Stored: ${company.logoHash.slice(0, 10)} | Distance: ${distance}`
    );

    safeUnlink(tempPath);

    if (distance <= THRESHOLD) {
      return res.status(200).json({
        verified: true,
        message: "✅ Company verified successfully!",
        distance,
      });
    } else {
      return res.status(200).json({
        verified: false,
        message: "❌ Logo mismatch. Please upload the correct logo.",
        distance,
      });
    }
  } catch (error) {
    console.error("❌ Verify company error:", error);
    if (tempPath) safeUnlink(tempPath);
    res.status(500).json({
      verified: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =============================================================
// ✅ CRUD CONTROLLERS
// =============================================================

// GET ALL COMPANIES
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch companies", error: err.message });
  }
};

// GET ONE COMPANY
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch company", error: err.message });
  }
};

// UPDATE COMPANY (name, logoHash, etc.)
export const updateCompany = async (req, res) => {
  let tempPath = null;
  try {
    const { name } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (name) company.name = name;

    if (req.file?.path) {
      tempPath = req.file.path;
      const newHash = await computeHash(tempPath);
      company.logoHash = newHash;
      safeUnlink(tempPath);
    }

    await company.save();
    res.status(200).json({ message: "✅ Company updated successfully", company });
  } catch (err) {
    console.error("Update error:", err);
    if (tempPath) safeUnlink(tempPath);
    res.status(500).json({ message: "Failed to update company", error: err.message });
  }
};

// DELETE COMPANY
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "🗑️ Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete company", error: err.message });
  }
};
