import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Edit, Trash2, PlusCircle, X } from "lucide-react";

// ================== TYPES ==================
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

// ================== CONSTANTS ==================
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

// ================== API CALLS ==================
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
const AdminCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // ================== STATE ==================
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<NewCourse>({
    name: "",
    description: "",
    institution: "",
    qualification: "",
    duration: "",
    category: "",
  });
  const [filterCategory, setFilterCategory] = useState<string>("");

  // ================== FETCH COURSES ==================
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  // ================== MUTATIONS ==================
  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("✅ Course created successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setFormData({ name: "", description: "", institution: "", qualification: "", duration: "", category: "" });
      setShowForm(false);
    },
    onError: () => toast.error("❌ Failed to create course"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      toast.success("✅ Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setEditingCourse(null);
      setShowForm(false);
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

  // ================== FORM HANDLER ==================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.institution) {
      toast.error("⚠️ Name and Institution are required");
      return;
    }

    if (editingCourse) {
      updateMutation.mutate({ ...editingCourse, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // ================== FILTERED COURSES ==================
  const filteredCourses = filterCategory
    ? courses.filter((course) => course.category === filterCategory)
    : courses;

  // ================== RENDER ==================
  if (isLoading) return <p className="text-center mt-10">Loading courses...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Failed to load courses.</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-700">
        🎓 Admin Courses Dashboard
      </h1>

      {/* ===== Add/Edit Form Modal ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setShowForm(false);
                setEditingCourse(null);
                setFormData({ name: "", description: "", institution: "", qualification: "", duration: "", category: "" });
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
              {editingCourse ? <Edit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded-lg focus:outline-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
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
                type="text"
                placeholder="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                {editingCourse ? "Update Course" : "Add Course"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== Filter & Add Button ===== */}
      <div className="flex justify-between max-w-4xl mx-auto mb-6">
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
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* ===== Courses Grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            className="bg-white shadow-md rounded-xl p-6 border hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800">{course.name}</h2>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  CATEGORY_COLORS[course.category] || "bg-gray-100 text-gray-800"
                }`}
              >
                {course.category}
              </span>
            </div>

            {/* ===== ATTRACTIVE FIELD COLORS ===== */}
            <div className="flex flex-col gap-2 mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                Company/Institution: {course.institution}
              </span>
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                Qualification: {course.qualification || "N/A"}
              </span>
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-medium">
                Duration: {course.duration || "N/A"}
              </span>
              <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm font-medium">
                Description: {course.description || "No description."}
              </span>
              <span
                className={`inline-block px-2 py-1 rounded-lg text-sm font-medium ${
                  CATEGORY_COLORS[course.category] || "bg-gray-100 text-gray-800"
                }`}
              >
                Category: {course.category}
              </span>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setEditingCourse(course);
                  setFormData({
                    name: course.name,
                    description: course.description,
                    institution: course.institution,
                    qualification: course.qualification,
                    duration: course.duration,
                    category: course.category,
                  });
                  setShowForm(true);
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(course._id)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
