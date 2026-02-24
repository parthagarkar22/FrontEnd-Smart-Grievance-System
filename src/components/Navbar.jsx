import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  fetchNotifications,
  markAsRead,
} from "../services/notificationService";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setIsDropdownOpen(false);
      }
      if (isNotifOpen && !event.target.closest(".notif-dropdown")) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isNotifOpen]);

  useEffect(() => {
    if (user && user.role === "CITIZEN") {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.log("Notification error", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.log("Error marking read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getHomeLink = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "OFFICER") return "/municipal-dashboard";
    return "/user-dashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to={getHomeLink()} className="flex items-center gap-2 group">
              <div className="h-12 w-13 flex items-center justify-center overflow-hidden">
                <img
                  src="/mainlogo.png"
                  alt="Logo"
                  className="h-full w-full object-contain bg-transparent"
                />
              </div>
              <span className="text-xl font-black tracking-tighter text-blue-600 group-hover:text-blue-700 transition">
                Smart<span className="text-gray-800">Grievance</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-bold text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                {user.role === "CITIZEN" && (
                  <div className="flex items-center gap-6 mr-4 border-r pr-6 border-gray-100">
                    <Link
                      to="/complaint"
                      className="text-gray-500 hover:text-blue-600 text-sm font-bold transition"
                    >
                      Raise Complaint
                    </Link>
                    <Link
                      to="/my-complaints"
                      className="text-gray-500 hover:text-blue-600 text-sm font-bold transition"
                    >
                      My History
                    </Link>
                  </div>
                )}

                {/* Notification Bell */}
                {user.role === "CITIZEN" && (
                  <div className="relative notif-dropdown">
                    <button
                      onClick={() => {
                        setIsNotifOpen(!isNotifOpen);
                        setIsDropdownOpen(false);
                      }}
                      className="relative p-2 text-gray-400 hover:text-blue-600 transition group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform block">
                        🔔
                      </span>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {isNotifOpen && (
                      <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-6 py-2 border-b border-gray-50 flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-xs">
                            Alerts
                          </p>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto px-2 custom-scrollbar">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => handleMarkRead(n.id)}
                                className={`p-4 rounded-2xl mb-1 cursor-pointer transition-all ${!n.is_read ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50 opacity-60"}`}
                              >
                                <p
                                  className={`text-xs leading-relaxed ${!n.is_read ? "text-slate-800 font-bold" : "text-slate-500"}`}
                                >
                                  {n.message}
                                </p>
                                <p className="text-[9px] text-gray-400 mt-2 font-mono">
                                  {new Date(n.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="py-10 text-center opacity-30 italic text-sm font-medium">
                              No notifications yet.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Dropdown Area */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex flex-col items-center group transition"
                  >
                    <div className="w-9 h-9 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center border-2 border-transparent group-hover:border-blue-500 transition-all shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 mt-1">
                      {user.username}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-3 border-b border-gray-50 mb-2 text-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase">
                          Account Profile
                        </p>
                        <p className="text-sm font-black text-gray-800 mt-1">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">
                          {user.role}
                        </p>
                      </div>

                      {/* ✅ Citizen ला फक्त 'Give Feedback' दिसेल */}
                      {user.role === "CITIZEN" && (
                        <Link
                          to="/feedback"
                          className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition"
                        >
                          Give Feedback
                        </Link>
                      )}

                      {/* ✅ दोन्ही Admins ला 'View Feedbacks' दिसेल */}
                      {(user.role === "ADMIN" || user.role === "OFFICER") && (
                        <Link
                          to="/view-feedbacks"
                          className="block px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition border-b border-gray-50"
                        >
                          📊 View Feedbacks
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 font-black transition mt-2 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          {/* Full Screen Overlay - Darker for Light Theme Visibility */}
          <div
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Right-aligned Full-Height Drawer Panel */}
          <div className="fixed right-0 top-0 bottom-0 h-full w-[300px] bg-white shadow-[-15px_0_40px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            {/* Header with Dark Blue Text */}
            <div className="px-6 py-8 flex justify-between items-center border-b border-slate-100 bg-white">
              <div>
                <span className="block text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  Portal Menu
                </span>
                <h2 className="text-xl font-black text-[#1E293B] tracking-tight">
                  Navigation
                </h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-[#1E293B] hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <span className="text-2xl leading-none">✕</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
              {user ? (
                <div className="flex flex-col h-full">
                  {/* Dark Blue Profile Card */}
                  <div className="p-6 bg-[#1E293B] rounded-[2rem] mb-6 shadow-xl shadow-blue-900/10">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Authorized Session
                    </p>
                    <p className="font-black text-white text-lg leading-tight truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-slate-400 text-xs mt-1 truncate font-medium">
                      {user.email}
                    </p>
                  </div>

                  {/* Navigation Links with Dark Blue Text */}
                  <nav className="flex flex-col gap-1">
                    <MobileNavLink
                      to="/user-dashboard"
                      icon="📊"
                      label="Dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <MobileNavLink
                      to="/feedback"
                      icon="✍️"
                      label="Give Feedback"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {user &&
                      (user.role === "ADMIN" || user.role === "OFFICER") && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <MobileNavLink
                            to="/view-feedbacks"
                            icon="📈"
                            label="Officer Panel"
                            onClick={() => setIsMobileMenuOpen(false)}
                          />
                        </div>
                      )}
                  </nav>

                  {/* System Logout - Pushed to Bottom */}
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-4 px-4 py-4 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <span>🚪</span> Log Out System
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pt-4">
                  <Link
                    to="/login"
                    className="py-4 text-center border-2 border-slate-100 rounded-2xl font-black text-[#1E293B] text-sm uppercase tracking-widest transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="py-4 text-center bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-100 text-sm uppercase tracking-widest transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Branded Tag */}
            <div className="p-8 text-center bg-slate-50/50">
              <p className="text-[9px] font-black text-[#1E293B]/40 uppercase tracking-[0.4em]">
                Muni-Portal • 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
