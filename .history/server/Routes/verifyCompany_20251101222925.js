// server/Routes/verifyCompany.js
import express from "express";
import multer from "multer";
import * as Jimp from "jimp";
import fs from "fs";
import path from "path";
import Company from "../models/Company.js";

const router = express.Router();

// ✅ Configure Multer for file uploads
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });

// ✅ Function to compute a perceptual hash using Jimp
async function computeHash(filePath) {
  const img = await Jimp.read(filePath);
  return img.hash(); // perceptual hash (aHash)
}

// ✅ Function to compute the Hamming distance between two hashes
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  let dist = 0;
  const len = Math.min(hashA.length, hashB.length);
  for (let i = 0; i < len; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

// ✅ POST /api/verify-company
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName || !req.file) {
      return res.status(400).json({
        verified: false,
        message: "Missing company name or logo",
      });
    }

    // ✅ Find the company by name in the database
    const company = await Company.findOne({ name: companyName });
    if (!company) {
      fs.unlinkSync(req.file.path); // remove temp file
      return res.status(404).json({
        verified: false,
        message: "Company not found",
      });
    }

    // ✅ Compute hash for uploaded logo
    const uploadedHash = await computeHash(req.file.path);
    const storedHash = company.logoHash; // must be saved when company registers

    const distance = hammingDistance(uploadedHash, storedHash);
    console.log(
      `Compare: ${uploadedHash} vs ${storedHash} → distance ${distance}`
    );

    // ✅ Cleanup temporary file
    fs.unlinkSync(req.file.path);

    // ✅ Verification threshold
    const THRESHOLD = 10;
    if (distance <= THRESHOLD) {
      return res.json({
        verified: true,
        message: "✅ Company verified successfully!",
      });
    } else {
      return res.status(200).json({
        verified: false,
        message: "❌ Logo mismatch. Please upload the correct logo.",
      });
    }
  } catch (error) {
    console.error("Verify company error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({
      verified: false,
      message: "Internal server error",
    });
  }
});

export default router;
