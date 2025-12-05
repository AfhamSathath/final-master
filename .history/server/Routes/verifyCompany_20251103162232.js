import express from "express";
const router = express.Router();

router.post("/verify", async (req, res) => {
  try {
	const { companyName, email, regNumber, phone, checkDuplicate } = req.body;
	const name = String(companyName).trim();


	// STEP 1: Keyword check
const keywordMatch = containsSriLankanKeyword(name);


// STEP 2: Registration number format check (optional)
const regMatch = detectRegistrationFormat(regNumber);


// STEP 3: Combine verification logic
let verified = false;
let confidence = 0.2;
let reason = "Unknown or invalid format.";


if (keywordMatch && regMatch) {
verified = true;
confidence = 0.95;
reason = "Company name and registration number match Sri Lankan business patterns.";
} else if (keywordMatch) {
verified = true;
confidence = 0.75;
reason = "Company name matches Sri Lankan business style (keyword found).";
} else if (regMatch) {
verified = true;
confidence = 0.7;
reason = "Registration number matches expected Sri Lankan format.";
} else {
verified = false;
confidence = 0.2;
reason = "No Sri Lankan business keywords or valid registration format found.";
}


// STEP 4: Check for duplicates (optional)
if (checkDuplicate) {
const queryOr = [
name ? { name } : null,
email ? { email } : null,
regNumber ? { regNumber } : null,
phone ? { contactNumber: phone } : null,
].filter(Boolean);


const existingCompany = queryOr.length ? await Company.findOne({ $or: queryOr }) : null;


const userQueryOr = [email ? { email } : null, phone ? { contactNumber: phone } : null].filter(Boolean);
const existingUser = userQueryOr.length ? await User.findOne({ $or: userQueryOr }) : null;


if (existingCompany || existingUser) {
return res.status(409).json({ verified, confidence, duplicate: true, reason: "Email, phone number, or company already registered." });
}
}


return res.json({ verified, confidence, duplicate: false, reason });
} catch (err) {
console.error("Verification error:", err);
return res.status(500).json({ verified: false, confidence: 0, reason: "Internal server error" });
}
});


export default router;