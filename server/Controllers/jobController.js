// controllers/JobController.js
import Job from "../models/Job.js";

// ================== CREATE JOB ==================
export const createJob = async (req, res) => {
  try {
    const { title, description, company, qualification, openDate, closeDate, category } = req.body;

    if (!title || !company || !openDate || !closeDate) {
      return res.status(400).json({ message: "Title, company, openDate, and closeDate are required." });
    }

    const newJob = new Job({
      title,
      description,
      company,
      qualification,
      openDate,
      closeDate,
      category,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to create job", error: error.message });
  }
};

// ================== GET ALL JOBS ==================
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// ================== GET SINGLE JOB ==================
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

// ================== UPDATE JOB ==================
export const updateJob = async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
};

// ================== DELETE JOB ==================
export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
};
