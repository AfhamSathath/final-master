import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Company {
  name?: string;
}

interface Job {
  _id: string;
  title: string;
  company?: Company | string;
  description?: string;
  qualification?: string;
  openDate?: string;
  closeDate?: string;
  category?: string;
}

const JobPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000/api/jobs";

  // ✅ Helper to get company name
  const getCompanyName = (company?: Company | string): string => {
    if (!company) return "N/A";
    return typeof company === "string" ? company : company.name || "N/A";
  };

  // ✅ Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(API_BASE_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  // ✅ Real-time updates via Socket.io
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

  // ✅ Handle click on "More Details" button
  const handleMoreDetailsClick = (jobId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please register or log in to view job details.");
      setTimeout(() => navigate("/register"), 1000);
    } else {
      navigate(`/jobs/${jobId}`);
    }
  };

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
          💼 Job Opportunities
        </h1>
        <p className="text-gray-600 text-lg">
          Browse available job listings — register to see more details.
        </p>
      </div>

      {/* ===== Job Cards ===== */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <Card
              key={job._id}
              className="border border-blue-100 bg-white shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full inline-block mb-3">
                    Company: {getCompanyName(job.company)}
                  </p>
                  {job.category && (
                    <p className="text-sm text-gray-600 mb-1">
                      Category: {job.category}
                    </p>
                  )}
                  {job.openDate && (
                    <p className="text-sm text-gray-500 mb-1">
                      Opens: {new Date(job.openDate).toLocaleDateString()}
                    </p>
                  )}
                  {job.closeDate && (
                    <p className="text-sm text-gray-500">
                      Closes: {new Date(job.closeDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleMoreDetailsClick(job._id)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 w-full"
                >
                  More Details
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-8">No jobs found.</p>
      )}
    </div>
  );
};

export default JobPage;
