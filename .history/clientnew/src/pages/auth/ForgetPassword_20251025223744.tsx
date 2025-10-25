import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // 🔧 Replace with your actual backend API endpoint
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Reset link sent! Check your email inbox.");
        navigate("/login");
      } else {
        toast.error(data.message || "Email not found. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
          <p className="text-gray-500 text-center text-sm">
            Enter your email address to receive a reset link.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline cursor-pointer"
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
