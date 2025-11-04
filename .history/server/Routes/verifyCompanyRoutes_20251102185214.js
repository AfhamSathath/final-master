// server/Routes/verifyCompany.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import * as JimpPkg from "jimp";
import Company from "../models/Company.js";

const router = express.Router();
const Jimp = (JimpPkg.default || JimpPkg); // ✅ handle ESM/CommonJS interop

// ================= MULTER CONFIG =================
const upload = multer({
  dest: path.join("uploads/companies/"),
});

// ================= VERIFY COMPANY =================
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;
    const logoPath = req.file?.path;

    if (!companyName || !logoPath) {
      return res.status(400).json({ message: "Missing company name or logo" });
    }

    const existing = await Company.findOne({
      name: { $regex: new RegExp(companyName, "i") },
    });

    if (!existing) {
      fs.unlinkSync(logoPath);
      return res.status(404).json({ verified: false, message: "Company not found" });
    }

    // Optional image similarity verification
    const knownDir = path.resolve("ml/known_logos");
    const knownFile = path.join(knownDir, `${existing.name}.png`);

    if (fs.existsSync(knownFile)) {
      const img1 = await Jimp.read(logoPath);
      const img2 = await Jimp.read(knownFile);
      const diff = Jimp.diff(img1, img2).percent;

      fs.unlinkSync(logoPath);
      if (diff < 0.15) {
        return res.status(200).json({ verified: true, message: "Company verified!" });
      } else {
        return res.status(200).json({ verified: false, message: "Logo mismatch!" });
      }
    }

    fs.unlinkSync(logoPath);
    return res.status(200).json({ verified: true, message: "Company verified (no logo ref)" });
  } catch (err) {
    console.error("Error verifying company:", err);
    res.status(500).json({ verified: false, message: "Server error during verification" });
  }
});

export default router;
