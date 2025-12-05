// src/pages/Register.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const API_BASE = "http://localhost:5000"; // Your backend URL

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
  // Form submission
  // --------------------
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);

      if (data.userType === "company") {
        const response = await axios.post(`${API_BASE}/api/companies`, {
          name: data.name,
          address: data.address,
          regNumber: data.regNumber,
          email: data.email,
          contactNumber: data.phone,
          password: data.password,
        });

        toast.success(response.data.message || "Company registered successfully");

      } else {
        const response = await axios.post(`${API_BASE}/api/users`, {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contactNumber: data.phone,
          password: data.password,
          role: "user",
          location: "Sri Lanka",
        });

        toast.success(response.data.message || "User registered successfully");
      }

      // Wait 2 seconds so user sees toast
      setTimeout(() => navigate("/login"), 2000);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">CareerLink LK</h1>
          <p className="text-gray-600">Join thousands building their careers</p>
        </div>

        <Card className="shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* User Type */}
            <div className="space-y-2">
              <Label>I want to:</Label>
              <RadioGroup
                defaultValue="user"
                onValueChange={(val) => setValue("userType", val as "user" | "company")}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user">Student / Job Seeker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">Company / Institution</Label>
                </div>
              </RadioGroup>
              {errors.userType?.message && <p className="text-red-500 text-sm">{errors.userType.message}</p>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* User fields */}
              {userType === "user" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input {...register("firstName")} placeholder="John" />
                    {errors.firstName?.message && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input {...register("lastName")} placeholder="Doe" />
                    {errors.lastName?.message && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                  </div>
                </div>
              )}

              {/* Company fields */}
              {userType === "company" && (
                <>
                  <div>
                    <Label>Company Name</Label>
                    <Input {...register("name")} placeholder="ABC Pvt Ltd" />
                    {errors.name?.message && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label>Company Address</Label>
                    <Input {...register("address")} placeholder="No 123, Main St" />
                    {errors.address?.message && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                  </div>
                  <div>
                    <Label>Registration Number</Label>
                    <Input {...register("regNumber")} placeholder="BR123456" />
                    {errors.regNumber?.message && <p className="text-red-500 text-sm">{errors.regNumber.message}</p>}
                  </div>
                </>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input {...register("email")} placeholder="example@mail.com" />
                  {errors.email?.message && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input {...register("phone")} placeholder="0771234567" />
                  {errors.phone?.message && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label>Password</Label>
                  <Input type={showPassword ? "text" : "password"} {...register("password")} />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                  {errors.password?.message && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
                <div className="relative">
                  <Label>Confirm Password</Label>
                  <Input type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                  {errors.confirmPassword?.message && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <input type="checkbox" {...register("agreeToTerms")} id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the terms and privacy policy
                </Label>
              </div>
              {errors.agreeToTerms?.message && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </Button>

              <p className="text-center text-sm mt-3">
                Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
