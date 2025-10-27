import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { Mail } from "lucide-react";

/**
 * Forget Password Component
 * - Validates user email input
 * - Calls backend `/api/auth/forgot-password` endpoint
 * - Navigates to reset password page if success
 */

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // ✅ Define your API base URL (change if needed)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (err) {
        console.error("Invalid JSON response from /forgot-password:", err);
      }

      if (response.ok) {
        toast.success(
          data.message || "Verification successful! Proceed to reset your password."
        );
        // ✅ Redirect user to reset password page
        navigate(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`);
      } else {
        if (response.status === 404) {
          toast.error("This email address is not registered.");
        } else {
          toast.error(data.message || "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error("Forgot password request failed:", error);
      toast.error("Server connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* ✅ Toast notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 bg-white">
        <CardHeader className="space-y-2">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Forgot Password
          </h2>
          <p className="text-sm text-center text-gray-500">
            Enter your email address to receive a password reset link.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgetPassword;
