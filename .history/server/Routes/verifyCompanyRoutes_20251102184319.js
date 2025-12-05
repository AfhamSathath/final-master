import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  verifyCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/verifyCompanyController.js";

const router = express.Router();

// ====================== MULTER CONFIG ======================
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });

// ====================== CRUD ROUTES ======================

// ✅ Verify logo authenticity
router.post("/verify", upload.single("logo"), verifyCompany);

// ✅ Get all companies (for admin / listing)
router.get("/", getAllCompanies);

// ✅ Get single company by ID
router.get("/:id", getCompanyById);

// ✅ Update company details or logo hash
router.put("/:id", upload.single("logo"), updateCompany);

// ✅ Delete company
router.delete("/:id", deleteCompany);

export default router;
