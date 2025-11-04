// server/routes/verifyCompany.js
const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// multer: store in memory or temp folder
const upload = multer({ dest: path.join(__dirname, "../uploads/") });

// helper: compute Jimp hash string
async function computeHash(filePath) {
  const img = await Jimp.read(filePath);
  // Jimp.hash() returns a hex-like string (aHash). Good for simple pHash-ish checks
  return img.hash();
}

// helper: hamming distance between two hex-hash strings from Jimp.hash()
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  // Jimp.hash() returns 64-character hex string of 16 chars? it’s consistent - compare char by char (convert to binary)
  // Simpler approach: compare characters and count differing nibbles
  let dist = 0;
  const len = Math.min(hashA.length, hashB.length);
  for (let i = 0; i < len; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

// Mock DB function: fetch company by name and return stored logoHash
// Replace with real DB lookup (mongoose or other)
const mockCompanyDB = {
  "Acme Corp": { id: "1", name: "Acme Corp", logoHash: "ffffffffffffffffffffffffffffffff" /* example */ },
  // add entries as you register companies and store logoHash there
};

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const companyName = req.body.companyName;
    if (!companyName) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ verified: false, message: "companyName missing" });
    }

    if (!req.file) {
      return res.status(400).json({ verified: false, message: "logo file missing" });
    }

    // Find company in DB
    const company = mockCompanyDB[companyName];
    if (!company) {
      // cleanup
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ verified: false, message: "Company not found" });
    }

    const uploadedHash = await computeHash(req.file.path);
    const storedHash = company.logoHash;

    // compare
    const distance = hammingDistance(uploadedHash, storedHash);
    console.log("Hashes:", uploadedHash, storedHash, "distance:", distance);

    // choose threshold based on experimentation; for character-difference threshold:
    const THRESHOLD = 6; // tune this value

    // cleanup file
    fs.unlinkSync(req.file.path);

    if (distance <= THRESHOLD) {
      return res.json({ verified: true, message: "Company verified" });
    } else {
      return res.status(200).json({ verified: false, message: "Logo mismatch" });
    }
  } catch (err) {
    console.error("verify-company error:", err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ verified: false, message: "Internal server error" });
  }
});

module.exports = router;
