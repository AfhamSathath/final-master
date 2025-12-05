import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../Controllers/CompanyController.js";

const router = express.Router();

// =================== Multer setup for logo uploads ===================
const logoPath = "uploads/companyLogos";
if (!fs.existsSync(logoPath)) {
  fs.mkdirSync(logoPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logoPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// =================== CRUD ROUTES ===================
router.post("/", createCompany);
router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

// =================== LOGO VERIFICATION ROUTE ===================
// Company uploads logo for verification before registration
router.post("/verify-logo", upload.single("logo"), async (req, res) => {
  try {
    const { regNumber } = req.body;
    const filePath = req.file ? `/uploads/companyLogos/${req.file.filename}` : null;

    if (!regNumber || !filePath) {
      return res.status(400).json({
        success: false,
        message: "Please provide registration number and logo.",
      });
    }

    // 🔹 Step 1: Basic check (simulate verification)
    // You can replace this with AI, OCR, or admin review logic later.
    const isVerified = regNumber.length >= 3 && req.file;

    if (isVerified) {
      return res.status(200).json({
        success: true,
        verified: true,
        logoUrl: filePath,
        message: "✅ Logo successfully verified!",
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "❌ Logo verification failed. Try again.",
      });
    }
  } catch (err) {
    console.error("Error verifying logo:", err);
    res.status(500).json({
      success: false,
      message: "Server error during logo verification.",
    });
  }
});

export default router;
