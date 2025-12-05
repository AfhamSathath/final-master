import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    regNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    logo: {
      type: String, // ✅ stores filename or URL of uploaded logo
      default: null,
    },
    logoHash: {
      type: String, // ✅ stores computed Jimp hash for verification
      default: null,
    },
    role: {
      type: String,
      default: "company",
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // ✅ automatically adds createdAt and updatedAt
  }
);

export default mongoose.model("Company", companySchema);
