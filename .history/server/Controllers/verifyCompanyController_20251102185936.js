import fs from "fs";
import path from "path";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const Jimp = JimpPkg.default || JimpPkg;
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Helper: safely delete temp files
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("File cleanup failed:", err.message);
  }
}

// Helper: compute hash
async function computeHash(filePath) {
  const image = await Jimp.read(filePath);
  image.resize(256, 256);
  return image.hash();
}

// Helper: compare hashes
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  let dist = 0;
  for (let i = 0; i < hashA.length; i++) if (hashA[i] !== hashB[i]) dist++;
  return dist;
}

// ✅ Register company + upload logo
export const registerCompany = async (req, res) => {
  try {
    const { name, email, address, website } = req.body;

    if (!name || !req.file)
      return res.status(400).json({ message: "Missing company name or logo" });

    const existing = await Company.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Company name already exists" });

    const logoHash = await computeHash(req.file.path);
    safeUnlink(req.file.path);

    const company = await Company.create({
      name,
      email,
      address,
      website,
      logoHash,
    });

    res.status(201).json({ message: "Company registered successfully", company });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Verify uploaded logo against stored company logo hash
export const verifyCompany = async (req, res) => {
  let tempPath = null;
  try {
    const { companyName } = req.body;
    if (!companyName || !req.file)
      return res.status(400).json({ verified: false, message: "Missing company name or logo file." });

    const company = await Company.findOne({ name: companyName });
    if (!company)
      return res.status(404).json({ verified: false, message: "Company not found." });

    if (!company.logoHash)
      return res.status(400).json({ verified: false, message: "No stored logo hash." });

    tempPath = req.file.path;
    const uploadedHash = await computeHash(tempPath);
    const distance = hammingDistance(uploadedHash, company.logoHash);
    const THRESHOLD = 10;

    safeUnlink(tempPath);

    if (distance <= THRESHOLD)
      return res.json({ verified: true, message: "✅ Company verified successfully!", distance });
    else
      return res.json({ verified: false, message: "❌ Logo mismatch.", distance });
  } catch (err) {
    if (tempPath) safeUnlink(tempPath);
    console.error("Verify Error:", err);
    res.status(500).json({ verified: false, message: "Server error", error: err.message });
  }
};

// ✅ Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete company
export const deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
