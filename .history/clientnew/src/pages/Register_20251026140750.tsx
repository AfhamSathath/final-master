import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const API_BASE = "http://localhost:5000";

// ------------------- ZOD VALIDATION -------------------
const registerValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
  regNumber: z
    .string()
    .min(3, "Registration number must be at least 3 characters")
    .optional(),
});

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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // ------------------- ZOD VALIDATION -------------------
      const validation = registerValidationSchema.safeParse(formData);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        setErrorMsg(firstError.message);
        toast.error(`⚠️ ${firstError.message}`);
        setLoading(false);
        return;
      }

      // Password match check
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Passwords do not match");
        toast.error("❌ Passwords do not match!");
        setLoading(false);
        return;
      }

      // ------------------- API CALL -------------------
      if (formData.userType === "company") {
        const response = await axios.post(`${API_BASE}/api/companies`, {
          name: formData.name,
          location: formData.address || "Sri Lanka",
          regNumber: formData.regNumber,
          email: formData.email,
          contactNumber: formData.phone,
          password: formData.password,
        });

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
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
        toast.error(`⚠️ ${error.response.data.message}`);
      } else {
        setErrorMsg("Registration failed. Please try again.");
        toast.error("❌ Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="+94 77 123 4567"
              />
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Register As
              </label>
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

            {/* Company fields */}
            {formData.userType === "company" && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Company Registration Number
                  </label>
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Ex: REG-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Company Location / Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Colombo, Sri Lanka"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="••••••••"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="••••••••"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold shadow-md"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-700">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer font-semibold hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
