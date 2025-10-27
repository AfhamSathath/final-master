// src/pages/admin/AdminJobsPage.tsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Edit,
  Trash2,
  PlusCircle,
  X,
  Building2,
  Calendar,
  GraduationCap,
} from "lucide-react";
import Linkify from "linkify-react";

// ================== TYPES ==================
type Job = {
  _id: string;
  title: string;
  description: string;
  company: string;
  qualification?: string;
  openDate?: string;
  closeDate?: string;
  category?: string;
};

type NewJob = Omit<Job, "_id">;

type Company = {
  _id: string;
  name: string;
};

// ================== CONSTANTS ==================
const API_BASE = "http://localhost:5000/api/jobs";
const COMPANY_API = "http://localhost:5000/api/companies";

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

// ================== API ==================
const fetchJobs = async (): Promise<Job[]> => {
  const res = await axios.get(API_BASE);
  return Array.isArray(res.data) ? res.data : [];
};

const fetchCompanies = async (): Promise<Company[]> => {
  const res = await axios.get(COMPANY_API);
  return Array.isArray(res.data) ? res.data : [];
};

const createJob = async (newJob: NewJob) => {
  const res = await axios.post(API_BASE, newJob);
  return res.data;
};

const updateJob = async (updatedJob: Job) => {
  const res = await axios.put(`${API_BASE}/${updatedJob._id}`, updatedJob);
  return res.data;
};

const deleteJob = async (id: string) => {
  await axios.delete(`${API_BASE}/${id}`);
};

// ================== COMPONENT ==================
const AdminJobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<NewJob>({
    title: "",
    description: "",
    company: "",
    qualification: "",
    openDate: "",
    closeDate: "",
    category: "",
  });

  const { data: jobs = [], isLoading, isError } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch(() => toast.error("❌ Failed to load companies"));
  }, []);

  // ================== MUTATIONS ==================
  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast.success("✅ Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowForm(false);
    },
    onError: () => toast.error("❌ Failed to create job"),
  });

  const updateMutation = useMutation({
    mutationFn: updateJob,
    onSuccess: () => {
      toast.success("✅ Job updated successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowForm(false);
      setEditingJob(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company) {
      toast.error("⚠️ Title and Company are required");
      return;
    }
    editingJob
      ? updateMutation.mutate({ ...editingJob, ...formData })
      : createMutation.mutate(formData);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = filterCategory ? job.category === filterCategory : true;
    const matchesSearch =
      searchTerm.trim() === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading)
    return <p className="text-center mt-10 text-gray-600">Loading jobs...</p>;
  if (isError)
    return <p className="text-center mt-10 text-red-500">Failed to load jobs.</p>;

  // ================== RENDER ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-10">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 drop-shadow-sm">
        🧑‍💼 Admin Jobs Dashboard
      </h1>

      {/* Filter & Search & Add */}
      <div className="flex flex-col md:flex-row justify-between gap-4 max-w-5xl mx-auto mb-8">
        <input
          type="text"
          placeholder="🔍 Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg p-3 flex-1 bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded-lg p-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setShowForm(true);
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
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-medium shadow-md hover:shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" /> Add Job
        </button>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <p className="text-center text-gray-600 italic">No jobs found.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white/70 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-6 transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {job.title}
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    CATEGORY_COLORS[job.category || ""] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {job.category || ""}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm bg-blue-50 text-blue-800 px-2 py-1 rounded-md font-medium">
                    {job.company}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md font-medium">
                    Qualification: {job.qualification || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm bg-purple-50 text-purple-800 px-2 py-1 rounded-md font-medium">
                    Open: {job.openDate || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span className="text-sm bg-rose-50 text-rose-800 px-2 py-1 rounded-md font-medium">
                    Close: {job.closeDate || "N/A"}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4 border-t pt-2">
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "text-blue-600 underline hover:text-blue-800 break-words",
                  }}
                >
                  {job.description || "No description provided."}
                </Linkify>
              </p>

              <div className="flex gap-3">
                <button
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
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(job._id)}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-2xl relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowForm(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-5 flex items-center gap-2">
              {editingJob ? (
                <Edit className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {editingJob ? "Edit Job" : "Add New Job"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                required
              />
              <select
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                placeholder="Open Date"
                value={formData.openDate}
                onChange={(e) =>
                  setFormData({ ...formData, openDate: e.target.value })
                }
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                placeholder="Close Date"
                value={formData.closeDate}
                onChange={(e) =>
                  setFormData({ ...formData, closeDate: e.target.value })
                }
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border rounded-lg p-3 md:col-span-2 focus:ring-2 focus:ring-blue-400"
                rows={4}
              />
              <button
                type="submit"
                className="col-span-2 mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition"
              >
                {editingJob ? "Update Job" : "Create Job"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
