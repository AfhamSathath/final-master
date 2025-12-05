import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUser, logout, getToken } from "@/utils/Auth";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Briefcase, LogOut, Mail, Calendar } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-600",
  user: "bg-blue-100 text-blue-600",
  company: "bg-green-100 text-green-600",
};

interface Stats {
  enrolledCourses: number;
  appliedJobs: number;
  messages: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUserState] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({ enrolledCourses: 0, appliedJobs: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Connect to Socket.IO and fetch user info
  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate("/login");
      return;
    }

    const normalizedUser = { ...u, id: u.id || u._id || "" };
    setUserState(normalizedUser);

    // Initialize socket
    const newSocket: Socket = io("http://localhost:5000", {
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewCourses = () => navigate("/courses");
  const handleBrowseJobs = () => navigate("/jobs");

  return (
    <ProtectedRoute allowedRoles={["user", "admin", "company"]}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="sticky top-0 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-white" />
                <span className="text-2xl font-bold tracking-tight">CareerLink LK</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Hello, {user?.name || "User"}</span>
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

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Card */}
            <Card className="shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500">
              <CardHeader className="bg-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center text-blue-700">
                  <Users className="w-5 h-5 mr-2" /> My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm hover:bg-blue-50 transition-colors">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold">{user?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm hover:bg-blue-50 transition-colors">
                  <Mail className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{user?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm hover:bg-blue-50 transition-colors">
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
                {user?.joinedDate && (
                  <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm hover:bg-blue-50 transition-colors">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-semibold">{new Date(user.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

           
          </div>

          {/* Courses & Jobs Row */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" /> Available Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">
                  Browse and enroll in career development courses to enhance your skills and advance your career.
                </p>
                <Button
                  onClick={handleViewCourses}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
                  Find your dream job from top companies. Explore opportunities that match your skills and aspirations.
                </p>
                <Button
                  onClick={handleBrowseJobs}
                  className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default UserDashboard;
