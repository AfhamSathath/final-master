import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

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
      // Correct the typo automatically: "dgree" -> "Degree"
      const correctedQualification =
        qualificationFilter.toLowerCase() === "dgree" ? "Degree" : qualificationFilter;

      url = `${API_BASE_URL}/qualification/${encodeURIComponent(correctedQualification)}`;
    }

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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

  // Socket.io real-time updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket: Socket = io("http://localhost:5000", { auth: { token } });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("courses:update", (updatedCourses: Course[]) => {
      if (!qualificationFilter) setCourses(updatedCourses);
    });
    socket.on("connect_error", (err: Error) => toast.error("Socket connection failed: " + err.message));

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
    const cat = course.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const courseCategories = Array.from(
    new Set(courses.map((course) => course.category || "Uncategorized"))
  );

  const availableCategories = [
    "All",
    ...STANDARD_CATEGORIES,
    ...courseCategories.filter((cat) => !STANDARD_CATEGORIES.includes(cat)),
  ];

  const filteredCourses = courses.filter((course) => {
    const courseCategory = course.category || "Uncategorized";
    const matchCategory = selectedCategory === "All" || courseCategory === selectedCategory;

    const query = searchTerm.toLowerCase();
    const matchSearch =
      (course.name?.toLowerCase() ?? "").includes(query) ||
      (course.description?.toLowerCase() ?? "").includes(query) ||
      (course.institution?.toLowerCase() ?? "").includes(query);

    return matchCategory && matchSearch;
  });

  const handleQualificationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchCourses();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        🎓 Available Courses
      </h1>

      <div className="flex justify-center mb-4">
        <Input
          placeholder="Filter by Qualification (e.g., Degree, Diploma)..."
          value={qualificationFilter}
          onChange={(e) => setQualificationFilter(e.target.value)}
          onKeyDown={handleQualificationKeyDown}
          className="max-w-md border-2 border-blue-500"
        />
      </div>

      <div className="flex justify-center mb-4">
        <Input
          placeholder="Search by name, institution, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="flex justify-center gap-4 flex-wrap mb-6">
        {availableCategories.map((cat, idx) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                isSelected
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-800 hover:bg-blue-100"
              } ${count === 0 && cat !== "All" ? "text-gray-400 cursor-not-allowed hover:bg-gray-200" : ""}`}
              disabled={count === 0 && cat !== "All"}
            >
              {cat} {cat !== "All" ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow border-blue-100">
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {course.name || "Untitled Course"}
                </h2>
                <p className="text-gray-600 mb-2">
                  <strong>Institution:</strong> {course.institution || "N/A"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Qualification:</strong> {course.qualification || "N/A"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Duration:</strong> {course.duration || "N/A"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Category:</strong> {course.category || "Uncategorized"}
                </p>
                <p className="text-gray-700 mt-3">
                  <strong>Description:</strong> {course.description || "No description available."}
                </p>
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
