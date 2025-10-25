// src/pages/user/Courses.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

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

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    let url = API_BASE_URL;

    if (qualificationFilter) {
      url = `${API_BASE_URL}/qualification/${encodeURIComponent(
        qualificationFilter
      )}`;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404 && qualificationFilter) {
          setCourses([]);
          toast.error(`No courses found for qualification: ${qualificationFilter}`);
          return;
        }
        throw new Error("Failed to fetch courses");
      }

      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [qualificationFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket: Socket = io("http://localhost:5000", { auth: { token } });

    socket.on("connect", () => console.log("Socket connected:", socket.id));

    socket.on("courses:update", (updatedCourses: Course[]) => {
      if (!qualificationFilter) {
        setCourses(updatedCourses);
        toast.success("Courses updated in real-time!");
      }
    });

    socket.on("connect_error", (err: Error) =>
      toast.error("Socket.io connection failed: " + err.message)
    );

    return () => {
      socket.disconnect();
    };
  }, [qualificationFilter]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  const categoryCounts: Record<string, number> = {};
  courses.forEach((course) => {
    const cat = course.category || "N/A";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const courseCategories = Array.from(
    new Set(courses.map((course) => course.category || "N/A"))
  );

  const availableCategories = [
    "All",
    ...STANDARD_CATEGORIES,
    ...courseCategories.filter((cat) => !STANDARD_CATEGORIES.includes(cat)),
  ];

  const filteredCourses = courses.filter((course) => {
    const courseCategory = course.category || "N/A";
    const matchCategory =
      selectedCategory === "All" || courseCategory === selectedCategory;

    const query = searchTerm.toLowerCase();
    const matchSearch =
      (course.name?.toLowerCase() ?? "").includes(query) ||
      (course.institution?.toLowerCase() ?? "").includes(query) ||
      (course.description?.toLowerCase() ?? "").includes(query);

    return matchCategory && matchSearch;
  });

  const handleQualificationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") fetchCourses();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-700">
        🎓 Explore Available Courses
      </h1>

      {/* ===== Filters Section ===== */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Filter by Qualification (e.g., Degree, Diploma)..."
            value={qualificationFilter}
            onChange={(e) => setQualificationFilter(e.target.value)}
            onKeyDown={handleQualificationKeyDown}
            className="border-2 border-blue-500 pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>

        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search by course, institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-gray-300 pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* ===== Category Tabs ===== */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {availableCategories.map((cat, idx) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white border border-gray-300 hover:bg-blue-50 text-gray-800"
              } ${
                count === 0 && cat !== "All"
                  ? "text-gray-400 cursor-not-allowed opacity-70"
                  : ""
              }`}
              disabled={count === 0 && cat !== "All"}
            >
              {cat} {cat !== "All" ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      {/* ===== Course Cards ===== */}
      {filteredCourses.length > 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course._id}
              className="bg-white shadow-md rounded-xl p-5 border hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <CardContent className="p-0 space-y-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  {course.name || "Untitled Course"}
                </h2>

                <div className="text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Institution:</span>{" "}
                    {course.institution || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Qualification:</span>{" "}
                    {course.qualification || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-700">Duration:</span>{" "}
                    {course.duration || "N/A"}
                  </p>
                  <p
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      CATEGORY_COLORS[course.category || ""] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.category || "Uncategorized"}
                  </p>
                </div>

                <p className="text-gray-700 text-sm border-t pt-3">
                  {course.description || "No description available."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-12 text-lg">
          No courses found matching your criteria.
        </p>
      )}
    </div>
  );
};

export default CoursePage;
