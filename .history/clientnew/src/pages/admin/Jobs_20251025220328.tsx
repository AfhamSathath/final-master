import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io, Socket } from "socket.io-client";

type Job = {
  _id: string;
  title: string;
  description: string;
  company: string;
  qualification: string;
  openDate: string;
  closeDate: string;
  category: string;
};

type NewJob = Omit<Job, "_id">;

const API_BASE = "http://localhost:8080";
const socket: Socket = io(API_BASE);

const CATEGORY_OPTIONS = ["IT","Finance","Management","Marketing","HR"];

const AdminJobsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [newJob, setNewJob] = useState<NewJob>({
    title: "",
    description: "",
    company: "",
    qualification: "",
    openDate: "",
    closeDate: "",
    category: "",
  });

  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Fetch jobs
  const { data: jobs = [], isLoading, isError } = useQuery<Job[], Error>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/api/jobs`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Socket.io updates
  useEffect(() => {
    socket.on("jobs:update", () => queryClient.invalidateQueries({ queryKey: ["jobs"] }));
    return () => socket.off("jobs:update");
  }, [queryClient]);

  // CREATE
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API_BASE}/api/jobs`, newJob);
      socket.emit("jobs:update");
      return res.data;
    },
    onSuccess: () => {
      toast.success("✅ Job created!");
      setNewJob({ title:"", description:"", company:"", qualification:"", openDate:"", closeDate:"", category:"" });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error("❌ Failed to create job"),
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: async (job: Job) => {
      const { _id, ...updates } = job;
      const res = await axios.put(`${API_BASE}/api/jobs/${_id}`, updates);
      socket.emit("jobs:update");
      return res.data;
    },
    onSuccess: () => {
      toast.success("✅ Job updated!");
      setEditingJob(null);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error("❌ Failed to update job"),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE}/api/jobs/${id}`);
      socket.emit("jobs:update");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: () => toast.error("❌ Failed to delete job"),
  });

  if (isLoading) return <p className="text-center mt-10">Loading jobs...</p>;
  if (isError) return <p className="text-center mt-10 text-red-500">Failed to load jobs.</p>;

  const renderForm = (jobData: Job | NewJob, setJobData: any, isEdit = false) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">{isEdit ? "✏️ Edit Job" : "➕ Add New Job"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["title","description","company","qualification"].map((key) => (
          <div key={key} className="flex flex-col">
            <label className="font-semibold mb-1 capitalize">{key}</label>
            <input type="text" placeholder={key} value={jobData[key as keyof typeof jobData] || ""} 
              onChange={(e)=>setJobData({...jobData,[key]:e.target.value})} 
              className="border p-2 rounded-lg focus:outline-blue-500" />
          </div>
        ))}
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Category</label>
          <select value={jobData.category || ""} 
            onChange={(e)=>setJobData({...jobData, category:e.target.value})} 
            className="border p-2 rounded-lg focus:outline-blue-500">
            <option value="">Select Category</option>
            {CATEGORY_OPTIONS.map(cat=> <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Opening Date</label>
          <input type="date" value={(jobData.openDate || "").slice(0,10)}
            onChange={(e)=>setJobData({...jobData, openDate:e.target.value})}
            className="border p-2 rounded-lg focus:outline-blue-500" />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Closing Date</label>
          <input type="date" value={(jobData.closeDate || "").slice(0,10)}
            onChange={(e)=>setJobData({...jobData, closeDate:e.target.value})}
            className="border p-2 rounded-lg focus:outline-blue-500" />
        </div>
      </div>
      <div className="mt-6">
        {isEdit ? (
          <>
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mr-3" 
              onClick={()=>editingJob && updateMutation.mutate(editingJob)}>Save Changes</button>
            <button className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500" 
              onClick={()=>setEditingJob(null)}>Cancel</button>
          </>
        ):(
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700" 
            onClick={()=>createMutation.mutate()}>Add Job</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-700">💼 Admin Job Dashboard</h1>
      {editingJob ? renderForm(editingJob, setEditingJob,true) : renderForm(newJob,setNewJob)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job=>(
          <div key={job._id} className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
            <p className="text-gray-600 font-medium">{job.company}</p>
            <p className="text-sm text-gray-700 mt-2">{job.description}</p>
            <p className="text-sm text-gray-500 mt-1">Qualification: {job.qualification}</p>
            <p className="text-sm text-gray-500">Category: {job.category}</p>
            <p className="text-sm text-gray-400 mt-2">
              <span className="font-semibold">Opening Date:</span> {new Date(job.openDate).toLocaleDateString()} <br/>
              <span className="font-semibold">Closing Date:</span> {new Date(job.closeDate).toLocaleDateString()}
            </p>
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700" onClick={()=>setEditingJob(job)}>Edit</button>
              <button className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700" onClick={()=>deleteMutation.mutate(job._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminJobsPage;
