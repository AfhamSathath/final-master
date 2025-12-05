import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

/**
 * Reset Password Component
 * - Reads email & token from query string
 * - Allows new password entry
 * - Validates password strength
 * - Sends request to backend `/api/auth/reset-password`
 */

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";
  const token = queryParams.get("token") || ""; // optional if backend uses token

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ Validate password (min 8 chars, uppercase, lowercase, number, special char)
  const isStrongPassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Missing email. Please retry the reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill out both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error(
        "Password must have at least 8 characters, uppercase, lowercase, number, and special symbol."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.message || "Reset link invalid or expired.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Server connection error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-center" reverseOrder={false} />

      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 bg-white">
        <CardHeader className="space-y-2">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Reset Password
          </h2>
          <p className="text-sm text-center text-gray-500">
            Enter your new password for {email || "your account"}.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={loading}
                required
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          <p>
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Go back to login
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
