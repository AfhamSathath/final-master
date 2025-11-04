import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import {
  Users,
  BookOpen,
  Briefcase,
  LogOut,
  Mail,
  Calendar,
  Phone,
  Lock,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

// -----------------------------------------------------
// 🔧 MOCKED AUTH HELPERS (replace with your real utils/Auth.ts)
// -----------------------------------------------------
export const getUser = () => {
  try {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem("token") || "";
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// -----------------------------------------------------
// 📊 TYPES & CONSTANTS
// -----------------------------------------------------
interface Stats {
  enrolledCourses: number;
  appliedJobs: number;
  messages: number;
}

const API_BASE = "http://localhost:5000";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-600",
  user: "bg-blue-100 text-blue-600",
  company: "bg-green-100 text-green-600",
};

// -----------------------------------------------------
// 🧱 MAIN COMPONENT
// -----------------------------------------------------
const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    appliedJobs: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    profilePic: "",
  });

  // -----------------------------------------------------
  // ⚙️ INITIALIZE USER + SOCKET
  // -----------------------------------------------------
  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate("/login");
      return;
    }

    const normalizedUser = { ...u, id: u.id || u._id || "" };
    setUser(normalizedUser);
    setFormData({
      phone: normalizedUser.phone || "",
      password: "",
      profilePic: normalizedUser.profilePic || "",
    });

    const newSocket: Socket = io(API_BASE, {
      auth: { token: getToken() },
    });
    setSocket(newSocket);

    newSocket.on("userStatsUpdate", (updatedStats: Stats) => {
      setStats(updatedStats);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  // -----------------------------------------------------
  // 🧭 HANDLERS
  // -----------------------------------------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditToggle = () => setEditing((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/upload/profile`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setFormData((prev) => ({ ...prev, profilePic: res.data.url }));
      setUser((prev: any) => ({ ...prev, profilePic: res.data.url }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Profile image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/users/${user.id}`,
        {
          phone: formData.phone,
          password: formData.password || undefined,
          profilePic: formData.profilePic,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const handleViewCourses = () => navigate("/courses");
  const handleBrowseJobs = () => navigate("/jobs");

  // -----------------------------------------------------
  // 🖥️ UI
  // -----------------------------------------------------
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="sticky top-0 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold tracking-tight">
                CareerLink LK
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">
                Hello, {user?.name || "User"}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PROFILE CARD */}
          <Card className="shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500">
            <CardHeader className="bg-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center text-blue-700">
                <Users className="w-5 h-5 mr-2" /> My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <img
                  src={
                    formData.profilePic ||
                    "https://via.placeholder.com/120x120.png?text=Profile"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-2 border-blue-400 object-cover"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Change Picture"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Name */}
              <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold">{user?.name || "N/A"}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                <Mail className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{user?.email || "N/A"}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                <Phone className="w-5 h-5 text-orange-400" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Phone</p>
                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border rounded p-1 text-sm"
                    />
                  ) : (
                    <p className="font-semibold">{user?.phone || "N/A"}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              {editing && (
                <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">New Password</p>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border rounded p-1 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roleColors[user?.role || "user"]
                    }`}
                  >
                    {user?.role || "user"}
                  </span>
                </div>
              </div>

              {/* Joined Date */}
              {user?.joinedDate && (
                <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-semibold">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-3 flex justify-end space-x-3">
                {editing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditing(false)}
                      className="bg-gray-400 hover:bg-gray-500"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleEditToggle}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COURSES + JOBS */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" /> Available Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">
                Browse and enroll in career development courses to enhance your
                skills.
              </p>
              <Button
                onClick={handleViewCourses}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Courses
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" /> Job Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">
                Explore job opportunities that match your skills and
                aspirations.
              </p>
              <Button
                onClick={handleBrowseJobs}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
