import express from "express";
import { register, login } from "../Controllers/authController.js";



const router = express.Router();

// REGISTER route
router.post("/register", register);

// LOGIN route (works for both users & companies)
router.post("/login", login);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Step 1: Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required." });
    }

    // ✅ Step 2: (Optional) Check if user exists in DB
    // For now, simulate existence check
    console.log(`Received password reset request for: ${email}`);

    // You could later integrate a real DB query, like:
    // const user = await User.findOne({ email });
    // if (!user) return res.status(404).json({ message: "Email not found." });

    // ✅ Step 3: (Future) Generate token & send email
    // e.g., const resetToken = uuidv4(); and send mail via nodemailer

    // ✅ Step 4: Respond with success message
    return res.status(200).json({
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
});

export default router;
