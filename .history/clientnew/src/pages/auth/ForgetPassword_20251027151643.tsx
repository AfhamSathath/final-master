import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { Mail } from "lucide-react";

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmails, setRegisteredEmails] = useState<string[]>([]);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ Fetch all registered emails on component mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/emails`);
        if (!res.ok) throw new Error("Failed to fetch emails");
        const data: { emails: string[] } = await res.json();
        setRegisteredEmails(data.emails);
      } catch (err) {
        console.error("Error fetching emails:", err);
      }
    };

    fetchEmails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!registeredEmails.includes(trimmedEmail)) {
      toast.error("This email is not registered.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Reset link sent successfully!");
        navigate(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`);
      } else {
        toast.error(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Something went wrong. Try again later.");
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
            Forgot Password
          </h2>
          <p className="text-sm text-center text-gray-500">
            Enter your email address to receive a reset link.
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

            <Button type="submit" className="w-full font-semibold" disabled={loading}>
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
