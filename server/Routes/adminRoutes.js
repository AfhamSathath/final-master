import express from "express";
import {
  register,
  login,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../Controllers/adminController.js";

const router = express.Router();

// REGISTER route
router.post("/register", register);

// LOGIN route
router.post("/login", login);

// CRUD routes for Admins
router.get("/", getAdmins);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
