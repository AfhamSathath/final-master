// src/pages/auth/VerifyOtp.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = new URLSearchParams(location.search).get("email");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) return toast.error("Enter correct 6-digit OTP");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified");
        navigate(`/reset-password?email=${encodeURIComponent(email!)}`);
      } else toast.error(data.message);
    } catch (err) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-center" />

      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Change Email
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtp;
