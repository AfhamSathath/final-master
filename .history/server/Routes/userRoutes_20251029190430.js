import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../Controllers/userController.js";

const router = express.Router();

// CRUD Routes
router.post("/", createUser);        // Create user
router.get("/", getUsers);           // Get all users
router.get("/:id", getUserById);     // Get single user
router.put("/:id", updateUser);      // Update user
router.delete("/:id", deleteUser);   // Delete user

router.post("/", async (req, res) => {
  const { captchaToken } = req.body;
  const isHuman = await validateCaptcha(captchaToken);
  if (!isHuman) return res.status(400).json({ message: "Captcha verification failed" });
  });

export default router;
