// src/validation/registerSchema.ts
import { z } from "zod";

export const registerSchema = z.object({
  userType: z.enum(["user", "company"], {
    required_error: "Please select user type",
  }),

  // User fields
  firstName: z.string().min(2, "First name is required").optional(),
  lastName: z.string().min(2, "Last name is required").optional(),

  // Company fields
  name: z.string().min(2, "Company name is required").optional(),
  address: z.string().min(5, "Address is required").optional(),
  regNumber: z.string().min(3, "Registration number is required").optional(),

  // Common fields
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),

  confirmPassword: z.string(),

  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and privacy policy" }),
  }),
}).superRefine((data, ctx) => {
  // Password match check
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "Passwords do not match",
      code: "custom",
    });
  }

  // Conditional required fields
  if (data.userType === "user") {
    if (!data.firstName) ctx.addIssue({
      path: ["firstName"],
      message: "First name is required",
      code: "custom",
    });
    if (!data.lastName) ctx.addIssue({
      path: ["lastName"],
      message: "Last name is required",
      code: "custom",
    });
  }

  if (data.userType === "company") {
    if (!data.name) ctx.addIssue({
      path: ["name"],
      message: "Company name is required",
      code: "custom",
    });
    if (!data.address) ctx.addIssue({
      path: ["address"],
      message: "Address is required",
      code: "custom",
    });
    if (!data.regNumber) ctx.addIssue({
      path: ["regNumber"],
      message: "Registration number is required",
      code: "custom",
    });
  }
});
