import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = "http://localhost:5000";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  regNumber?: string;
  address?: string;
  userType: "user" | "company";
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    regNumber: "",
    address: "",
    userType: "user",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("❌ Passwords do not match!");
        setLoading(false);
        return;
      }

      if (formData.userType === "company") {
        if (!logo) {
          toast.error("⚠️ Please upload a company logo for verification!");
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("contactNumber", formData.phone);
        formDataToSend.append("regNumber", formData.regNumber || "");
        formDataToSend.append("location", formData.address || "Sri Lanka");
        formDataToSend.append("logo", logo);

        const response = await axios.post(
          `${API_BASE}/api/companies/register-with-logo`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.status === 201) {
          toast.success("🏢 Company registered successfully!");
          setTimeout(() => navigate("/login"), 1500);
        }
      } else {
        const response = await axios.post(`${API_BASE}/api/users`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          contactNumber: formData.phone,
        });

        if (response.status === 201) {
          toast.success("🎉 User registered successfully!");
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "❌ Registration failed. Please try again."
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
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-semibold">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold">Phone</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* User Type */}
            <div>
              <label className="block font-semibold">Register As</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
              >
                <option value="user">User / Student</option>
                <option value="company">Company / Institution</option>
              </select>
            </div>

            {/* Company Fields */}
            {formData.userType === "company" && (
              <>
                <div>
                  <label className="block font-semibold">
                    Company Registration Number
                  </label>
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
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
              </>
            )}

            {/* Password */}
            <div className="relative">
              <label className="block font-semibold">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block font-semibold">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
