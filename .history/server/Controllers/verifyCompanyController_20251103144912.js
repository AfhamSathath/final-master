// server/Routes/verifyCompany.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Jimp from "jimp";
import Company from "../models/Company.js"; // MongoDB model for known companies

const router = express.Router();

// ------------------- MULTER UPLOAD -------------------
const upload = multer({ dest: "uploads/logos/" });

// ------------------- IMAGE TO TENSOR -------------------
async function imageToTensor(filePath) {
  const image = await Jimp.read(filePath);
  image.resize(128, 128); // normalize
  const pixels = new Float32Array(128 * 128 * 3);
  let idx = 0;
  image.scan(0, 0, 128, 128, function (x, y, idxJimp) {
    pixels[idx++] = this.bitmap.data[idxJimp] / 255;
    pixels[idx++] = this.bitmap.data[idxJimp + 1] / 255;
    pixels[idx++] = this.bitmap.data[idxJimp + 2] / 255;
  });
  return tf.tensor4d(pixels, [1, 128, 128, 3]);
}

// ------------------- COSINE SIMILARITY -------------------
function cosineSimilarity(a, b) {
  const dot = a.dot(b);
  const normA = a.norm();
  const normB = b.norm();
  const sim = dot.div(normA.mul(normB));
  return sim.dataSync()[0];
}

// ------------------- VERIFY COMPANY -------------------
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { companyName } = req.body;
    const uploadedLogo = req.file.path;

    // STEP 1: Find company from DB
    const knownCompany = await Company.findOne({
      name: { $regex: new RegExp(companyName, "i") },
    });

    if (!knownCompany || !knownCompany.logoPath) {
      return res.json({ verified: false, reason: "Company not in registry" });
    }

    // STEP 2: Compare logos with AI
    const [inputTensor, knownTensor] = await Promise.all([
      imageToTensor(uploadedLogo),
      imageToTensor(knownCompany.logoPath),
    ]);

    const inputVec = inputTensor.flatten();
    const knownVec = knownTensor.flatten();
    const similarity = cosineSimilarity(inputVec, knownVec);

    fs.unlinkSync(uploadedLogo); // clean temp

    // STEP 3: Evaluate similarity
    if (similarity >= 0.85) {
      console.log(`✅ Verified ${companyName} | Similarity: ${similarity}`);
      return res.json({ verified: true, confidence: similarity });
    } else {
      console.log(`❌ Not verified ${companyName} | Similarity: ${similarity}`);
      return res.json({ verified: false, confidence: similarity });
    }
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ verified: false, error: "Internal error" });
  }
});

export default router;
