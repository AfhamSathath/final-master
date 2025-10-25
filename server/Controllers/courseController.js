// controllers/courseController.js
import Course from "../models/Course.js";

// ================== CREATE COURSE ==================
export const createCourse = async (req, res) => {
  try {
    const { name, description, institution, qualification, duration, category } = req.body;

    if (!name || !institution) {
      return res.status(400).json({ error: "Name and institution are required" });
    }

    const newCourse = new Course({
      name,
      description,
      institution,
      qualification,
      duration,
      category,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

// ================== GET ALL COURSES ==================
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// ================== GET COURSE BY ID ==================
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error("❌ Error fetching course by ID:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

// ================== UPDATE COURSE ==================
export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

// ================== DELETE COURSE ==================
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "✅ Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};
