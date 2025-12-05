import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    regNumber: { type: String, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    role: { type: String, default: "company" },
    resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
