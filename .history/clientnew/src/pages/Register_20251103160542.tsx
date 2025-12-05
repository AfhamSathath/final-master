import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

// ------------------- API BASE -------------------
const API_BASE = "http://localhost:5000";

// ------------------- VALIDATION (zod) -------------------
const registerValidationSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{9,10}$/, "Phone number must be 9-10 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[@$!%*?&]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    regNumber: z.string().optional(),
    address: z.string().optional(),
    userType: z.enum(["user", "company"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
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

  const [verified, setVerified] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ------------------- INPUT HANDLER -------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------- COMPANY VERIFICATION -------------------
  const verifyCompany = async () => {
    if (!formData.name) {
      toast.error("⚠️ Please enter your company name first!");
      return;
    }

    try {
      const toastId = toast.loading("🔍 Verifying Sri Lankan company keywords...");

      const sriLankanKeywords = [
        "Lanka",
        "Ceylon",
        "Pvt Ltd",
        "Private Limited",
        "Holdings",
        "Enterprises",
        "Industries",
        "Exports",
        "Imports",
        "Group",
        "Solutions",
        "Technologies",
      ];

      const name = formData.name.toLowerCase();
      const foundKeyword = sriLankanKeywords.find((kw) =>
        name.includes(kw.toLowerCase())
      );

      toast.dismiss(toastId);

      if (foundKeyword) {
        toast.success(`✅ Verified: contains '${foundKeyword}'`);
        setVerified(true);
        setConfidence(0.95);
      } else {
        toast.error("❌ Company name does not match Sri Lankan business keywords.");
        setVerified(false);
        setConfidence(0.3);
      }
    } catch (err) {
      toast.dismiss();
      toast.error("❌ Verification failed. Try again later.");
      setVerified(false);
      setConfidence(null);
      console.error(err);
    }
  };

  // ------------------- DUPLICATE CHECK -------------------
  const checkDuplicate = async (): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_BASE}/api/checkDuplicate`, {
        email: formData.email,
        phone: formData.phone,
        regNumber: formData.regNumber,
      });

      if (res.data.exists) {
        toast.error("⚠️ Email, phone number, or registration number already in use!");
        return true;
      }

      return false;
    } catch (err) {
      console.error("Duplicate check error:", err);
      toast.error("❌ Failed to check duplicates.");
      return true;
    }
  };

  // ------------------- FORM SUBMIT -------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const validation = registerValidationSchema.safeParse(formData);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        toast.error(`⚠️ ${firstError.message}`);
        setErrorMsg(firstError.message);
        setLoading(false);
        return;
      }

      if (formData.userType === "company" && !verified) {
        toast.error("⚠️ Please verify your company before registration.");
        setLoading(false);
        return;
      }

      // Step 1: Check duplicates
      const duplicateFound = await checkDuplicate();
      if (duplicateFound) {
        setLoading(false);
        return;
      }

      // Step 2: API request (company or user)
      if (formData.userType === "company") {
        const response = await axios.post(`${API_BASE}/api/companies`, {
          name: formData.name,
          location: formData.address || "Sri Lanka",
          regNumber: formData.regNumber || undefined,
          email: formData.email,
          contactNumber: formData.phone,
          password: formData.password,
        });

        if (response.status === 201) {
          toast.success("🏢 Company registered successfully!");
          setTimeout(() => navigate("/login"), 1500);
          return;
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
          return;
        }
      }

      throw new Error("Unexpected server response");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      setErrorMsg(msg);
      toast.error(`❌ ${msg}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- UI -------------------
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
                placeholder="Enter your full name or company name"
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

            {/* Company Verification */}
            {formData.userType === "company" && (
              <>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Registration Number (optional)
                  </label>
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., PV/1234/2022"
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={verifyCompany}
                    className={`px-4 py-2 rounded-md font-semibold text-white ${
                      verified ? "bg-green-600" : "bg-blue-600"
                    } hover:opacity-90`}
                  >
                    {verified ? "Verified ✅" : "Verify Company"}
                  </button>
                  {confidence !== null && (
                    <span
                      className={`text-sm font-medium ${
                        verified ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      Confidence: {(confidence * 100).toFixed(0)}%
                    </span>
                  )}
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Address */}
            {formData.userType === "company" && (
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
            )}

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold shadow-md disabled:opacity-60"
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
