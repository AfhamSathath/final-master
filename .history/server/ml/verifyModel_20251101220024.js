// cspell:ignore tfjs Jimp TensorFlow cosineSimilarity Float32Array ndarray
// verifyModel.js — Node.js logo verification using TensorFlow.js + Jimp

import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import path from "path";
import Jimp from "jimp";

const KNOWN_DIR = path.resolve("ml/known_logos"); // folder with known logos

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
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);

  // Convert RGBA buffer → Float32 RGB tensor
  const arr = [];
  for (let i = 0; i < buffer.length; i += 4) {
    arr.push(buffer[i] / 255);     // R
    arr.push(buffer[i + 1] / 255); // G
    arr.push(buffer[i + 2] / 255); // B
  }

  // Shape: [1, size, size, 3]
  const tensor = tf.tensor(arr, [1, size, size, 3], "float32");
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

  // Cleanup tensors to avoid memory leaks
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
  const files = fs.readdirSync(KNOWN_DIR);
  const baseNames = files.map(f => path.parse(f).name.toLowerCase());

  if (!baseNames.includes(companyName.toLowerCase())) {
    return { verified: false, reason: "company-not-in-dataset" };
  }

  const knownPath = path.join(KNOWN_DIR, `${companyName}.png`);
  if (!fs.existsSync(knownPath)) {
    return { verified: false, reason: "known-logo-not-found" };
  }

  try {
    const [tUploaded, tKnown] = await Promise.all([
      loadImageTensor(uploadedPath, 128),
      loadImageTensor(knownPath, 128)
    ]);

    const score = await cosineSimilarity(tUploaded, tKnown);

    tUploaded.dispose();
    tKnown.dispose();

    // threshold can be tuned based on dataset quality
    const threshold = 0.80;
    return { verified: score >= threshold, score };
  } catch (err) {
    console.error("verifyLogo error:", err);
    return { verified: false, reason: "processing-error" };
  }
}
