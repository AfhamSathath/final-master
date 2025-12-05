import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Edit, Trash2, PlusCircle } from "lucide-react";

// ================== TYPES ==================
type Job = {
  _id: string;
  title: string;
  description: string;
  company: string;
  qualification: string;
  openDate: string;
  closeDate: string;
  category: string;
};

type NewJob = Omit<Job, "_id">;

// ================== CONSTANTS ==================
const API_BASE = "http://localhost:5000/api/jobs";
const CATEGORY_OPTIONS = [
  "Information Technology",
  "Business & Management",
  "Engineering",
  "Digital Marketing",
  "Health & Safety Management",
];
const CATEGORY_COLORS: Record<string, string> = {
  "Information Technology": "bg-blue-100 text-blue-800",
  "Business & Management": "bg-green-100 text-green-800",
  Engineering: "bg-yellow-100 text-yellow-800",
  "Digital Marketing": "bg-purple-100 text-purple-800",
  "Health & Safety Management": "bg-red-100 text-red-800",
};

// ================== API CALLS ==================
const fetchJobs = async (): Promise<Job[]> => {
  const res = await axios.get(API_BASE);
  return Array.isArray(res.data) ? res.data : [];
};

const createJob = async (job: NewJob) => {
  const res = await axios.post(API_BASE, job);
  return res.data;
};

const updateJob = async (job: Job) => {
  const res = await axios.put(`${API_BASE}/${job._id}`, job);
  return res.data;
};

const deleteJob = async (id: string) => {
  await axios.delete(`${API_BASE}/${id}`);
};

// ================== COMPONENT ==================
const AdminJobsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // ================== STATE ==================
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<NewJob>({
    title: "",
    description: "",
    company: "",
    qualification: "",
    openDate: "",
    closeDate: "",
    category: "",
  });
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ================== FETCH JOBS ==================
  const { data: jobs = [], isLoading, isError } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  // ================== MUTATIONS ==================
  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast.success("✅ Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setFormData({
        title: "",
        description: "",
        company: "",
        qualification: "",
        openDate: "",
        closeDate: "",
        category: "",
      });
      setShowForm(false);
    },
    onError: () => toast.error("❌ Failed to create job"),
  });

  const updateMutation = useMutation({
    mutationFn: updateJob,
    onSuccess: () => {
      toast.success("✅ Job updated successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setEditingJob(null);
      setShowForm(false);
    },
    onError: () => toast.error("❌ Failed to update job"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success("🗑️ Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error("❌ Failed to delete job"),
  });

  // ================== FORM HANDLER ==================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company) {
      toast.error("⚠️ Title and Company are required");
      return;
    }
    if (editingJob) {
      updateMutation.mutate({ ...editingJob, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // ================== FILTERED JOBS ==================
  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = filterCategory ? job.category === filterCategory : true;
    const matchesSearch =
      searchTerm.trim() === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ================== RENDER ==================
  if (isLoading) return <p className="text-center mt-10">Loading jobs...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Failed to load jobs.</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-700">
        💼 Admin Jobs Dashboard
      </h1>

      {/* ===== Add/Edit Form Modal ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setShowForm(false);
                setEditingJob(null);
                setFormData({
                  title: "",
                  description: "",
                  company: "",
                  qualification: "",
                  openDate: "",
                  closeDate: "",
                  category: "",
                });
              }}
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
              {editingJob ? <Edit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              {editingJob ? "Edit Job" : "Add New Job"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="date"
                placeholder="Open Date"
                value={formData.openDate}
                onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="date"
                placeholder="Close Date"
                value={formData.closeDate}
                onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-2 rounded-lg md:col-span-2 w-full"
              ></textarea>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 md:col-span-2"
              >
                {editingJob ? "Update Job" : "Add Job"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== Filter & Search ===== */}
      <div className="flex justify-between max-w-4xl mx-auto mb-6 flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-lg flex-1"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <PlusCircle className="inline w-4 h-4 mr-1" /> Add Job
        </button>
      </div>

      {/* ===== Jobs Grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job._id}
            className="bg-white shadow-md rounded-xl p-6 border hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  CATEGORY_COLORS[job.category] || "bg-gray-100 text-gray-800"
                }`}
              >
                {job.category}
              </span>
            </div>
            <p className="text-gray-600 mb-2">Company/Institution Name:{job.company}</p>
            <p className="text-gray-700 mb-1">Description:{job.description}</p>
            <p className="text-gray-500 text-sm">Qualification: {job.qualification}</p>
            <p className="text-gray-400 text-sm mt-2">
              Open Date: {job.openDate ? new Date(job.openDate).toLocaleDateString() : "N/A"} <br></br> Close Date:{" "}
              {job.closeDate ? new Date(job.closeDate).toLocaleDateString() : "N/A"}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                onClick={() => {
                  setEditingJob(job);
                  setFormData({
                    title: job.title,
                    description: job.description,
                    company: job.company,
                    qualification: job.qualification,
                    openDate: job.openDate,
                    closeDate: job.closeDate,
                    category: job.category,
                  });
                  setShowForm(true);
                }}
              >
                <Edit className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                onClick={() => deleteMutation.mutate(job._id)}
              >
                <Trash2 className="w-4 h-4 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminJobsPage;
