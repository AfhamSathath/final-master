// App.tsx
import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ===== Public Pages =====
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/user/Courses";
import UserJobs from "./pages/user/Jobs";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/Privacy";
import ContactUs from "./pages/ContactUs";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ForgetPassword from "./pages/auth/ForgetPassword";

// ===== Dashboards =====
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import UserDashboard from "./pages/UserDashboard";

// ===== Admin Pages =====
import AdminJobs from "./pages/admin/Jobs";
import AdminCoursesPage from "./pages/admin/Courses";
import Users from "./pages/admin/Users";

// ===== Company Pages =====
import CompanyJobsPage from "./pages/company/Jobs";
import CompanyCoursesPage from "./pages/company/Courses";
import CompanyProfile from "./pages/company/Profile"

// ===== Auth Utils =====
import ProtectedRoute from "./components/ProtectedRoute";
import { getUser, isAuthenticated } from "./utils/Auth";

// ===== React Query =====
const queryClient = new QueryClient();

// ===== Role-based redirect =====
const RoleBasedRedirect = () => {
  if (isAuthenticated()) {
    const user = getUser();
    const role = user?.role?.toLowerCase() || "user";

    switch (role) {
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      case "company":
        return <Navigate to="/company-dashboard" replace />;
      case "user":
      default:
        return <Navigate to="/user-dashboard" replace />;
    }
  }
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ===== Public Routes ===== */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/jobs" element={<UserJobs />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgetPassword/>}/>

          {/* ===== Role-based Redirect ===== */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* ===== USER DASHBOARD ===== */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* ===== COMPANY DASHBOARD ===== */}
          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="jobs" element={<CompanyJobsPage />} />
            <Route path="courses" element={<CompanyCoursesPage />} />
            <Route path="" element={<Navigate to="jobs" replace />} />
            <Route path="Profile" element={<CompanyProfile/>} />
          </Route>

          {/* ===== ADMIN DASHBOARD ===== */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<Navigate to="users" replace />} />
            <Route path="users" element={<Users />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="courses" element={<AdminCoursesPage />} />
          </Route>

          {/* ===== Backward Compatibility Redirects ===== */}
          <Route path="/admin/users" element={<Navigate to="/admin-dashboard/users" replace />} />
          <Route path="/admin/jobs" element={<Navigate to="/admin-dashboard/jobs" replace />} />
          <Route path="/admin/courses" element={<Navigate to="/admin-dashboard/courses" replace />} />

          <Route path="/company/jobs" element={<Navigate to="/company-dashboard/jobs" replace />} />
          <Route path="/company/courses" element={<Navigate to="/company-dashboard/courses" replace />} />
           <Route path="/company/Profile" element={<Navigate to="/company-dashboard/profile" replace />} />

          {/* ===== Catch-all 404 ===== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
