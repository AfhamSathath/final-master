import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUser, logout } from "@/utils/Auth";
import ProtectedRoute from "@/components/ProtectedRoute";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeClass = "bg-blue-600 text-white";
  const inactiveClass = "text-gray-700 hover:bg-blue-100";

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`bg-gray-100 p-6 flex flex-col transition-all duration-300 ${
            isOpen ? "w-64" : "w-16"
          }`}
        >
          <button
            className="mb-4 bg-gray-300 p-2 rounded hover:bg-gray-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "⏪" : "⏩"}
          </button>

          {isOpen && (
            <>
              <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
              <p className="mb-6">Welcome, {user?.name || "Admin"}</p>
            </>
          )}

          <nav className="flex flex-col gap-2">
            
            <NavLink
              to="/admin-dashboard/users"
              className={({ isActive }) =>
                (isActive ? activeClass : inactiveClass) + " p-2 rounded"
              }
            >
              {isOpen ? "Manage Users" : "👤"}
            </NavLink>
            
            <NavLink
              to="/admin-dashboard/jobs"
              className={({ isActive }) =>
                (isActive ? activeClass : inactiveClass) + " p-2 rounded"
              }
            >
              {isOpen ? "Manage Jobs" : "💼"}
            </NavLink>
            <NavLink
              to="/admin-dashboard/courses"
              className={({ isActive }) =>
                (isActive ? activeClass : inactiveClass) + " p-2 rounded"
              }
            >
              {isOpen ? "Manage Courses" : "📚"}
            </NavLink>

            <button
              onClick={handleLogout}
              className={`mt-4 bg-red-600 text-white px-4 py-2 rounded transition-all duration-300 ${
                isOpen ? "" : "w-10 p-2 text-sm"
              }`}
            >
              {isOpen ? "Logout" : "❌"}
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
