// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getUser, getToken } from "@/utils/Auth";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = getToken();
  const user = getUser();

  // If not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized → render
  return <>{children}</>;
};

export default ProtectedRoute;
