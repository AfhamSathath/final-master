// src/pages/Register.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

// --------------------
// Zod validation schema
// --------------------
const registerSchema = z
  .object({
    userType: z.enum(["user", "company"], { required_error: "Select a user type" }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    regNumber: z.string().optional(),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;
const API_BASE = "http://localhost:5000";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userType: "user" },
  });

  const userType = watch("userType");

  // --------------------
  // Submit Handler
  // --------------------
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);

      if (data.userType === "company") {
        const res = await axios.post(`${API_BASE}/api/companies`, {
          name: data.name,
          address: data.address,
          regNumber: data.regNumber,
          email: data.email,
          contactNumber: data.phone,
          password: data.password,
        });
        toast.success(res.data.message || "🏢 Company registered successfully!");
      } else {
        const res = await axios.post(`${API_BASE}/api/users`, {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contactNumber: data.phone,
          password: data.password,
          role: "user",
          location: "Sri Lanka",
        });
        toast.success(res.data.message || "🎉 User registered successfully!");
      }

      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "❌ Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
            CareerLink LK
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Join thousands building their careers
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* User Type */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                I want to register as
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="user"
                    {...register("userType")}
                    onChange={() => setValue("userType", "user")}
                    defaultChecked
                  />
                  Student / Job Seeker
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="company"
                    {...register("userType")}
                    onChange={() => setValue("userType", "company")}
                  />
                  Company / Institution
                </label>
              </div>
              {errors.userType && (
                <p className="text-red-500 text-sm">{errors.userType.message}</p>
              )}
            </div>

            {/* User Fields */}
            {userType === "user" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">First Name</label>
                  <input
                    {...register("firstName")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                  <input
                    {...register("lastName")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            {/* Company Fields */}
            {userType === "company" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name
                  </label>
                  <input
                    {...register("name")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="ABC Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Address
                  </label>
                  <input
                    {...register("address")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Colombo, Sri Lanka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Registration Number
                  </label>
                  <input
                    {...register("regNumber")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="REG-12345"
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Phone</label>
                <input
                  {...register("phone")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="0771234567"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                  placeholder="••••••••"
                />
                <div
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                  placeholder="••••••••"
                />
                <div
                  className="absolute right-3 top-9 cursor-pointer text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("agreeToTerms")} id="terms" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the terms and privacy policy
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold shadow-md"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>

            <p className="text-center text-sm mt-4 text-gray-700">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
