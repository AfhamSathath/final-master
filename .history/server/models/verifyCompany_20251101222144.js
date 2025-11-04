// server/routes/verifyCompany.js
const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const Company = require("./Company"); // ✅ use real model

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../uploads/") });

// Compute hash for an image using Jimp
async function computeHash(filePath) {
  const img = await Jimp.read(filePath);
  return img.hash(); // perceptual hash (aHash)
}

// Compute hamming distance between two hash strings
function hammingDistance(hashA, hashB) {
  if (!hashA || !hashB) return Infinity;
  let dist = 0;
  const len = Math.min(hashA.length, hashB.length);
  for (let i = 0; i < len; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName || !req.file) {
      return res
        .status(400)
        .json({ verified: false, message: "Missing company name or logo" });
    }

    // ✅ Find company in DB
    const company = await Company.findOne({ name: companyName });
    if (!company) {
      fs.unlinkSync(req.file.path);
      return res
        .status(404)
        .json({ verified: false, message: "Company not found" });
    }

    // ✅ Compute uploaded logo hash
    const uploadedHash = await computeHash(req.file.path);
    const storedHash = company.logoHash;

    const distance = hammingDistance(uploadedHash, storedHash);
    console.log(`Compare: ${uploadedHash} vs ${storedHash} → distance ${distance}`);

    // ✅ Cleanup temp file
    fs.unlinkSync(req.file.path);

    // ✅ Use a realistic threshold
    const THRESHOLD = 10; // increase tolerance a bit

    if (distance <= THRESHOLD) {
      return res.json({ verified: true, message: "Company verified successfully!" });
    } else {
      return res.status(200).json({
        verified: false,
        message: "Logo mismatch. Please upload the correct logo.",
      });
    }
  } catch (error) {
    console.error("Verify company error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ verified: false, message: "Internal server error" });
  }
});

module.exports = router;
