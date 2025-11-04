// server/Routes/companyRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../Controllers/CompanyController.js";

const router = express.Router();

// ✅ Multer config for logo upload
const upload = multer({ dest: path.join(process.cwd(), "uploads/") });

// CRUD routes
router.post("/", upload.single("logo"), createCompany);
router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
