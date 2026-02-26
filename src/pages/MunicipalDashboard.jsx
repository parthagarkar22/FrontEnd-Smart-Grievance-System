import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  fetchMunicipalData,
  updateComplaintStatus,
} from "../services/grievanceService";

const MunicipalDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMunicipalData();
      const allComplaints = data.complaints || [];
      const officerFeedbacks = data.feedbacks || [];

      // --- 🚀 SORTING LOGIC: Status (Pending first) then Priority ---
      const sortedComplaints = [...allComplaints].sort((a, b) => {
        // १. स्टेटस सॉर्टिंग (Pending तक्रारी सर्वात वर)
        const statusOrder = {
          pending: 1,
          in_progress: 2,
          resolved: 3,
          rejected: 4,
        };
        const statusA = a.status?.toLowerCase() || "pending";
        const statusB = b.status?.toLowerCase() || "pending";

        if (statusOrder[statusA] !== statusOrder[statusB]) {
          return statusOrder[statusA] - statusOrder[statusB];
        }

        // २. प्रायोरिटी सॉर्टिंग (जर स्टेटस सेम असेल तर)
        const weight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      });

      setComplaints(sortedComplaints);
      setFeedbacks(officerFeedbacks);

      setStats({
        total: sortedComplaints.length,
        pending: sortedComplaints.filter((c) =>
          ["pending", "assigned", "in_progress", "in progress"].includes(
            c.status?.toLowerCase(),
          ),
        ).length,
        resolved: sortedComplaints.filter(
          (c) => c.status?.toLowerCase() === "resolved",
        ).length,
        rejected: sortedComplaints.filter(
          (c) => c.status?.toLowerCase() === "rejected",
        ).length,
      });
    } catch (err) {
      console.error("Error fetching officer data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      let statusToBackend = newStatus.toLowerCase();
      if (statusToBackend === "in progress") statusToBackend = "in_progress";

      await updateComplaintStatus(id, statusToBackend);
      loadData();
    } catch (err) {
      alert("Status update failed. Complaint might be already resolved.");
    }
  };

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
          feedbacks.length
        ).toFixed(1)
      : "N/A";

  if (loading)
    return (
      <div className="p-10 text-center text-blue-600 font-bold animate-pulse text-xl">
        Loading {user?.department} Records...
      </div>
    );

  return (
    <div className="space-y-10 p-4 font-sans bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
            {user?.department || "MUNICIPAL"} PANEL
          </h1>
          <p className="text-gray-500 text-sm italic">
            Officer In-charge: {user?.first_name || user?.username}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-center">
          <p className="text-[10px] font-black text-emerald-600 uppercase">
            My Rating
          </p>
          <p className="text-xl font-black text-emerald-700">{avgRating} / 5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={stats.total}
          color="bg-blue-600"
        />
        <StatCard
          title="Active/Pending"
          value={stats.pending}
          color="bg-orange-500"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          color="bg-emerald-500"
        />
        <StatCard title="Rejected" value={stats.rejected} color="bg-red-600" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="p-5">ID</th>
                <th className="p-5">Citizen & Exact Address</th>
                <th className="p-5">Image</th>
                <th className="p-5 text-center">Priority</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {complaints.map((c) => {
                const displayName =
                  c.citizen_name || c.username || `Citizen #${c.user}`;
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="p-5 font-mono text-gray-400 text-xs">
                      #{c.id}
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-gray-800">{displayName}</p>
                      <a
                        href={
                          c.formatted_address ||
                          `https://www.google.com/maps?q=${c.latitude},${c.longitude}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-black hover:underline mt-1 bg-blue-50 px-2 py-1 rounded-md"
                      >
                        📍 VIEW EXACT LOCATION
                      </a>
                    </td>

                    <td className="px-6 py-4">
                      {c.image ? (
                        <img
                          src={
                            c.image.startsWith("http")
                              ? c.image
                              : c.image.startsWith("/")
                                ? `http://127.0.0.1:8000${c.image}`
                                : `http://127.0.0.1:8000/${c.image}`
                          }
                          alt="Evidence"
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 border border-gray-200"
                          onClick={() =>
                            setSelectedImg(
                              c.image.startsWith("http")
                                ? c.image
                                : c.image.startsWith("/")
                                  ? `http://127.0.0.1:8000${c.image}`
                                  : `http://127.0.0.1:8000/${c.image}`,
                            )
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/150?text=No+Image";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">
                          No Image
                        </span>
                      )}
                    </td>

                    <td className="p-5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border ${
                          c.priority === "CRITICAL"
                            ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                            : c.priority === "HIGH"
                              ? "bg-orange-50 text-orange-600 border-orange-200"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}
                      >
                        {c.priority || "LOW"}
                      </span>
                    </td>
                    <td
                      className="p-5 text-gray-600 text-xs max-w-xs truncate"
                      title={c.description}
                    >
                      {c.description || "No details provided"}
                    </td>

                    <td className="p-5 text-center">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="p-5">
                      <select
                        disabled={c.status?.toLowerCase() === "resolved"}
                        className={` rounded-lg text-xs p-2 font-black outline-none transition-all border-2 ${
                          c.status === "resolved"
                            ? "bg-green-50 text-green-700 border-green-200 cursor-not-allowed opacity-70"
                            : c.status === "in_progress"
                              ? "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500"
                              : "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500" // For Pending
                        }`}
                        value={
                          c.status === "in_progress" ? "in_progress" : c.status
                        }
                        onChange={(e) =>
                          handleStatusChange(c.id, e.target.value)
                        }
                      >
                        <option
                          value="pending"
                          className="bg-white text-blue-700 font-bold"
                        >
                          ⏳ Pending
                        </option>
                        <option
                          value="in_progress"
                          className="bg-white text-amber-700 font-bold"
                        >
                          🏗️ In Progress
                        </option>
                        <option
                          value="resolved"
                          className="bg-white text-green-700 font-bold"
                        >
                          ✅ Resolved
                        </option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
          <span>⭐</span> Citizen Feedback On My Service
        </h2>
        {feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded">
                      {f.rating} / 5 ⭐
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      G-ID: #{f.grievance}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 italic font-medium leading-relaxed">
                    "{f.comment || "Citizen appreciated the resolution."}"
                  </p>
                </div>
                <p className="text-[9px] text-gray-400 mt-4 text-right">
                  {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 opacity-50">
            <p className="text-sm italic">
              No citizen feedback received yet. Keep resolving issues!
            </p>
          </div>
        )}
      </div>
      {selectedImg && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-10 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            className="max-w-full max-h-[90vh] rounded-2xl"
            alt="Full View"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div
    className={`${color} text-white p-6 rounded-3xl shadow-lg transform hover:scale-105 transition-all duration-300`}
  >
    <h3 className="text-xs font-bold uppercase opacity-80 tracking-widest">
      {title}
    </h3>
    <p className="text-4xl font-black mt-1">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  let bgClass = "bg-orange-50 text-orange-700 border-orange-100";
  if (s === "resolved") bgClass = "bg-green-50 text-green-700 border-green-100";
  if (s === "rejected") bgClass = "bg-red-50 text-red-700 border-red-100";
  if (s === "in_progress" || s === "in progress")
    bgClass = "bg-blue-50 text-blue-700 border-blue-100";
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${bgClass}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

export default MunicipalDashboard;
