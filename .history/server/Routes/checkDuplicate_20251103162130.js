import express from "express";
import User from "../models/User.js";
import Company from "../models/Company.js";


const router = express.Router();


// POST /api/check-duplicate
// body: { name?, email?, phone?, regNumber? }
router.post("/", async (req, res) => {
try {
const { name, email, phone, regNumber } = req.body || {};


if (!name && !email && !phone && !regNumber) {
return res.status(400).json({ exists: false, message: "At least one of name, email, phone, or regNumber is required" });
}


const userQuery = [
email ? { email } : null,
phone ? { contactNumber: phone } : null,
].filter(Boolean);


const companyQuery = [
name ? { name } : null,
email ? { email } : null,
phone ? { contactNumber: phone } : null,
regNumber ? { regNumber } : null,
].filter(Boolean);


const userExists = userQuery.length ? await User.findOne({ $or: userQuery }) : null;
const companyExists = companyQuery.length ? await Company.findOne({ $or: companyQuery }) : null;


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