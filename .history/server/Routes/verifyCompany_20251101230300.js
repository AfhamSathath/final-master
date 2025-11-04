// server/Routes/verifyCompany.js
import express from "express";
import multer from "multer";
import * as fs from "fs";
import path from "path";
import crypto from "crypto";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const router = express.Router();

// ✅ Handle Jimp import across environments
const Jimp = (JimpPkg && JimpPkg.default) ? JimpPkg.default : JimpPkg;

// ✅ Configure Multer for file uploads
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({ dest: UPLOAD_DIR });

// ✅ Safe file delete helper
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("Failed to unlink:", err.message);
  }
}

// ✅ Compute a stable image hash using SHA256 (same method as in createCompany)
async function computeHash(filePath) {
  const image = await Jimp.read(filePath);
  image.resize(128, 128);
  image.grayscale();
  const buffer = image.bitmap.data;
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ✅ Compute Hamming distance between two hex hashes
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  const binA = BigInt("0x" + hashA).toString(2).padStart(256, "0");
  const binB = BigInt("0x" + hashB).toString(2).padStart(256, "0");
  let dist = 0;
  for (let i = 0; i < binA.length; i++) {
    if (binA[i] !== binB[i]) dist++;
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

    // ✅ Find company by name
    const company = await Company.findOne({ name: companyName });
    if (!company) {
      safeUnlink(req.file.path);
      return res.status(404).json({
        verified: false,
        message: "Company not found",
      });
    }

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

    const distance = hammingDistance(uploadedHash, storedHash);
    console.log(
      `Compare → UploadedHash: ${uploadedHash.slice(0, 16)}... vs StoredHash: ${storedHash.slice(0, 16)}... | Distance: ${distance}`
    );

    safeUnlink(req.file.path);

    // ✅ Verification threshold (lower = stricter match)
    const THRESHOLD = 80; // since SHA256 bit length is 256, 80 is a ~30% tolerance

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
    console.error("Verify company error:", error);
    if (req.file?.path) safeUnlink(req.file.path);
    res.status(500).json({
      verified: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
