// routes/JobRoutes.js
import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/JobController.js";

const router = express.Router();

// CRUD Routes
router.post("/", createJob);          // Create job
router.get("/", getJobs);             // Get all jobs
router.get("/:id", getJobById);       // Get single job by ID
router.put("/:id", updateJob);        // Update job by ID
router.delete("/:id", deleteJob);     // Delete job by ID

export default router;
