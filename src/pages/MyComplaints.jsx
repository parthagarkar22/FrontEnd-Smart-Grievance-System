import { useEffect, useState } from "react";
import { fetchUserComplaints } from "../services/grievanceService";
import { useNavigate } from "react-router-dom";
// Graph Sathi import
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchUserComplaints();
      setComplaints(data || []);
    } catch (error) {
      console.error("Failed to load complaints", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering & Grouping Logic ---
  const filtered = complaints.filter((c) =>
    (c.description || "").toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = {
    pending: filtered.filter((c) =>
      ["pending", "submitted"].includes(c.status?.toLowerCase()),
    ),
    inProgress: filtered.filter((c) =>
      ["in progress", "in_progress", "assigned"].includes(
        c.status?.toLowerCase(),
      ),
    ),
    resolved: filtered.filter((c) => c.status?.toLowerCase() === "resolved"),
    rejected: filtered.filter((c) => c.status?.toLowerCase() === "rejected"),
  };

  // --- 📊 Statistics Data for PieChart ---
  const chartData = [
    { name: "Pending", value: grouped.pending.length, color: "#3B82F6" }, // Blue
    { name: "In Progress", value: grouped.inProgress.length, color: "#F59E0B" }, // Amber
    { name: "Resolved", value: grouped.resolved.length, color: "#10B981" }, // Green
    { name: "Rejected", value: grouped.rejected.length, color: "#EF4444" }, // Red
  ].filter((item) => item.value > 0);

  if (loading)
    return (
      <div className="p-10 text-center text-blue-600 font-bold animate-pulse">
        Loading your grievances...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0F2A44] tracking-tight">
            MY GRIEVANCES
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Categorized view of your reported issues
          </p>
        </div>
        <input
          placeholder="Search by description..."
          className="rounded-2xl border border-slate-200 px-6 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white min-w-[300px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        {/* --- Section: Pending --- */}
        <ComplaintGroup
          title="🕒 Pending / New"
          data={grouped.pending}
          borderColor="border-l-blue-500"
        />

        {/* --- Section: In Progress --- */}
        <ComplaintGroup
          title="⏳ In Progress"
          data={grouped.inProgress}
          borderColor="border-l-amber-500"
        />

        {/* --- Section: Resolved --- */}
        <ComplaintGroup
          title="✅ Resolved Issues"
          data={grouped.resolved}
          borderColor="border-l-emerald-500"
        />

        {/* --- Section: Rejected --- */}
        <ComplaintGroup
          title="🚫 Rejected"
          data={grouped.rejected}
          borderColor="border-l-red-500"
        />
      </div>

      {/* --- 📈 Graphical Representation Section (At the Bottom) --- */}
      <div className="mt-20 pt-10 border-t border-slate-200">
        <h2 className="text-xl font-black text-[#0F2A44] text-center mb-8 uppercase tracking-widest">
          Grievance Overview Statistics
        </h2>
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 flex flex-col items-center">
          {chartData.length > 0 ? (
            /* ✅ FIX: Added a fixed height div and min-height to ResponsiveContainer to solve chart error */
            <div className="h-[350px] w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase">
                Total Distribution of Complaints
              </p>
            </div>
          ) : (
            <p className="text-slate-400 italic py-10">
              No data available for statistics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable Grouping Component */
function ComplaintGroup({ title, data, borderColor }) {
  const navigate = useNavigate();
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">
        {title} ({data.length})
      </h3>
      <div className="grid grid-cols-1 gap-6">
        {data.map((c) => (
          <div
            key={c.id}
            className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border-l-[6px] ${borderColor}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-slate-800 text-lg">
                  {c.description}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase">
                    ID: #{c.id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    Submitted on: {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-slate-100">
                {c.status}
              </span>
            </div>

            <StatusTimeline status={c.status} />

            {/* ✅ NEW: Feedback Button - Only shows for Resolved Complaints */}
            {c.status?.toLowerCase() === "resolved" && (
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={() =>
                    navigate("/feedback", {
                      state: {
                        grievanceId: c.id,
                        officerId: c.assigned_officer,
                      },
                    })
                  }
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                >
                  ⭐ Rate Our Service
                </button>
              </div>
            )}

            {c.latitude && c.longitude && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-slate-100 shadow-inner opacity-80 hover:opacity-100 transition-opacity">
                <iframe
                  title={`map-${c.id}`}
                  width="100%"
                  height="120"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    c.longitude - 0.002
                  }%2C${c.latitude - 0.002}%2C${c.longitude + 0.002}%2C${
                    c.latitude + 0.002
                  }&layer=mapnik&marker=${c.latitude}%2C${c.longitude}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
/* 🔹 Progress Tracking Component (Keep existing logic) */
function StatusTimeline({ status }) {
  const steps = ["Submitted", "Assigned", "In Progress", "Resolved"];
  const currentStatus = status?.toLowerCase();
  let activeIndex = 0;
  if (["pending", "submitted"].includes(currentStatus)) activeIndex = 1;
  if (["in progress", "in_progress", "assigned"].includes(currentStatus))
    activeIndex = 2;
  if (currentStatus === "resolved") activeIndex = 3;

  if (currentStatus === "rejected") {
    return (
      <div className="mt-4 p-3 bg-red-50 rounded-2xl flex items-center gap-3 border border-red-100">
        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
          !
        </div>
        <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
          Complaint Rejected. Contact office for details.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-4 px-2">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          return (
            <div
              key={step}
              className="flex flex-col items-center flex-1 relative"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold z-10 transition-all ${isActive ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-50" : "bg-slate-100 text-slate-300"}`}
              >
                {index < activeIndex ? "✓" : index}
              </div>
              <span
                className={`mt-2 text-[8px] font-black uppercase tracking-tighter ${isActive ? "text-slate-700" : "text-slate-300"}`}
              >
                {step}
              </span>
              {index !== steps.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 w-full h-[2px] -z-0 ${index < activeIndex ? "bg-blue-600" : "bg-slate-100"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
