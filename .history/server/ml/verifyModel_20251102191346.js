// cspell:ignore tfjs Jimp TensorFlow cosineSimilarity Float32Array ndarray
// ===========================================================
// verifyModel.js — Node.js logo verification using TensorFlow.js + Jimp
// ===========================================================

import * as tf from "@tensorflow/tfjs-node"; // ✅ TensorFlow backend for Node.js
import fs from "fs";
import path from "path";
import Jimp from "jimp"; // ✅ Correct import for ESM

// ===========================================================
// CONFIGURATION
// ===========================================================

const KNOWN_DIR = path.resolve("ml/known_logos");
// Example files: 
// ml/known_logos/LankaSoft Pvt Ltd.png
// ml/known_logos/Ceylon Traders.png
// ml/known_logos/TeaHub Pvt Ltd.png

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
    arr[j++] = data[i] / 255;     // R
    arr[j++] = data[i + 1] / 255; // G
    arr[j++] = data[i + 2] / 255; // B
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
 * Verifies whether the uploaded logo matches a known company logo.
 * @param {string} companyName - Company name (case-insensitive, must match filename).
 * @param {string} uploadedPath - Path to uploaded logo image.
 * @returns {Promise<{verified: boolean, score?: number, reason?: string}>}
 */
export async function verifyLogoWithModel(companyName, uploadedPath) {
  try {
    // Ensure dataset folder exists
    if (!fs.existsSync(KNOWN_DIR)) {
      return { verified: false, reason: "known-directory-not-found" };
    }

    const files = fs.readdirSync(KNOWN_DIR);
    const baseNames = files.map((f) => path.parse(f).name.toLowerCase());

    // Check if the company name exists in dataset
    if (!baseNames.includes(companyName.toLowerCase())) {
      return { verified: false, reason: "company-not-in-dataset" };
    }

    // Get known logo path
    const knownPath = path.join(KNOWN_DIR, `${companyName}.png`);
    if (!fs.existsSync(knownPath)) {
      return { verified: false, reason: "known-logo-not-found" };
    }

    // Load both images as tensors
    const [tUploaded, tKnown] = await Promise.all([
      loadImageTensor(uploadedPath, 128),
      loadImageTensor(knownPath, 128),
    ]);

    // Compare similarity
    const score = await cosineSimilarity(tUploaded, tKnown);

    // Cleanup
    tUploaded.dispose();
    tKnown.dispose();

    // Set similarity threshold — adjust for dataset quality
    const threshold = 0.80; // 80% similarity required
    const verified = score >= threshold;

    return { verified, score };
  } catch (err) {
    console.error("verifyLogoWithModel() error:", err);
    return { verified: false, reason: "processing-error" };
  }
}

// ===========================================================
// OPTIONAL: CLI TESTER
// Usage example:
// node ml/verifyModel.js "LankaSoft Pvt Ltd" "uploads/test.png"
// ===========================================================

if (process.argv.length >= 4) {
  const companyName = process.argv[2];
  const uploadedPath = process.argv[3];

  (async () => {
    console.log(`🔍 Verifying: ${companyName}`);
    console.log(`📁 Uploaded Path: ${uploadedPath}`);

    const result = await verifyLogoWithModel(companyName, uploadedPath);
    console.log("✅ Result:", result);
  })();
}
