import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  verifyCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/verifyCompanyController.js";

const router = express.Router();

// Folder for uploads
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "verify");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });

// ✅ Correct endpoints
router.post("/", upload.single("logo"), verifyCompany); // 👈 POST /api/verify-company
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.put("/:id", upload.single("logo"), updateCompany);
router.delete("/:id", deleteCompany);

export default router;
