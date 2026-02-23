import { useEffect, useState } from "react";
import { fetchUserComplaints } from "../services/grievanceService";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchUserComplaints();
      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic (Case Insensitive) ---
  const filteredComplaints = complaints.filter((c) => {
    const description = (c.description || "").toLowerCase();
    const matchesSearch = description.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="p-10 text-center text-blue-600 font-bold animate-pulse">
        Loading your grievances...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-[#F5F7FA] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0F2A44]">
          Track My Complaints
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Monitor the real-time status of your submitted grievances
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4">
        <input
          placeholder="Search by description..."
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Complaints</option>
          <option value="Pending">Pending / Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="space-y-6">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 italic shadow-sm">
            No complaints found matching your criteria.
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    {c.description}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                      Ref ID: #{c.id}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Date: {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                    c.status?.toLowerCase() === "resolved"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : c.status?.toLowerCase() === "rejected"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              {/* Status Timeline Tracking */}
              <StatusTimeline status={c.status} />

              {/* Interactive Map Preview */}
              {c.latitude && c.longitude && (
                <div className="mt-8 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                  <iframe
                    title={`map-${c.id}`}
                    width="100%"
                    height="160"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.longitude - 0.002}%2C${c.latitude - 0.002}%2C${c.longitude + 0.002}%2C${c.latitude + 0.002}&layer=mapnik&marker=${c.latitude}%2C${c.longitude}`}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* 🔹 Reusable Progress Tracking Component */
function StatusTimeline({ status }) {
  const steps = ["Submitted", "Assigned", "In Progress", "Resolved"];
  const currentStatus = status?.toLowerCase();

  // Logic for Step Indexing
  let activeIndex = 0;
  if (currentStatus === "pending") activeIndex = 1;
  if (currentStatus === "in progress") activeIndex = 2;
  if (currentStatus === "resolved") activeIndex = 3;

  // REJECTED STATE logic
  if (currentStatus === "rejected") {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 border-l-4 border-l-red-600">
        <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
          !
        </div>
        <div>
          <p className="text-red-600 font-black text-xs uppercase tracking-widest">
            Action: Rejected
          </p>
          <p className="text-red-400 text-[10px] mt-0.5 font-medium">
            This complaint has been rejected. Please contact the municipal
            office for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 mb-4 px-1">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCompleted = index < activeIndex;
          const colorClass = activeIndex === 3 ? "bg-green-500" : "bg-blue-600";

          return (
            <div
              key={step}
              className="flex flex-1 items-center last:flex-none relative"
            >
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-700
                  ${isActive ? `${colorClass} text-white scale-110 shadow-lg ring-4 ring-white` : "bg-slate-100 text-slate-300"}`}
                >
                  {isCompleted ? "✓" : index}
                </div>
                <span
                  className={`absolute top-10 text-[9px] uppercase tracking-tighter w-20 text-center font-bold ${isActive ? "text-gray-800" : "text-slate-300"}`}
                >
                  {step}
                </span>
              </div>

              {/* Connecting Line */}
              {index !== steps.length - 1 && (
                <div className="flex-1 h-[3px] bg-slate-100 mx-1 -mt-5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${index < activeIndex ? colorClass : "w-0"}`}
                    style={{ width: index < activeIndex ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
