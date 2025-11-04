// client/src/pages/CompanyVerify.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CompanyVerify = () => {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !logo) {
      toast.error("Please provide both company name and logo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("logo", logo);

    try {
      const res = await axios.post("http://localhost:5000/api/verify-company", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("✅ Verified! Redirecting to registration...");
        setTimeout(() => navigate("/register"), 1500);
      } else {
        toast.error(res.data.message || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error during verification");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 w-96 flex flex-col gap-3"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Company Verification</h2>

        <input
          type="text"
          placeholder="Enter company name (e.g. LankaSoft Pvt Ltd)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Verify Company
        </button>
      </form>
    </div>
  );
};

export default CompanyVerify;
