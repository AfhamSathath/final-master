import express from "express";
import { register, login } from "../Controllers/authController.js";



const router = express.Router();

// REGISTER route
router.post("/register", register);

// LOGIN route (works for both users & companies)
router.post("/login", login);



export default router;
