// models/Course.js
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    institution: { type: String, required: true },
    qualification: { type: String, default: "" },
    duration: { type: String, default: "" },
    category: { type: String, default: "" },
  
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);
