// src/pages/company/Profile.tsx
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUser, getToken, logout } from "@/utils/Auth";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Edit2, Save } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

interface Company {
  _id: string;
  name: string;
  email: string;
  regNumber: string;
  contactNumber: string;
  location: string;
  joinedDate?: string;
}

const CompanyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch company profile
  const fetchCompany = async () => {
    try {
      const user = getUser();
      if (!user) {
        toast.error("⚠ You are not logged in! Redirecting to login...");
        logout();
        navigate("/login");
        return;
      }

      const userId = user.id || user._id;
      if (!userId) {
        toast.error("⚠ Invalid user. Redirecting to login...");
        logout();
        navigate("/login");
        return;
      }

      const token = getToken();
      if (!token) {
        toast.error("⚠ Session expired. Redirecting to login...");
        logout();
        navigate("/login");
        return;
      }

      const response = await axios.get<Company>(
        `http://localhost:5000/api/companies/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompany(response.data);
      setEditedCompany(response.data);
      setLoading(false);
      toast.success("✅ Profile loaded successfully!");
    } catch (error) {
      console.error("Failed to fetch company:", error);
      toast.error("❌ Failed to load company profile. Please try again.");
      setLoading(false);
    }
  };

  // Initialize Socket.IO
  useEffect(() => {
    const user = getUser();
    const userId = user?.id || user?._id;
    if (!userId) return;

    fetchCompany();

    const newSocket: Socket = io("http://localhost:5000", {
      auth: { token: getToken() },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect_error", (err) => {
      if (err instanceof Error && err.message.includes("invalid token")) {
        toast.error("⚠ Session expired. Please login again.");
        logout();
        navigate("/login");
      }
    });

    newSocket.on("companyProfileUpdate", (updated: Partial<Company>) => {
      setCompany((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditedCompany((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success("✅ Profile updated in real-time!");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["company"]}>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading company profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!company || !editedCompany) {
    return (
      <ProtectedRoute allowedRoles={["company"]}>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">Failed to load profile.</p>
        </div>
      </ProtectedRoute>
    );
  }

  const handleChange = (field: keyof Company, value: string) => {
    setEditedCompany({ ...editedCompany, [field]: value });
  };

  const handleSave = async () => {
    if (!editedCompany) return;

    // ✅ Confirmation popup before saving
    const confirmSave = window.confirm("Are you sure you want to save changes?");
    if (!confirmSave) return;

    try {
      const token = getToken();
      await axios.put(
        `http://localhost:5000/api/companies/${company._id}`,
        {
          contactNumber: editedCompany.contactNumber,
          location: editedCompany.location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Profile saved successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("❌ Error saving profile. Please try again.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["company"]}>
      <div className="min-h-screen bg-gray-100">
        {/* Toast container */}
        <Toaster position="top-right" reverseOrder={false} />

        <header className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold tracking-tight">CareerLink LK</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Hello, {company.name}</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-md hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <CardHeader className="bg-green-50 rounded-t-lg flex justify-between items-center">
              <CardTitle className="flex items-center text-green-700">
                <Users className="w-5 h-5 mr-2" /> Company Profile
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="flex items-center gap-2"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? "Save" : "Edit"}
              </Button>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Form to allow Enter key for Save */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isEditing) handleSave();
                }}
              >
                {(["name", "email", "regNumber"] as (keyof Company)[]).map((field) => (
                  <div className="flex flex-col" key={field}>
                    <label className="text-sm text-gray-500">
                      {field === "regNumber"
                        ? "Registration Number"
                        : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <Input value={company[field]} readOnly className="border-gray-300 bg-gray-100" />
                  </div>
                ))}

                {(["contactNumber", "location"] as (keyof Company)[]).map((field) => (
                  <div className="flex flex-col" key={field}>
                    <label className="text-sm text-gray-500">
                      {field === "contactNumber" ? "Contact Number" : "Location"}
                    </label>
                    <Input
                      value={editedCompany[field]}
                      readOnly={!isEditing}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className={`border-green-500 focus:border-green-600 ${
                        isEditing ? "" : "bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                ))}

                {company.joinedDate && (
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-500">Joined</label>
                    <Input
                      value={new Date(company.joinedDate).toLocaleDateString()}
                      readOnly
                      className="border-gray-300 bg-gray-100"
                    />
                  </div>
                )}

                {/* Hidden submit button so Enter works */}
                {isEditing && <button type="submit" className="hidden"></button>}
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CompanyProfile;
