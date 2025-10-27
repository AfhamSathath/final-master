import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import Linkify from "react-linkify";

interface Course {
  _id: string;
  name?: string;
  description?: string;
  institution?: string;
  qualification?: string;
  duration?: string;
  category?: string;
}

const STANDARD_CATEGORIES = [
  "Information Technology",
  "Business & Management",
  "Engineering",
  "Digital Marketing",
  "Healthcare",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Information Technology": "bg-blue-100 text-blue-800",
  "Business & Management": "bg-green-100 text-green-800",
  Engineering: "bg-yellow-100 text-yellow-800",
  "Digital Marketing": "bg-purple-100 text-purple-800",
  Healthcare: "bg-red-100 text-red-800",
};

const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api/courses";

  // ✅ Fetch Courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ✅ Real-time updates via Socket.io
useEffect(() => {
  const token = localStorage.getItem("token");
  const socket: Socket = io("http://localhost:5000", { auth: { token } });

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("courses:update", (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    toast.success("Courses updated in real-time!");
  });
  socket.on("connect_error", (err: Error) =>
    toast.error("Socket.io connection failed: " + err.message)
  );

  // ✅ Proper cleanup — return a function, not the socket itself
  return () => {
    socket.disconnect();
  };
}, []);

  // ✅ Filter logic
  const filteredCourses = courses.filter((course) => {
    const cat = course.category || "N/A";
    const matchCategory = selectedCategory === "All" || cat === selectedCategory;

    const q = searchTerm.toLowerCase();
    const matchSearch =
      (course.name?.toLowerCase() ?? "").includes(q) ||
      (course.institution?.toLowerCase() ?? "").includes(q) ||
      (course.description?.toLowerCase() ?? "").includes(q);

    const qual = course.qualification?.toLowerCase() || "";
    const qFilter = qualificationFilter.toLowerCase();
    const matchQualification =
      !qFilter ||
      qual.includes(qFilter) ||
      (qFilter.includes("dg") && qual.includes("degree")) ||
      (qFilter.includes("dip") && qual.includes("diploma")) ||
      (qFilter.includes("al") && qual.includes("a/l")) ||
      (qFilter.includes("ol") && qual.includes("o/l"));

    return matchCategory && matchSearch && matchQualification;
  });

  // ✅ Category counts
  const categoryCounts: Record<string, number> = {};
  courses.forEach((c) => {
    const cat = c.category || "N/A";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const courseCategories = Array.from(
    new Set(courses.map((c) => c.category || "N/A"))
  );
  const availableCategories = [
    "All",
    ...STANDARD_CATEGORIES,
    ...courseCategories.filter((cat) => !STANDARD_CATEGORIES.includes(cat)),
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
      <Toaster position="top-center" />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
          🎓 Explore Our Courses
        </h1>
        <p className="text-gray-600 text-lg">
          Find the perfect course for your next big step.
        </p>
      </div>

      {/* ===== Filters ===== */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search courses or institutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600"
          />
          <Search className="absolute left-3 top-2.5 text-blue-500" size={18} />
        </div>

        <Input
          placeholder="Filter by Qualification (Degree, Diploma, A/L)"
          value={qualificationFilter}
          onChange={(e) => setQualificationFilter(e.target.value)}
          className="w-full md:w-80 border-2 border-green-400 focus:border-green-600"
        />
      </div>

      {/* ===== Category Buttons ===== */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {availableCategories.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-300 ${
                isSelected
                  ? "bg-blue-600 text-white scale-105 shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100"
              } ${count === 0 && cat !== "All"
                ? "text-gray-400 cursor-not-allowed opacity-70"
                : ""
              }`}
              disabled={count === 0 && cat !== "All"}
            >
              {cat} {cat !== "All" && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* ===== Course Cards ===== */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card
              key={course._id}
              className="relative overflow-hidden border border-blue-100 bg-white shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent opacity-70 pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                  {course.name || "Untitled Course"}
                </h2>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full inline-block">
                    Institution: {course.institution || "N/A"}
                  </p>

                  <p
                    className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                      CATEGORY_COLORS[course.category || ""] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Category: {course.category || "N/A"}
                  </p>

                  <p className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block">
                    Qualification: {course.qualification || "N/A"}
                  </p>

                  <p className="text-sm font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-block">
                    Duration: {course.duration || "N/A"}
                  </p>

                  <div className="mt-3 bg-purple-50 border-l-4 border-purple-400 p-3 rounded-md text-sm text-gray-700">
                    <strong className="text-purple-700">Description:</strong>{" "}
                    <Linkify
                      componentDecorator={(href, text, key) => (
                        <a
                          href={href}
                          key={key}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {text}
                        </a>
                      )}
                    >
                      {course.description || "No description available."}
                    </Linkify>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-8">
          No courses found matching your criteria.
        </p>
      )}
    </div>
  );
};

export default CoursePage;
