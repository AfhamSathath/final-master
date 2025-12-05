import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  contactNumber: String,
  location: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

});

export default mongoose.model("User", userSchema);