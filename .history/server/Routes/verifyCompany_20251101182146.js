// routes/verifyCompany.js
import express from "express";
import multer from "multer";
import fs from "fs";
import { verifyLogoWithModel } from "../ml/verifyModel.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;
    const logoPath = req.file?.path;

    if (!companyName || !logoPath)
      return res.status(400).json({ verified: false, message: "Missing data" });

    const isVerified = await verifyLogoWithModel(companyName, logoPath);

    fs.unlinkSync(logoPath); // cleanup temp upload

    if (isVerified) {
      res.json({ verified: true });
    } else {
      res.json({ verified: false, message: "Company not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ verified: false, message: "Verification error" });
  }
});

export default router;
