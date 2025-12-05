import express from "express";
import multer from "multer";
import * as Jimp from "jimp";
import fs from "fs";
import path from "path";
import Company from "../models/Company.js";

const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), "uploads/verify/") });

async function computeHash(filePath) {
  const img = await Jimp.read(filePath);
  return img.hash();
}

function hammingDistance(a, b) {
  if (!a || !b) return Infinity;
  let dist = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName || !req.file)
      return res.status(400).json({ verified: false, message: "Missing company name or logo" });

    const company = await Company.findOne({ name: companyName });
    if (!company || !company.logoHash)
      return res.status(404).json({ verified: false, message: "Company not found or no logo stored" });

    const uploadedHash = await computeHash(req.file.path);
    const distance = hammingDistance(uploadedHash, company.logoHash);

    fs.unlinkSync(req.file.path);
    const THRESHOLD = 10;

    if (distance <= THRESHOLD)
      return res.json({ verified: true, message: "✅ Company verified successfully" });
    else
      return res.json({ verified: false, message: "⚠️ Logo mismatch. Please upload the correct logo." });
  } catch (error) {
    console.error("Verify company error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ verified: false, message: "Internal server error" });
  }
});

export default router;
