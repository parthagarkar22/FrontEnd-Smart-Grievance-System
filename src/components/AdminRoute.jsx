import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const role = localStorage.getItem("role"); // "admin" or "user"

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/complaint" replace />;
  }

  return children;
}
