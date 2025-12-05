// Routes/authRoutes.js
import express from "express";
import dotenv from "dotenv";
import { register, login, forgotPassword, resetPassword } from "../Controllers/authController.js";

dotenv.config();
const router = express.Router();

// ==================== AUTH ROUTES ====================

// Register a new user / company / admin
router.post("/register", register);

// Login existing user / company / admin
router.post("/login", login);

// Forgot password - send reset link via email
router.post("/forgot-password", forgotPassword);

// Reset password - update password using token
router.post("/reset-password/:token", resetPassword);

export default router;
