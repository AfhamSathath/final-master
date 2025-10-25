import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

interface Company {
  name?: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  company?: Company;
  qualification?: string;
  openDate?: string;
  closeDate?: string;
  category?: string;
}

const STANDARD_CATEGORIES = [
  "Information Technology",
  "Business & Management",
  "Engineering",
  "Digital Marketing",
  "Healthcare",
];

const JobPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Helper: Safely render company
  // ----------------------------
  const renderField = (field: string | Company | undefined) =>
    typeof field === "string" ? field : field?.name ?? "N/A";

  // ----------------------------
  // Fetch jobs from backend
  // ----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data: Job[] = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ----------------------------
  // Socket.io real-time updates
  // ----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket: Socket = io("http://localhost:5000", { auth: { token } });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("jobs:update", (updatedJobs: Job[]) => {
      setJobs(updatedJobs);
    });
    socket.on("connect_error", (err: Error) =>
      toast.error("Socket.io connection failed: " + err.message)
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  // ----------------------------
  // Calculate categories & counts
  // ----------------------------
  const categoryCounts: Record<string, number> = {};
  jobs.forEach((job) => {
    const cat = job.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const jobCategories = Array.from(
    new Set(jobs.map((job) => job.category || "Uncategorized"))
  );

  const availableCategories = [
    "All",
    ...STANDARD_CATEGORIES,
    ...jobCategories.filter((cat) => !STANDARD_CATEGORIES.includes(cat)),
  ];

  // ----------------------------
  // Filter jobs by search + category
  // ----------------------------
  const filteredJobs = jobs.filter((job) => {
    const jobCategory = job.category || "Uncategorized";
    const matchCategory =
      selectedCategory === "All" || jobCategory === selectedCategory;

    const query = searchTerm.toLowerCase();
    const matchSearch =
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      renderField(job.company).toLowerCase().includes(query);

    return matchCategory && matchSearch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        💼 Available Jobs
      </h1>

      {/* Search Input */}
      <div className="flex justify-center mb-4">
        <Input
          placeholder="Search by title, company, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Category Tabs */}
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

      {/* Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card
              key={job._id}
              className="hover:shadow-lg transition-shadow border-blue-100"
            >
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {job.title}
                </h2>
                <p className="text-gray-600 mb-2">
                  <strong>Company:</strong> {renderField(job.company)}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Category:</strong> {job.category || "Uncategorized"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Qualification:</strong> {job.qualification || "N/A"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Open Date:</strong>{" "}
                  {job.openDate ? new Date(job.openDate).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Close Date:</strong>{" "}
                  {job.closeDate ? new Date(job.closeDate).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-gray-700 mt-3">
                  <strong>Description:</strong>{" "}
                  {job.description || "No description available."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-8">
          No jobs found for your search.
        </p>
      )}
    </div>
  );
};

export default JobPage;
