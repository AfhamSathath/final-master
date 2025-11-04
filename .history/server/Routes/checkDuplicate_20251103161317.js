import express from "express";
import User from "../models/User.js";
import Company from "../models/Company.js";

const router = express.Router();

// ==================== DUPLICATE CHECK ====================
// POST /api/check-duplicate
// body: { email?, phone?, regNumber? }
router.post("/", async (req, res) => {
  try {
    const { name,email, phone, regNumber } = req.body || {};

    // Make sure at least one field is provided
    if (!name && !email && !phone && !regNumber) {
      return res.status(400).json({
        exists: false,
        message: "At least one of email, phone, or regNumber is required",
      });
    }

    // Check duplicates across both User and Company collections
    const userExists = await User.findOne({
      $or: [
        email ? { email } : null,
        phone ? { contactNumber: phone } : null,
      ].filter(Boolean),
    });

    const companyExists = await Company.findOne({
      $or: [
        email ? { email } : null,
        phone ? { contactNumber: phone } : null,
        regNumber ? { regNumber } : null,
        name ? { name } : null,
      ].filter(Boolean),
    });

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
