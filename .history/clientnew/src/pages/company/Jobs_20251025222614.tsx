import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Edit, Trash2, PlusCircle, X, Briefcase } from "lucide-react";
import { getUser } from "@/utils/Auth";

// ================== TYPES ==================
export type Job = {
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
  "Engineering": "bg-yellow-100 text-yellow-800",
  "Digital Marketing": "bg-purple-100 text-purple-800",
  "Health & Safety Management": "bg-red-100 text-red-800",
};

// ================== API CALLS ==================
const fetchJobs = async (): Promise<Job[]> => {
  const res = await axios.get(API_BASE);
  return res.data;
};

const createJob = async (newJob: NewJob): Promise<Job> => {
  const res = await axios.post(API_BASE, newJob);
  return res.data;
};

const updateJob = async (updatedJob: Job): Promise<Job> => {
  const res = await axios.put(`${API_BASE}/${updatedJob._id}`, updatedJob);
  return res.data;
};

const deleteJob = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};

// ================== COMPONENT ==================
const CompanyJobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = getUser();
  const companyName = user?.name || "Unknown Company";

  // ================== STATE ==================
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<NewJob>({
    title: "",
    description: "",
    company: companyName,
    qualification: "",
    openDate: "",
    closeDate: "",
    category: "",
  });
  const [filterCategory, setFilterCategory] = useState<string>("");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, company: companyName }));
  }, [companyName]);

  // ================== QUERIES ==================
  const { data: jobs = [], isLoading, isError } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  // ================== MUTATIONS ==================
  const createMutation = useMutation<Job, Error, NewJob>({
    mutationFn: createJob,
    onSuccess: () => {
      toast.success("✅ Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      resetForm();
    },
    onError: () => toast.error("❌ Failed to create job"),
  });

  const updateMutation = useMutation<Job, Error, Job>({
    mutationFn: updateJob,
    onSuccess: () => {
      toast.success("✅ Job updated successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      resetForm();
    },
    onError: () => toast.error("❌ Failed to update job"),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success("🗑️ Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error("❌ Failed to delete job"),
  });

  // ================== HELPERS ==================
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      company: companyName,
      qualification: "",
      openDate: "",
      closeDate: "",
      category: "",
    });
    setEditingJob(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("⚠️ Title and Description are required");
      return;
    }

    const payload = { ...formData, company: companyName };
    if (editingJob) updateMutation.mutate({ ...editingJob, ...payload });
    else createMutation.mutate(payload);
  };

  // ================== FILTER ==================
  const companyJobs = jobs.filter((job) => job.company === companyName);
  const filteredJobs = filterCategory
    ? companyJobs.filter((job) => job.category === filterCategory)
    : companyJobs;

  // ================== RENDER ==================
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading jobs...
      </div>
    );
  if (isError)
    return (
      <p className="text-center mt-10 text-red-500">
        ❌ Failed to load jobs. Please try again.
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            {companyName} Jobs Dashboard
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border p-2 rounded-lg sm:w-64 shadow-sm focus:outline-indigo-500"
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1 shadow"
            >
              <PlusCircle className="w-5 h-5" /> Add Job
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                onClick={resetForm}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-semibold mb-4 text-indigo-600 flex items-center gap-2">
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
                  className="border p-2 rounded-lg shadow-sm focus:outline-indigo-500"
                  required
                />
                <input
                  type="text"
                  value={companyName}
                  readOnly
                  className="border p-2 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Qualification"
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                  className="border p-2 rounded-lg shadow-sm focus:outline-indigo-500"
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="border p-2 rounded-lg shadow-sm focus:outline-indigo-500"
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={formData.openDate}
                  onChange={(e) =>
                    setFormData({ ...formData, openDate: e.target.value })
                  }
                  className="border p-2 rounded-lg shadow-sm focus:outline-indigo-500"
                />
                <input
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) =>
                    setFormData({ ...formData, closeDate: e.target.value })
                  }
                  className="border p-2 rounded-lg shadow-sm focus:outline-indigo-500"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border p-2 rounded-lg md:col-span-2 w-full shadow-sm focus:outline-indigo-500"
                ></textarea>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 md:col-span-2 transition shadow"
                >
                  {editingJob ? "Update Job" : "Add Job"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No jobs found 😕
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {job.title}
                  </h2>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      CATEGORY_COLORS[job.category] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.category || "Uncategorized"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  <strong>Qualification:</strong> {job.qualification || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Open Date:</strong> {job.openDate || "-"}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong>Close Date:</strong> {job.closeDate || "-"}
                </p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {job.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingJob(job);
                      setFormData({
                        title: job.title,
                        description: job.description,
                        company: companyName,
                        qualification: job.qualification,
                        openDate: job.openDate,
                        closeDate: job.closeDate,
                        category: job.category,
                      });
                      setShowForm(true);
                    }}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(job._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobsPage;
