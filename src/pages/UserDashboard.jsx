import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchUserComplaints } from "../services/grievanceService";
import FeedbackForm from "../components/FeedbackForm"; // आपण बनवलेला कंपोनंट

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null); // Feedback साठी

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUserComplaints();
      setComplaints(data || []);

      // आकडे मोजणे
      const total = data.length;
      const pending = data.filter((c) =>
        ["pending", "assigned", "in_progress", "in progress"].includes(
          c.status?.toLowerCase(),
        ),
      ).length;
      const resolved = data.filter(
        (c) => c.status?.toLowerCase() === "resolved",
      ).length;

      setStats({ total, pending, resolved });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // ज्या तक्रारी Resolved आहेत पण फीडबॅक बाकी आहे अशा तक्रारी शोधणे
  const resolvedWithoutFeedback = complaints.filter(
    (c) => c.status?.toLowerCase() === "resolved" && !c.has_feedback, // समजा बॅकएंड 'has_feedback' पाठवतंय
  );

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-blue-600 animate-pulse text-xl">
        Loading your Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
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
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all text-center uppercase tracking-widest text-xs"
          >
            + New Complaint
          </Link>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Side: Main Actions --- */}
          <div className="lg:col-span-2 space-y-6">
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

          {/* --- Right Side: Feedback Section (New ✨) --- */}
          <div className="space-y-6">
            <div className="bg-[#0F2A44] p-6 rounded-3xl text-white shadow-xl">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <span>⭐</span> Feedback Needed
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                Your ratings help us improve municipal services.
              </p>

              <div className="space-y-4">
                {resolvedWithoutFeedback.length > 0 ? (
                  resolvedWithoutFeedback.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white/10 p-4 rounded-2xl border border-white/10"
                    >
                      <p className="text-sm font-bold truncate">
                        {c.title || "Grievance Record"}
                      </p>
                      <p className="text-[10px] text-slate-400 mb-3">
                        ID: #{c.id}
                      </p>
                      <button
                        onClick={() => setSelectedGrievance(c)}
                        className="w-full py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition"
                      >
                        Rate Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 text-sm italic">
                      No pending feedbacks. Great!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Feedback Modal Pop-up --- */}
        {selectedGrievance && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedGrievance(null)}
            ></div>
            <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedGrievance(null)}
                className="absolute -top-12 right-0 text-white font-bold hover:text-red-400"
              >
                CLOSE [X]
              </button>
              <FeedbackForm
                grievanceId={selectedGrievance.id}
                officerId={selectedGrievance.assigned_to}
                onSuccess={() => {
                  setSelectedGrievance(null);
                  loadData();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
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
