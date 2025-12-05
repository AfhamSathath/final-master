import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const router = express.Router();

// ✅ Handle Jimp import across ESM/CJS environments
const Jimp = (JimpPkg && JimpPkg.default) ? JimpPkg.default : JimpPkg;

// ====================== MULTER CONFIG ======================
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const upload = multer({ dest: UPLOAD_DIR });

// ====================== HELPERS ======================

// 🧹 Safely delete a temporary file
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("Failed to unlink:", err.message);
  }
}

// 💾 Download an image from URL and save locally
async function downloadImage(url) {
  const fileName = `url_logo_${Date.now()}.jpg`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const response = await axios({ url, responseType: "arraybuffer" });
  fs.writeFileSync(filePath, response.data);
  return filePath;
}

// 🧮 Compute perceptual hash for an image
async function computeHash(filePath) {
  const image = await Jimp.read(filePath);
  image.resize(256, 256);
  return image.hash(); // visually-based hash
}

// 🔢 Compute Hamming distance between two perceptual hashes
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  let dist = 0;
  const len = Math.min(hashA.length, hashB.length);
  for (let i = 0; i < len; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

// ====================== MAIN VERIFY ROUTE ======================
router.post("/", upload.single("logo"), async (req, res) => {
  let tempPath = null;

  try {
    const { companyName, logoUrl } = req.body;

    if (!companyName && !req.file && !logoUrl) {
      return res.status(400).json({
        verified: false,
        message: "Missing company name and logo or URL.",
      });
    }

    // ✅ Find company in DB
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

    // ✅ Decide where the logo comes from
    if (req.file?.path) {
      tempPath = req.file.path;
    } else if (logoUrl) {
      tempPath = await downloadImage(logoUrl);
    } else {
      return res.status(400).json({
        verified: false,
        message: "No logo file or URL provided.",
      });
    }

    // ✅ Compute uploaded logo hash
    const uploadedHash = await computeHash(tempPath);
    const storedHash = company.logoHash;

    const distance = hammingDistance(uploadedHash, storedHash);
    const THRESHOLD = 10; // tolerance for minor differences

    console.log(
      `🔍 Compare → Uploaded: ${uploadedHash.slice(0, 10)}... | Stored: ${storedHash.slice(0, 10)}... | Distance: ${distance}`
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
});

export default router;
