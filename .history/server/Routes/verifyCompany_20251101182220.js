import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { verifyLogoWithModel } from "../ml/verifyModel.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;
    const logoPath = req.file?.path;

    if (!companyName || !logoPath) {
      return res.status(400).json({ verified: false, message: "Missing data" });
    }

    const verified = await verifyLogoWithModel(companyName, logoPath);

    fs.unlinkSync(logoPath); // remove temp upload

    if (verified) {
      res.json({ verified: true, message: "Company verified successfully" });
    } else {
      res.json({ verified: false, message: "Company not found or logo mismatch" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ verified: false, message: "Verification error" });
  }
});

export default router;
