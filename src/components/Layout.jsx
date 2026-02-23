import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  // Helper to get badge colors based on role/dept
  const getRoleBadge = () => {
    if (!user) return null;

    if (user.role === "CITIZEN") {
      return (
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold ml-2">
          CITIZEN
        </span>
      );
    }

    // For Admins, show their department name as the badge
    return (
      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold ml-2 uppercase">
        {user.department || "ADMIN"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Smart Grievance
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.first_name || user.username}
                      </span>
                      {getRoleBadge()}
                    </div>
                    {user.role !== "CITIZEN" && (
                      <span className="text-[10px] text-gray-400">
                        Officer Portal
                      </span>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium text-blue-600">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  );
};

export default Layout;
