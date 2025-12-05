import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  contactNumber: String,
  confirmPassword: String,
   resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  
  

});

export default mongoose.model("User", userSchema);