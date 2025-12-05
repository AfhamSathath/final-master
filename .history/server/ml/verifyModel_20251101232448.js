// cspell:ignore tfjs Jimp TensorFlow cosineSimilarity Float32Array ndarray
// ===========================================================
// verifyModel.js — Node.js logo verification using TensorFlow.js + Jimp
// ===========================================================

import * as tf from "@tensorflow/tfjs-node"; // ✅ use tfjs-node for backend acceleration
import fs from "fs";
import path from "path";
import Jimp from "jimp"; // ✅ Correct default import under ESM

// ===========================================================
// CONFIGURATION
// ===========================================================
const KNOWN_DIR = path.resolve("ml/known_logos"); 
// e.g. ml/known_logos/LankaSoft Pvt Ltd.png, Ceylon Traders.png

/**
 * Loads an image, resizes it, and converts it into a TensorFlow tensor.
 * Works fully in Node.js using Jimp.
 * @param {string} imagePath - Path to the image file.
 * @param {number} size - Resize dimension (square).
 * @returns {tf.Tensor4D} Tensor of shape [1, size, size, 3].
 */
async function loadImageTensor(imagePath, size = 128) {
  const img = await Jimp.read(imagePath);
  img.resize(size, size);

  // Convert RGBA → RGB normalized float array
  const { data } = img.bitmap;
  const arr = new Float32Array((data.length / 4) * 3);

  let j = 0;
  for (let i = 0; i < data.length; i += 4) {
    arr[j++] = data[i] / 255;       // R
    arr[j++] = data[i + 1] / 255;   // G
    arr[j++] = data[i + 2] / 255;   // B
  }

  const tensor = tf.tensor4d(arr, [1, size, size, 3], "float32");
  return tensor;
}

/**
 * Computes cosine similarity between two tensors.
 * @param {tf.Tensor} a
 * @param {tf.Tensor} b
 * @returns {Promise<number>} similarity score between 0–1
 */
async function cosineSimilarity(a, b) {
  const aFlat = a.flatten();
  const bFlat = b.flatten();

  const dot = aFlat.mul(bFlat).sum();
  const na = aFlat.norm();
  const nb = bFlat.norm();

  const sim = dot.div(na.mul(nb));
  const val = (await sim.data())[0];

  // Cleanup
  aFlat.dispose();
  bFlat.dispose();
  dot.dispose();
  na.dispose();
  nb.dispose();
  sim.dispose();

  return val;
}

/**
 * Verifies whether the uploaded logo matches the known logo of a company.
 * @param {string} companyName - Company name (case-insensitive, must match filename).
 * @param {string} uploadedPath - Path to uploaded logo image.
 * @returns {Promise<{verified: boolean, score?: number, reason?: string}>}
 */
export async function verifyLogoWithModel(companyName, uploadedPath) {
  try {
    // Check for dataset folder
    if (!fs.existsSync(KNOWN_DIR)) {
      return { verified: false, reason: "known-directory-not-found" };
    }

    const files = fs.readdirSync(KNOWN_DIR);
    const baseNames = files.map(f => path.parse(f).name.toLowerCase());

    // Ensure known logo exists
    if (!baseNames.includes(companyName.toLowerCase())) {
      return { verified: false, reason: "company-not-in-dataset" };
    }

    const knownPath = path.join(KNOWN_DIR, `${companyName}.png`);
    if (!fs.existsSync(knownPath)) {
      return { verified: false, reason: "known-logo-not-found" };
    }

    // Load tensors
    const [tUploaded, tKnown] = await Promise.all([
      loadImageTensor(uploadedPath, 128),
      loadImageTensor(knownPath, 128)
    ]);

    // Compare similarity
    const score = await cosineSimilarity(tUploaded, tKnown);

    // Cleanup tensors
    tUploaded.dispose();
    tKnown.dispose();

    // Tune threshold based on dataset quality (0.75–0.85 works best)
    const threshold = 0.80;
    const verified = score >= threshold;

    return { verified, score };
  } catch (err) {
    console.error("verifyLogoWithModel() error:", err);
    return { verified: false, reason: "processing-error" };
  }
}

// ===========================================================
// OPTIONAL: CLI TESTER
// Run directly with: node ml/verifyModel.js "LankaSoft Pvt Ltd" "uploads/test.png"
// ===========================================================
if (process.argv.length >= 4) {
  const companyName = process.argv[2];
  const uploadedPath = process.argv[3];

  (async () => {
    console.log(`🔍 Verifying ${companyName} against ${uploadedPath}`);
    const result = await verifyLogoWithModel(companyName, uploadedPath);
    console.log("✅ Verification Result:", result);
  })();
}
