import express from "express";

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
function containsSriLankanKeyword(name: string | undefined | null) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return sriLankanKeywords.some((keyword) => lower.includes(keyword));
}

/**
 * Detects basic Sri Lankan registration-like patterns.
 * Accepts things like "PV/1234/2022", "BR/123/2020", "ABC/12/2019"
 * This is not authoritative — it's a lightweight heuristic only.
 */
function detectRegistrationFormat(regNo: string | undefined | null) {
  if (!regNo) return false;
  const trimmed = regNo.trim();
  // Allow letters (1-4) slash digits (1-6) slash 4-digit year
  const pattern = /^[A-Z]{1,4}\/\d{1,6}\/\d{4}$/i;
  return pattern.test(trimmed);
}

// ==================== VERIFY COMPANY ROUTE ====================
/**
 * POST /api/verify-company
 * body: { companyName: string, regNumber?: string }
 */
router.post("/", async (req, res) => {
  try {
    const { companyName, regNumber } = req.body || {};

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

    // STEP 3: Combine logic
    if (keywordMatch && regMatch) {
      return res.json({
        verified: true,
        confidence: 0.95,
        reason:
          "Company name and registration number match common Sri Lankan business patterns.",
      });
    } else if (keywordMatch) {
      return res.json({
        verified: true,
        confidence: 0.75,
        reason: "Company name matches Sri Lankan business style (keyword found).",
      });
    } else if (regMatch) {
      return res.json({
        verified: true,
        confidence: 0.7,
        reason: "Registration number matches expected Sri Lankan format.",
      });
    } else {
      return res.json({
        verified: false,
        confidence: 0.2,
        reason:
          "No Sri Lankan business keywords found and registration number format not recognized.",
      });
    }
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      verified: false,
      reason: "Internal server error",
    });
  }
});

export default router;
