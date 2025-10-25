// src/pages/user/Jobs.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import Linkify from "react-linkify"; // ✅ Added for clickable links

interface Company {
  name?: string;
}

interface Job {
  _id: string;
  title: string;
  description?: string;
  company?: Company | string; // ✅ Fix: allow company to be string or object
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

const CATEGORY_COLORS: Record<string, string> = {
  "Information Technology": "bg-blue-100 text-blue-800",
  "Business & Management": "bg-green-100 text-green-800",
  Engineering: "bg-yellow-100 text-yellow-800",
  "Digital Marketing": "bg-purple-100 text-purple-800",
  Healthcare: "bg-red-100 text-red-800",
};

const JobPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api/jobs";

  // ✅ Helper to render company name properly
  const getCompanyName = (company?: Company | string): string => {
    if (!company) return "N/A";
    if (typeof company === "string") return company;
    if (typeof company === "object" && company.name) return company.name;
    return "N/A";
  };

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data: Job[] = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      toast.error("Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Socket.io for real-time updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket: Socket = io("http://localhost:5000", { auth: { token } });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("jobs:update", (updatedJobs: Job[]) => {
      setJobs(updatedJobs);
      toast.success("Jobs updated in real-time!");
    });
    socket.on("connect_error", (err: Error) =>
      toast.error("Socket.io connection failed: " + err.message)
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  // =========================
  // FILTERING LOGIC
  // =========================
  const filteredJobs = jobs.filter((job) => {
    const jobCategory = job.category || "N/A";
    const matchCategory =
      selectedCategory === "All" || jobCategory === selectedCategory;

    const companyName = getCompanyName(job.company).toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchSearch = companyName.includes(query);

    const qual = job.qualification?.toLowerCase() || "";
    const qFilter = qualificationFilter.toLowerCase();

    const matchQualification =
      !qFilter ||
      qual.includes(qFilter) ||
      (qFilter.includes("dg") && qual.includes("degree")) ||
      (qFilter.includes("dip") && qual.includes("diploma")) ||
      (qFilter.includes("a/l") && qual.includes("a/l")) ||
      (qFilter.includes("al") && qual.includes("a/l")) ||
      (qFilter.includes("o/l") && qual.includes("o/l")) ||
      (qFilter.includes("ol") && qual.includes("o/l"));

    return matchCategory && matchSearch && matchQualification;
  });

  // Category counts
  const categoryCounts: Record<string, number> = {};
  jobs.forEach((job) => {
    const cat = job.category || "N/A";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const jobCategories = Array.from(new Set(jobs.map((job) => job.category || "N/A")));
  const availableCategories = [
    "All",
    ...STANDARD_CATEGORIES,
    ...jobCategories.filter((cat) => !STANDARD_CATEGORIES.includes(cat)),
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        💼 Available Jobs
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
        <Input
          placeholder="Filter by Qualification (e.g., Degree, Diploma, A/L)..."
          value={qualificationFilter}
          onChange={(e) => setQualificationFilter(e.target.value)}
          className="w-full md:w-80 border-2 border-blue-500"
        />

        <Input
          placeholder="Search by Company or Institution"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 border-2 border-gray-300"
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
              } ${
                count === 0 && cat !== "All"
                  ? "text-gray-400 cursor-not-allowed hover:bg-gray-200"
                  : ""
              }`}
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
              className="hover:shadow-xl transition transform hover:-translate-y-1 border border-blue-100"
            >
              <CardContent className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  {job.title}
                </h2>

                <div className="flex flex-col gap-2">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                    Company: {getCompanyName(job.company)}
                  </span>

                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-sm font-medium ${
                      CATEGORY_COLORS[job.category || ""] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Category: {job.category || "N/A"}
                  </span>

                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                    Qualification: {job.qualification || "N/A"}
                  </span>

                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-medium">
                    Open Date:{" "}
                    {job.openDate
                      ? new Date(job.openDate).toLocaleDateString()
                      : "N/A"}{" "}
                    <br /> Close Date:{" "}
                    {job.closeDate
                      ? new Date(job.closeDate).toLocaleDateString()
                      : "N/A"}
                  </span>

                  {/* ✅ Clickable description links */}
                  <div className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm font-medium break-words">
                    <strong>Description:</strong>{" "}
                    <Linkify
                      componentDecorator={(decoratedHref, decoratedText, key) => (
                        <a
                          href={decoratedHref}
                          key={key}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {decoratedText}
                        </a>
                      )}
                    >
                      {job.description || "No description available."}
                    </Linkify>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-8">
          No jobs found matching your criteria.
        </p>
      )}
    </div>
  );
};

export default JobPage;
