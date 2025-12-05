import express from "express";
import Company from "../models/Company.js"; // ✅ Mongoose model

const router = express.Router();

// ==================== SRI LANKAN COMPANY KEYWORDS ====================
const sriLankanKeywords = [
  "lanka",
  "ceylon",
  "serendib",
  "island",
  "colombo",
  "kandy",
  "galle",
  "jaffna",
  "traders",
  "holdings",
  "enterprises",
  "exports",
  "imports",
  "technologies",
  "solutions",
  "pvt ltd",
  "private limited",
  "group",
  "industries",
  "services",
  "foods",
  "apparels",
  "manufacturing",
];

// ==================== HELPER FUNCTIONS ====================
function containsSriLankanKeyword(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return sriLankanKeywords.some((keyword) => lower.includes(keyword));
}

function detectRegistrationFormat(regNo) {
  if (!regNo) return false;
  const trimmed = regNo.trim();
  const pattern = /^[A-Z]{1,4}\/\d{1,6}\/\d{4}$/i;
  return pattern.test(trimmed);
}

// ==================== VERIFY COMPANY ROUTE ====================
// POST /api/verify-company
// body: { companyName: string, regNumber?: string, email?: string, checkDuplicate?: boolean }
router.post("/", async (req, res) => {
  try {
    const { companyName, regNumber, email, checkDuplicate } = req.body || {};

    if (!companyName || String(companyName).trim().length === 0) {
      return res.status(400).json({
        verified: false,
        confidence: 0,
        reason: "Company name is required",
      });
    }

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
      reason =
        "Company name and registration number match Sri Lankan business patterns.";
    } else if (keywordMatch) {
      verified = true;
      confidence = 0.75;
      reason =
        "Company name matches Sri Lankan business style (keyword found).";
    } else if (regMatch) {
      verified = true;
      confidence = 0.7;
      reason = "Registration number matches expected Sri Lankan format.";
    } else {
      verified = false;
      confidence = 0.2;
      reason =
        "No Sri Lankan business keywords or valid registration format found.";
    }

    // STEP 4: Check for duplicates (optional)
    if (checkDuplicate) {
      const existing = await Company.findOne({
        $or: [{ name }, { email }, { regNumber }],
      });

      if (existing) {
        return res.status(409).json({
          verified: true,
          confidence,
          duplicate: true,
          reason: "Company already exists in the database.",
        });
      }
    }

    return res.json({
      verified,
      confidence,
      duplicate: false,
      reason,
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      verified: false,
      confidence: 0,
      reason: "Internal server error",
    });
  }
});

export default router;
