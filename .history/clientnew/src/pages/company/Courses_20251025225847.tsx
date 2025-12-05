// src/pages/company/CompanyCoursesPage.tsx
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
  Clock,
  GraduationCap,
} from "lucide-react";
import { getUser } from "@/utils/Auth";
import Linkify from "linkify-react";

type Course = {
  _id: string;
  name: string;
  description: string;
  institution: string;
  qualification: string;
  duration: string;
  category: string;
  createdAt: string;
};

type NewCourse = Omit<Course, "_id" | "createdAt">;

const API_BASE = "http://localhost:5000/api/courses";

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
const fetchCourses = async (): Promise<Course[]> => {
  const res = await axios.get(API_BASE);
  return res.data;
};
const createCourse = async (newCourse: NewCourse) => {
  const res = await axios.post(API_BASE, newCourse);
  return res.data;
};
const updateCourse = async (updatedCourse: Course) => {
  const res = await axios.put(`${API_BASE}/${updatedCourse._id}`, updatedCourse);
  return res.data;
};
const deleteCourse = async (id: string) => {
  await axios.delete(`${API_BASE}/${id}`);
};

// ================== COMPONENT ==================
const CompanyCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = getUser();
  const companyName = user?.name || "Unknown Company";

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<NewCourse>({
    name: "",
    description: "",
    institution: companyName,
    qualification: "",
    duration: "",
    category: "",
  });
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, institution: companyName }));
  }, [companyName]);

  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("✅ Course created successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setShowForm(false);
    },
    onError: () => toast.error("❌ Failed to create course"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      toast.success("✅ Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setShowForm(false);
      setEditingCourse(null);
    },
    onError: () => toast.error("❌ Failed to update course"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      toast.success("🗑️ Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => toast.error("❌ Failed to delete course"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("⚠️ Course Name is required");
      return;
    }

    const payload = { ...formData, institution: companyName };
    editingCourse
      ? updateMutation.mutate({ ...editingCourse, ...payload })
      : createMutation.mutate(payload);
  };

  const companyCourses = courses.filter((c) => c.institution === companyName);
  const filteredCourses = filterCategory
    ? companyCourses.filter((c) => c.category === filterCategory)
    : companyCourses;

  if (isLoading)
    return <p className="text-center mt-10 text-gray-600">Loading courses...</p>;
  if (isError)
    return <p className="text-center mt-10 text-red-500">Failed to load courses.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-10 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-center" />
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300 drop-shadow-sm">
        🎓 {companyName} Courses Dashboard
      </h1>

      {/* Filter & Add */}
      <div className="flex justify-between max-w-5xl mx-auto mb-8">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded-lg p-3 bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingCourse(null);
            setFormData({
              name: "",
              description: "",
              institution: companyName,
              qualification: "",
              duration: "",
              category: "",
            });
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-medium shadow-md hover:shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" /> Add Course
        </button>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <p className="text-center text-gray-600 italic">No courses available.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md rounded-2xl p-6 transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {course.name}
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    CATEGORY_COLORS[course.category] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.category}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-md font-medium">
                    {course.institution}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-2 py-1 rounded-md font-medium">
                    Qualification: {course.qualification || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded-md font-medium">
                    Duration: {course.duration || "N/A"}
                  </span>
                </div>
              </div>

              {/* Linkified Description */}
              <div className="text-gray-700 dark:text-gray-300 text-sm mb-4 border-t border-gray-200 dark:border-gray-700 pt-2 break-words">
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className:
                      "text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-200",
                  }}
                >
                  {course.description || "No description provided."}
                </Linkify>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingCourse(course);
                    setFormData({
                      name: course.name,
                      description: course.description,
                      institution: companyName,
                      qualification: course.qualification,
                      duration: course.duration,
                      category: course.category,
                    });
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(course._id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl w-full max-w-2xl relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setShowForm(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-5 flex items-center gap-2">
              {editingCourse ? <Edit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="text"
                value={companyName}
                readOnly
                className="border rounded-lg p-3 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              />
              <input
                type="text"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border rounded-lg p-3 md:col-span-2 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                rows={4}
              />
              <button
                type="submit"
                className="col-span-2 mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition"
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCoursesPage;
