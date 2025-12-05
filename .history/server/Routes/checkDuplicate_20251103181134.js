import express from "express";
import User from "../models/User.js";
import Company from "../models/Company.js";

const router = express.Router();

// ==================== CHECK DUPLICATES ====================
// POST /api/check-duplicate
// body: { name?, email?, phone?, regNumber? }
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, regNumber } = req.body || {};

    // Validate input
    if (!name && !email && !phone && !regNumber) {
      return res.status(400).json({
        exists: false,
        message:
          "At least one of name, email, phone, or regNumber is required.",
      });
    }

    // Prepare queries for User and Company collections
    const userQuery = [];
    if (email) userQuery.push({ email });
    if (phone) userQuery.push({ contactNumber: phone });

    const companyQuery = [];
    if (name) companyQuery.push({ name });
    if (email) companyQuery.push({ email });
    if (phone) companyQuery.push({ contactNumber: phone });
    if (regNumber) companyQuery.push({ regNumber });

    // Run queries only if fields exist
    const userExists =
      userQuery.length > 0 ? await User.findOne({ $or: userQuery }) : null;
    const companyExists =
      companyQuery.length > 0
        ? await Company.findOne({ $or: companyQuery })
        : null;

    // If found in either collection
    if (userExists || companyExists) {
      return res.json({
        exists: true,
        message: "Duplicate entry found (email, phone, name, or regNumber).",
      });
    }

    // No duplicates
    return res.json({
      exists: false,
      message: "No duplicates found.",
    });
  } catch (err) {
    console.error("Duplicate check error:", err);
    return res.status(500).json({
      exists: false,
      message: "Internal server error.",
    });
  }
});

export default router;
