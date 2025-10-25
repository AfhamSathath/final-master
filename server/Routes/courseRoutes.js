// routes/courseRoutes.js
import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../Controllers/courseController.js";

const router = express.Router();

// ========== CRUD ROUTES ==========
router.post("/", createCourse);        // Create a new course
router.get("/", getCourses);           // Get all courses
router.get("/:id", getCourseById);     // Get a single course by ID
router.put("/:id", updateCourse);      // Update a course by ID
router.delete("/:id", deleteCourse);   // Delete a course by ID

export default router;
