import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

// API Base URL
const API_BASE = "http://localhost:5000";

// ------------------- ZOD SCHEMA -------------------
const registerSchema = z.object({
  userType: z.enum(["user", "company"], {
    required_error: "Please select user type",
  }),

  // User fields
  firstName: z.string().min(2, "First name is required").optional(),
  lastName: z.string().min(2, "Last name is required").optional(),

  // Company fields
  name: z.string().min(2, "Company name is required").optional(),
  address: z.string().min(5, "Address is required").optional(),
  regNumber: z.string().min(3, "Registration number is required").optional(),

  // Common fields
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),

  confirmPassword: z.string(),

  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and privacy policy" }),
  }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "Passwords do not match",
      code: "custom",
    });
  }

  if (data.userType === "user") {
    if (!data.firstName) ctx.addIssue({ path: ["firstName"], message: "First name is required", code: "custom" });
    if (!data.lastName) ctx.addIssue({ path: ["lastName"], message: "Last name is required", code: "custom" });
  }

  if (data.userType === "company") {
    if (!data.name) ctx.addIssue({ path: ["name"], message: "Company name is required", code: "custom" });
    if (!data.address) ctx.addIssue({ path: ["address"], message: "Address is required", code: "custom" });
    if (!data.regNumber) ctx.addIssue({ path: ["regNumber"], message: "Registration number is required", code: "custom" });
  }
});

// ------------------- REGISTER COMPONENT -------------------
interface RegisterData {
  firstName?: string;
  lastName?: string;
  name?: string;
  address?: string;
  regNumber?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: "user" | "company";
  agreeToTerms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    name: "",
    address: "",
    regNumber: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "user",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate with Zod
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      Object.values(fieldErrors).forEach(msg => toast.error(`⚠️ ${msg}`));
      setLoading(false);
      return;
    }

    try {
      if (formData.userType === "company") {
        const response = await axios.post(`${API_BASE}/api/companies`, {
          name: formData.name,
          location: formData.address,
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
          name: `${formData.firstName} ${formData.lastName}`,
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
      toast.error(error.response?.data?.message || "❌ Registration failed. Please try again.");
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
            {formData.userType === "user" && (
              <>
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
                </div>
              </>
            )}

            {formData.userType === "company" && (
              <>
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="ABC Ltd"
                  />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>

                {/* Company Registration Number */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="REG-12345"
                  />
                  {errors.regNumber && <p className="text-red-600 text-sm">{errors.regNumber}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Colombo, Sri Lanka"
                  />
                  {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                </div>
              </>
            )}

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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="0771234567"
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="••••••••"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="••••••••"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
            </div>

            {/* Agree to Terms */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label className="text-sm text-gray-700">
                I agree to the <span className="text-blue-600">terms & privacy policy</span>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-600 text-sm">{errors.agreeToTerms}</p>}

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
