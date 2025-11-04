import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const API_BASE = "http://localhost:5000/api";

// ------------------- VALIDATION SCHEMA -------------------
const registerSchema = z.object({
  name: z.string().min(3, "Company name is required"),
  regNumber: z.string().min(5, "Registration number required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    regNumber: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ------------------- VERIFY COMPANY -------------------
  const verifyCompany = async () => {
    try {
      const res = await axios.post(`${API_BASE}/verify-company`, {
        companyName: form.name,
        regNumber: form.regNumber,
        email: form.email,
        checkDuplicate: true,
      });

      if (res.data.duplicate) {
        toast.error("⚠️ Company already registered!");
        return false;
      }

      if (!res.data.verified) {
        toast.error(`❌ ${res.data.reason}`);
        return false;
      }

      toast.success(`✅ Verified (Confidence: ${(res.data.confidence * 100).toFixed(0)}%)`);
      return true;
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("⚠️ Company already exists!");
      } else {
        toast.error("❌ Verification failed");
      }
      return false;
    }
  };

  // ------------------- REGISTER -------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = registerSchema.safeParse(form);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    const verified = await verifyCompany();
    if (!verified) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/register`, form);
      toast.success("🎉 Registration successful!");
      navigate("/login");
    } catch (err: any) {
      toast.error("⚠️ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Company Registration</h2>

        <input
          type="text"
          name="name"
          placeholder="Company Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="text"
          name="regNumber"
          placeholder="Registration Number (e.g. PV/1234/2022)"
          value={form.regNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="email"
          name="email"
          placeholder="Company Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg pr-10"
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
