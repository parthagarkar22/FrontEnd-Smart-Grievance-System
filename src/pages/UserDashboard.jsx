import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate ॲड केले आहे
import { AuthContext } from "../context/AuthContext";
import { fetchUserComplaints } from "../services/grievanceService";
import ChatBot from "../components/ChatBot";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ navigate इनिशियलाइज केले
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUserComplaints();
      const complaintsData = data || [];
      setComplaints(complaintsData);

      // Calculate stats
      const total = complaintsData.length;
      const pending = complaintsData.filter((c) =>
        ["pending", "assigned", "in_progress", "in progress"].includes(
          c.status?.toLowerCase(),
        ),
      ).length;
      const resolved = complaintsData.filter(
        (c) => c.status?.toLowerCase() === "resolved",
      ).length;

      setStats({ total, pending, resolved });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ सर्व स्टेटस दिसण्यासाठी अपडेटेड chartData
  const chartData = [
    { name: "Total", value: stats.total, color: "#64748B" }, // Slate
    {
      name: "Pending",
      value: complaints.filter((c) => c.status?.toLowerCase() === "pending")
        .length,
      color: "#3B82F6",
    }, // Blue
    {
      name: "In Progress",
      value: complaints.filter((c) => c.status?.toLowerCase() === "in_progress")
        .length,
      color: "#F59E0B",
    }, // Amber
    { name: "Resolved", value: stats.resolved, color: "#10B981" }, // Green
    { name: "Rejected", value: stats.rejected, color: "#EF4444" }, // Red
    {
      name: "Escalated",
      value: complaints.filter((c) => c.status?.toLowerCase() === "escalated")
        .length,
      color: "#8B5CF6",
    }, // Purple
  ].filter((item) => item.value > 0); // only those can see who has above 0 value

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-blue-600 animate-pulse text-xl">
        Loading your Dashboard...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans relative">
        <div className="max-w-6xl mx-auto">
          {/* --- Header Section --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Welcome, {user?.first_name || user?.username}! 👋
              </h1>
              <p className="text-slate-500 font-medium">
                Track your reported issues and local services.
              </p>
            </div>
            <Link
              to="/complaint"
              className="w-full md:w-auto bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all text-center uppercase tracking-widest text-xs"
            >
              + New Complaint
            </Link>
          </div>

          {/* --- Stats Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {" "}
            {/* Margin कमी केली */}
            <StatCard
              title="All Reports"
              value={stats.total}
              icon="📊"
              color="blue"
            />
            <StatCard
              title="In Progress"
              value={stats.pending}
              icon="⏳"
              color="amber"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon="✅"
              color="emerald"
            />
          </div>

          {/* --- Main Action Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
            {/* Card 1: Track Status */}
            <Link
              to="/my-complaints"
              className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle Background Decoration */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative flex flex-col h-full justify-between">
                <div className="space-y-5">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                    📋
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                      Track Status
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                      View detailed history of all your complaints and check
                      real-time responses from officers.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center text-blue-600 font-black text-[10px] uppercase tracking-[0.15em] group-hover:gap-3 transition-all">
                  View History <span className="text-lg leading-none">→</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Local Assistance */}
            <Link
              to="/complaint"
              className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle Background Decoration */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-50/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative flex flex-col h-full justify-between">
                <div className="space-y-5">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-red-100 group-hover:scale-110 transition-transform">
                    📢
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                      Local Assistance
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                      Report issues like street lights, garbage or water leakage
                      directly to the department.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center text-red-500 font-black text-[10px] uppercase tracking-[0.15em] group-hover:gap-3 transition-all">
                  Report Issue <span className="text-lg leading-none">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* ✅ Analytics Button positioned below the grid */}
          <div className="mt-10 mb-12 flex justify-center px-4">
            <button
              onClick={() => navigate("/analytics", { state: { chartData } })}
              className="w-full max-w-lg bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Open Analytics Report
            </button>
          </div>
        </div>
      </div>

      <ChatBot />
    </>
  );
};

/* --- Modern Stat Card Component --- */
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
      <div
        className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center text-2xl shadow-inner`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default UserDashboard;
