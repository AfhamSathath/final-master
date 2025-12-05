import express from "express";
import User from "../models/User.js";
import Company from "../models/Company.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userExists =
      (await User.findOne({ email })) || (await User.findOne({ contactNumber: phone }));
    const companyExists =
      (await Company.findOne({ email })) ||
      (await Company.findOne({ contactNumber: phone }));

    if (userExists || companyExists) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (err) {
    console.error("Duplicate check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
