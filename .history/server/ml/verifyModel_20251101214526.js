// verifyModel.js (pure JS tfjs + Jimp)
import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import path from "path";
import Jimp from "jimp";

const KNOWN_DIR = path.resolve("ml/known_logos"); // adjust if needed

async function loadImageTensor(imagePath, size = 128) {
  const img = await Jimp.read(imagePath);
  img.resize(size, size);
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  // tf.node.decodeImage not available in pure tfjs; use browser-like decoding
  const uint8 = new Uint8Array(buffer);
  // decode using tf.browser.fromPixels not available on node; use tf.node if present
  // workaround: convert Jimp to Float32Array
  const arr = [];
  for (let i = 0; i < buffer.length; i += 4) {
    // buffer is RGBA
    arr.push(buffer[i] / 255);     // R
    arr.push(buffer[i+1] / 255);   // G
    arr.push(buffer[i+2] / 255);   // B
  }
  // create tensor [1, size, size, 3]
  const tensor = tf.tensor(arr, [1, size, size, 3], "float32");
  return tensor;
}

// cosine similarity helper
async function cosineSimilarity(a, b) {
  const aFlat = a.flatten();
  const bFlat = b.flatten();
  const dot = aFlat.mul(bFlat).sum();
  const na = aFlat.norm();
  const nb = bFlat.norm();
  const sim = dot.div(na.mul(nb));
  const val = (await sim.data())[0];
  aFlat.dispose(); bFlat.dispose(); dot.dispose(); na.dispose(); nb.dispose(); sim.dispose();
  return val;
}

export async function verifyLogoWithModel(companyName, uploadedPath) {
  const files = fs.readdirSync(KNOWN_DIR);
  const baseNames = files.map(f => path.parse(f).name.toLowerCase());
  if (!baseNames.includes(companyName.toLowerCase())) {
    // company name not in dataset -> reject
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

    tUploaded.dispose(); tKnown.dispose();

    // threshold - tune as needed
    const threshold = 0.80;
    return { verified: score >= threshold, score };
  } catch (err) {
    console.error("verifyLogo error:", err);
    return { verified: false, reason: "processing-error" };
  }
}
// verifyModel.js (pure JS tfjs + Jimp)
import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import path from "path";
import Jimp from "jimp";

const KNOWN_DIR = path.resolve("ml/known_logos"); // adjust if needed

async function loadImageTensor(imagePath, size = 128) {
  const img = await Jimp.read(imagePath);
  img.resize(size, size);
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  // tf.node.decodeImage not available in pure tfjs; use browser-like decoding
  const uint8 = new Uint8Array(buffer);
  // decode using tf.browser.fromPixels not available on node; use tf.node if present
  // workaround: convert Jimp to Float32Array
  const arr = [];
  for (let i = 0; i < buffer.length; i += 4) {
    // buffer is RGBA
    arr.push(buffer[i] / 255);     // R
    arr.push(buffer[i+1] / 255);   // G
    arr.push(buffer[i+2] / 255);   // B
  }
  // create tensor [1, size, size, 3]
  const tensor = tf.tensor(arr, [1, size, size, 3], "float32");
  return tensor;
}

// cosine similarity helper
async function cosineSimilarity(a, b) {
  const aFlat = a.flatten();
  const bFlat = b.flatten();
  const dot = aFlat.mul(bFlat).sum();
  const na = aFlat.norm();
  const nb = bFlat.norm();
  const sim = dot.div(na.mul(nb));
  const val = (await sim.data())[0];
  aFlat.dispose(); bFlat.dispose(); dot.dispose(); na.dispose(); nb.dispose(); sim.dispose();
  return val;
}

export async function verifyLogoWithModel(companyName, uploadedPath) {
  const files = fs.readdirSync(KNOWN_DIR);
  const baseNames = files.map(f => path.parse(f).name.toLowerCase());
  if (!baseNames.includes(companyName.toLowerCase())) {
    // company name not in dataset -> reject
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

    tUploaded.dispose(); tKnown.dispose();

    // threshold - tune as needed
    const threshold = 0.80;
    return { verified: score >= threshold, score };
  } catch (err) {
    console.error("verifyLogo error:", err);
    return { verified: false, reason: "processing-error" };
  }
}
