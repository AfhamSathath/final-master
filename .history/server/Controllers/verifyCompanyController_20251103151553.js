import express from "express";

const router = express.Router();

// ==================== SRI LANKAN COMPANY KEYWORDS ====================
const sriLankanKeywords = [
  "lanka", "ceylon", "serendib", "island", "colombo", "kandy",
  "galle", "jaffna", "traders", "holdings", "enterprises", "exports",
  "imports", "technologies", "solutions", "pvt ltd", "private limited",
  "group", "industries", "services", "foods", "apparels", "manufacturing"
];

// ==================== HELPER FUNCTIONS ====================
function containsSriLankanKeyword(name) {
  const lower = name.toLowerCase();
  return sriLankanKeywords.some(keyword => lower.includes(keyword));
}

function detectRegistrationFormat(nameOrRegNo) {
  // Basic Sri Lankan registration pattern
  const pattern = /^(PV|BR|NC|PL|RG|GA|RP|E|F|G|H|J|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)\/\d{3,5}\/\d{4}$/;
  return pattern.test(nameOrRegNo);
}

// ==================== VERIFY COMPANY ROUTE ====================
router.post("/", async (req, res) => {
  try {
    const { companyName, regNumber } = req.body;

    if (!companyName) {
      return res.json({
        verified: false,
        reason: "Company name is required",
      });
    }

    // STEP 1: Keyword check
    const keywordMatch = containsSriLankanKeyword(companyName);

    // STEP 2: Registration number format check (optional)
    const regMatch = regNumber ? detectRegistrationFormat(regNumber) : false;

    // STEP 3: Combine logic
    if (keywordMatch && regMatch) {
      return res.json({
        verified: true,
        confidence: 0.95,
        reason: "Company name and registration number match Sri Lankan business pattern",
      });
    } else if (keywordMatch) {
      return res.json({
        verified: true,
        confidence: 0.75,
        reason: "Company name matches Sri Lankan business style",
      });
    } else if (regMatch) {
      return res.json({
        verified: true,
        confidence: 0.7,
        reason: "Registration number matches Sri Lankan format",
      });
    } else {
      return res.json({
        verified: false,
        confidence: 0.2,
        reason: "Company name does not match Sri Lankan business patterns",
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
