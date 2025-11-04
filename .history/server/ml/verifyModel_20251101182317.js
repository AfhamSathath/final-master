import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import path from "path";

const knownLogoDir = path.resolve("ml/known_logos");

/**
 * Convert image to normalized tensor
 */
async function loadImageAsTensor(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  const tensor = tf.node.decodeImage(buffer, 3)
    .resizeNearestNeighbor([128, 128])
    .toFloat()
    .div(tf.scalar(255))
    .expandDims();
  return tensor;
}

/**
 * Compare uploaded logo with known company logos
 * using cosine similarity of embeddings (simplified)
 */
export async function verifyLogoWithModel(companyName, logoPath) {
  const files = fs.readdirSync(knownLogoDir);
  const knownCompanies = files.map(f => path.parse(f).name.toLowerCase());

  if (!knownCompanies.includes(companyName.toLowerCase())) {
    console.log("Company not in dataset");
    return false;
  }

  const knownLogoPath = path.join(knownLogoDir, `${companyName}.png`);
  if (!fs.existsSync(knownLogoPath)) {
    console.log("Known logo not found for", companyName);
    return false;
  }

  // Load both images
  const uploadedTensor = await loadImageAsTensor(logoPath);
  const knownTensor = await loadImageAsTensor(knownLogoPath);

  // Flatten to 1D and normalize
  const uploadedFlat = uploadedTensor.flatten();
  const knownFlat = knownTensor.flatten();

  // Cosine similarity
  const dot = uploadedFlat.dot(knownFlat);
  const normA = uploadedFlat.norm();
  const normB = knownFlat.norm();
  const similarity = dot.div(normA.mul(normB)).arraySync();

  uploadedTensor.dispose();
  knownTensor.dispose();
  uploadedFlat.dispose();
  knownFlat.dispose();

  console.log(`Similarity score for ${companyName}:`, similarity);

  // threshold can be tuned (0.85 = 85% similarity)
  return similarity > 0.85;
}
