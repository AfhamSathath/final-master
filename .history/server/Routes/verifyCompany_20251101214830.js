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
    const file = req.file;
    if (!companyName || !file) return res.status(400).json({ verified: false, message: "Missing data" });

    const result = await verifyLogoWithModel(companyName, file.path);

    // cleanup uploaded file
    try { fs.unlinkSync(file.path); } catch (e) {}

    if (result.verified) {
      return res.json({ verified: true, score: result.score });
    } else {
      return res.json({ verified: false, reason: result.reason || "logo-mismatch", score: result.score || 0 });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ verified: false, message: "Server error" });
  }
});

export default router;
