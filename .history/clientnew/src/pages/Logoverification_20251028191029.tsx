import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const LogoVerification: React.FC = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<File | null>(null);
  const [regNumber, setRegNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logo || !regNumber) {
      toast.error("⚠️ Please upload your logo and enter your registration number!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("logo", logo);
      formData.append("regNumber", regNumber);

      const res = await axios.post(`${API_BASE}/api/companies/verify-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("✅ Logo verified successfully!");
        setTimeout(() => {
          navigate("/register?verified=true&regNumber=" + regNumber);
        }, 1500);
      } else {
        toast.error("❌ Logo verification failed!");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "❌ Verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Company Logo Verification
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold">Registration Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="Ex: REG-12345"
              />
            </div>

            <div>
              <label className="block font-semibold">Upload Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold"
            >
              {loading ? "Verifying..." : "Verify Logo"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LogoVerification;
