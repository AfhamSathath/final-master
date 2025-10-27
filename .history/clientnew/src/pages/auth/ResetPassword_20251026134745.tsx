import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react"; // ✅ icons for eye toggle
import toast from "react-hot-toast";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const validatePassword = (pwd: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length < minLength) {
      toast.error(`Password must be at least ${minLength} characters long.`);
      return false;
    }
    if (!hasUpperCase) {
      toast.error("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!hasLowerCase) {
      toast.error("Password must contain at least one lowercase letter.");
      return false;
    }
    if (!hasNumber) {
      toast.error("Password must contain at least one number.");
      return false;
    }
    if (!hasSpecialChar) {
      toast.error("Password must contain at least one special character.");
      return false;
    }
    return true;
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    if (strength === 5) return { label: "Very Strong", color: "text-green-600" };
    if (strength === 4) return { label: "Strong", color: "text-green-500" };
    if (strength === 3) return { label: "Medium", color: "text-yellow-500" };
    if (strength === 2) return { label: "Weak", color: "text-orange-500" };
    return { label: "Very Weak", color: "text-red-500" };
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Your password has been updated successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <p className="text-gray-500 text-center text-sm">
            Enter a new password for your account.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            {/* New Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* Password strength */}
            {password && (
              <p className={`text-sm font-medium ${strength.color}`}>
                Strength: {strength.label}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Back to{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
