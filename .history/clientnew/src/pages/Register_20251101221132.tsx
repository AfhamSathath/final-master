import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Upload } from "lucide-react";
import { z } from "zod";

// ------------------- API BASE -------------------
const API_BASE = "http://localhost:5000";

// ------------------- VALIDATION -------------------
const registerValidationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[@$!%*?&]/, "Must contain at least one special character"),
  regNumber: z.string().optional(),
  address: z.string().optional(),
  userType: z.enum(["user", "company"]),
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

  const [logo, setLogo] = useState<File | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ------------------- HANDLERS -------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  // ------------------- COMPANY VERIFICATION -------------------
  const verifyCompany = async () => {
    if (!logo || !formData.name) {
      toast.error("⚠️ Please provide a company name and upload logo first!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("logo", logo);
    formDataToSend.append("companyName", formData.name);

    try {
      toast.loading("🔍 Verifying company authenticity...");
      const res = await axios.post(
        `${API_BASE}/api/verify-company`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.dismiss();
      if (res.data?.verified) {
        toast.success("✅ Company verified successfully!");
        setVerified(true);
      } else {
        toast.error("❌ Company not found or logo mismatch!");
        setVerified(false);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("❌ Verification failed. Try again later.");
      setVerified(false);
    }
  };

  // ------------------- FORM SUBMIT -------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const validation = registerValidationSchema.safeParse(formData);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        setErrorMsg(firstError.message);
        toast.error(`⚠️ ${firstError.message}`);
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Passwords do not match");
        toast.error("❌ Passwords do not match!");
        setLoading(false);
        return;
      }

      if (formData.userType === "company" && !verified) {
        toast.error("⚠️ Please verify your company logo before registration.");
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

  // ------------------- RENDER -------------------
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
                Full Name / Company Name
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

            {/* User Type */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Account Type
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
              >
                <option value="user">User</option>
                <option value="company">Company</option>
              </select>
            </div>

            {/* Company logo upload */}
            {formData.userType === "company" && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Upload Company Logo
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={verifyCompany}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md font-semibold text-white ${
                      verified ? "bg-green-600" : "bg-blue-600"
                    } hover:opacity-90`}
                  >
                    <Upload size={16} />
                    {verified ? "Verified" : "Verify"}
                  </button>
                </div>
              </div>
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
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
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
                placeholder="Enter your phone number"
              />
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
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-8 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-8 text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Company Reg & Address */}
            {formData.userType === "company" && (
              <>
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
                    placeholder="Enter registration number"
                  />
                </div>
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
                    placeholder="Enter company address"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold shadow-md"
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
