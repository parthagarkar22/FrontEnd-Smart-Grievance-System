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
  const navigate = useNavigate(); // ✅ हे फंक्शनच्या आत हवे

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

  // --- Filtering & Sorting Logic ---
  const filtered = complaints
    .filter((c) =>
      (c.description || "").toLowerCase().includes(search.toLowerCase()),
    )
    // Sort by date: Newest first
    // Replace 'created_at' with your actual date field name (e.g., 'date' or 'timestamp')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // --- Grouping Logic ---
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

  // ✅ १. हा chartData व्हेरिएबल इथे हवा, तरच बटण काम करेल
  const chartData = [
    { name: "Pending", value: grouped.pending.length, color: "#3B82F6" },
    { name: "In Progress", value: grouped.inProgress.length, color: "#F59E0B" },
    { name: "Resolved", value: grouped.resolved.length, color: "#10B981" },
    { name: "Rejected", value: grouped.rejected.length, color: "#EF4444" },
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
        <ComplaintGroup
          title="🕒 Pending / New"
          data={grouped.pending}
          borderColor="border-l-blue-500"
        />
        <ComplaintGroup
          title="⏳ In Progress"
          data={grouped.inProgress}
          borderColor="border-l-amber-500"
        />
        <ComplaintGroup
          title="✅ Resolved Issues"
          data={grouped.resolved}
          borderColor="border-l-emerald-500"
        />
        <ComplaintGroup
          title="🚫 Rejected"
          data={grouped.rejected}
          borderColor="border-l-red-500"
        />
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

                        officerId: c.assigned_to || 1,
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
  const steps = ["Sent", "Assigned", "Fixing", "Resolved"];
  const currentStatus = status?.toLowerCase();

  // Mapping logic
  let activeIndex = 0;
  if (["pending", "submitted"].includes(currentStatus)) activeIndex = 1;
  if (["assigned", "in progress", "in_progress"].includes(currentStatus))
    activeIndex = 3; // Jump to 3 for visual impact
  if (currentStatus === "resolved") activeIndex = 4;

  // ❌ REJECTED STATE
  if (currentStatus === "rejected") {
    return (
      <div className="mt-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 border border-red-100 animate-pulse">
        <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-red-200">
          ✕
        </div>
        <div>
          <p className="text-[11px] text-red-600 font-black uppercase tracking-widest">
            Action Required
          </p>
          <p className="text-xs text-red-500 font-medium">
            This report was rejected. Tap for details.
          </p>
        </div>
      </div>
    );
  }

  // ✅ RESOLVED / COMPLETED STATE
  if (currentStatus === "resolved") {
    return (
      <div className="mt-6 p-5 bg-green-50 rounded-[2rem] border-2 border-dashed border-green-200 flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl shadow-lg shadow-green-200 animate-bounce">
          ✓
        </div>
        <div>
          <p className="text-sm font-bold text-green-700">
            Issue Resolved Successfully!
          </p>
          <p className="text-[10px] text-green-600 uppercase font-black tracking-widest opacity-70">
            Case Closed
          </p>
        </div>
      </div>
    );
  }

  // ⏳ ACTIVE TRACKING STATE
  return (
    <div className="mt-8 px-2">
      <div className="flex justify-between items-center relative">
        {/* Background Gray Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />

        {/* Active Blue Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-blue-500 -translate-y-1/2 z-0 transition-all duration-700"
          style={{ width: `${(activeIndex - 1) * 33.33}%` }}
        />

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum <= activeIndex;
          const isCurrent = stepNum === activeIndex;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-lg"
                    : isActive
                      ? "bg-blue-500 text-white"
                      : "bg-white border-2 border-slate-200 text-slate-300"
                }`}
              >
                {isActive && !isCurrent ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-[10px] font-bold">{stepNum}</span>
                )}
              </div>
              <p
                className={`absolute -bottom-6 text-[9px] font-black uppercase tracking-tighter whitespace-nowrap ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
