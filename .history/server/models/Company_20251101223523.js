// server/models/Company.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    regNumber: { type: String, required: true },
    password: { type: String, required: true },
    logo: { type: String }, // stored filename
    logoHash: { type: String }, // for logo verification
    address: { type: String },
    role: { type: String, default: "company" },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
