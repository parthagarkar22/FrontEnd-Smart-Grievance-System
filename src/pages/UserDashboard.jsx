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

  // ✅ १. Analytics साठी chartData लॉजिक
  const chartData = [
    { name: "Total", value: stats.total, color: "#3B82F6" },
    { name: "In Progress", value: stats.pending, color: "#F59E0B" },
    { name: "Resolved", value: stats.resolved, color: "#10B981" },
  ].filter((item) => item.value > 0);

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

          {/* ✅ २. Analytics Button - Stats Cards च्या खाली */}
          <div className="mb-12 flex justify-center">
            <button
              onClick={() => navigate("/analytics", { state: { chartData } })}
              className="w-full bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
            >
              <span>📊 View Detailed Analytics Report</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* --- Action Card 1: Track Status --- */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Track Status
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                    View detailed history of all your complaints and check
                    real-time responses from officers.
                  </p>
                  <Link
                    to="/my-complaints"
                    className="inline-block text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    View History →
                  </Link>
                </div>
                <div className="hidden sm:block opacity-10 text-8xl group-hover:opacity-20 transition-opacity">
                  📋
                </div>
              </div>
            </div>

            {/* --- Action Card 2: Local Assistance --- */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-2xl">
                    📢
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Local Assistance
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                    Report issues like street lights, garbage or water leakage
                    directly to the department.
                  </p>
                  <Link
                    to="/complaint"
                    className="inline-block text-red-500 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Report Issue →
                  </Link>
                </div>
                <div className="hidden sm:block opacity-10 text-8xl group-hover:opacity-20 transition-opacity">
                  📢
                </div>
              </div>
            </div>
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
