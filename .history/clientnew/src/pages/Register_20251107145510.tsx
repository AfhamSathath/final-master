import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const API_BASE = "http://localhost:5000";

const registerValidationSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{9,10}$/, "Phone number must be 9–10 digits"),
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
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  regNumber?: string;
  address?: string;
  userType: "user" | "company";
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    regNumber: "",
    address: "",
    userType: "user",
  });

  const [verified, setVerified] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const verifyCompany = async () => {
    if (!formData.name.trim()) {
      toast.error("⚠️ Please enter your company name first!");
      return;
    }

    try {
      const toastId = toast.loading("🔍 Verifying Sri Lankan company keywords...");

      const sriLankanKeywords = [
        "lanka",
        "ceylon",
        "serendib",
        "holdings",
        "enterprises",
        "exports",
        "imports",
        "group",
        "solutions",
        "technologies",
        "industries",
        "traders",
        "pvt ltd",
        "private limited",
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
      toast.error("❌ Verification failed. Please try again.");
      console.error("Verification error:", err);
      setVerified(false);
      setConfidence(null);
    }
  };

  const checkDuplicate = async (): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_BASE}/api/check-duplicate`, {
        email: formData.email,
        phone: formData.phone,
        regNumber: formData.regNumber,
        name: formData.name,
      });

      if (res.data.exists) {
        toast.error("⚠️ Email, phone, or registration number already in use!");
        return true;
      }

      return false;
    } catch (err) {
      console.error("Duplicate check error:", err);
      toast.error("❌ Failed to check duplicates.");
      return true;
    }
  };

  const sendOtp = async () => {
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setOtp(otpCode);
      toast.success(`📩 OTP sent to ${formData.email}`);
      console.log("📨 OTP (for testing):", otpCode);
      setOtpSent(true);
    } catch (err) {
      toast.error("❌ Failed to send OTP. Try again later.");
    }
  };

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

      const duplicateFound = await checkDuplicate();
      if (duplicateFound) {
        setLoading(false);
        return;
      }

      await sendOtp();
      setLoading(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      setErrorMsg(msg);
      toast.error(`❌ ${msg}`);
      console.error(error);
      setLoading(false);
    }
  };

  const verifyOtpAndRegister = async () => {
    if (enteredOtp.trim() !== otp) {
      toast.error("❌ Invalid OTP. Please try again.");
      return;
    }

    try {
      setLoading(true);

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
          contactNumber: formData.phone,
          password: formData.password,
        });

        if (response.status === 201) {
          toast.success("🎉 User registered successfully!");
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to complete registration.";
      toast.error(`❌ ${msg}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {!otpSent ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
            <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
              Create Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- all your form fields --- */}

              {errorMsg && (
                <p className="text-red-600 text-sm text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold shadow-md disabled:opacity-60"
              >
                {loading ? "Processing..." : "Register"}
              </button>
            </form>

            {/* ✅ Added login link here */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Go to Login
              </button>
            </p>
          </div>
        </div>
      ) : (
        // OTP Screen
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 p-4">
          <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-3">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a 6-digit OTP to <strong>{formData.email}</strong>
            </p>

            <input
              type="text"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              maxLength={6}
              className="w-full p-3 border rounded-md text-center text-lg tracking-widest focus:ring-2 focus:ring-green-400"
              placeholder="Enter OTP"
            />

            <button
              onClick={verifyOtpAndRegister}
              disabled={loading}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold shadow-md disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>

            <button
              onClick={sendOtp}
              className="mt-3 text-blue-600 font-medium hover:underline"
            >
              Resend OTP
            </button>

            {/* ✅ Added login link to OTP screen too */}
            <p className="text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Go to Login
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
