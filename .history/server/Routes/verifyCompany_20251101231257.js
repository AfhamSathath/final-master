// server/Routes/verifyCompany.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const router = express.Router();

// ✅ Handle Jimp import across environments (CommonJS / ESM)
const Jimp = (JimpPkg && JimpPkg.default) ? JimpPkg.default : JimpPkg;

// ✅ Configure Multer for uploads
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({ dest: UPLOAD_DIR });

// ✅ Helper: safely delete temp files
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("Failed to unlink file:", err.message);
  }
}

// ✅ Compute perceptual hash for an image
async function computeHash(filePath) {
  const image = await Jimp.read(filePath);
  image.resize(256, 256); // normalize size for comparison
  return image.hash(); // perceptual hash (visually based)
}

// ✅ Compute Hamming distance between two perceptual hashes
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

    // Basic validation
    if (!companyName || !req.file) {
      return res.status(400).json({
        verified: false,
        message: "Missing company name or logo.",
      });
    }

    // ✅ Find company in DB
    const company = await Company.findOne({ name: companyName });
    if (!company) {
      safeUnlink(req.file.path);
      return res.status(404).json({
        verified: false,
        message: "Company not found in database.",
      });
    }

    // ✅ Ensure the company has a stored logo hash
    if (!company.logoHash) {
      safeUnlink(req.file.path);
      return res.status(400).json({
        verified: false,
        message: "No stored logo hash for this company.",
      });
    }

    // ✅ Compute hash for uploaded logo
    const uploadedHash = await computeHash(req.file.path);
    const storedHash = company.logoHash;

    // ✅ Compare both hashes
    const distance = hammingDistance(uploadedHash, storedHash);

    console.log(
      `🔍 Compare → Uploaded: ${uploadedHash.slice(0, 10)}... vs Stored: ${storedHash.slice(0, 10)}... | Distance: ${distance}`
    );

    safeUnlink(req.file.path);

    // ✅ Set threshold for similarity (lower = stricter)
    const THRESHOLD = 10;

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
    if (req.file?.path) safeUnlink(req.file.path);
    res.status(500).json({
      verified: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
