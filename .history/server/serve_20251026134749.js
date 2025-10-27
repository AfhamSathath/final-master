// server.js
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db.js";
import User from "./models/User.js";

// Routes
import userRoutes from "./Routes/userRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import jobRoutes from "./Routes/jobRoutes.js";
import courseRoutes from "./Routes/courseRoutes.js";
import companyRoutes from "./Routes/companyRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// Create HTTP server + Socket.io
// ========================
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // your frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Log socket connections
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Client disconnected:", socket.id));
});

// ========================
// Middleware
// ========================
app.use(express.json());
const allowedOrigin = "http://localhost:8080"; // frontend URL

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors({ origin: allowedOrigin, credentials: true }));

// ========================
// Routes
// ========================
app.get("/", (req, res) => res.send("API running successfully"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admins", adminRoutes);


// ========================
// Auth Register Route
// ========================
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, contactNumber, location } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      location,
    });

    await user.save();
    res.json({ message: "Registration successful", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ========================
// Test Route
// ========================
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Express 👋" });
});

// ========================
// Start Server
// ========================
server.listen(PORT, () => {
  console.log(`✅ Server running with Socket.io on http://localhost:${PORT}`);
});
