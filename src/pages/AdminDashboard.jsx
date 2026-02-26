import React, { useEffect, useState } from "react";
import {
  fetchAllComplaints,
  updateComplaintStatus,
  fetchAllFeedbacks,
} from "../services/grievanceService";
import API from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortByStatus, setSortByStatus] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ १. इमेज स्टेट डॅशबोर्ड फंक्शनच्या आत हलवली
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [complaintsData, feedbacksData] = await Promise.all([
        fetchAllComplaints(),
        fetchAllFeedbacks(),
      ]);
      setComplaints(complaintsData || []);
      setFeedbacks(feedbacksData || []);
    } catch (error) {
      console.error("Admin data error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      let statusToBackend = newStatus.toLowerCase();
      if (statusToBackend === "in progress") statusToBackend = "in_progress";
      await updateComplaintStatus(id, statusToBackend);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: statusToBackend } : c)),
      );
    } catch (error) {
      alert("Status update failed. Complaint might be already resolved.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await API.delete(`grievances/admin/${id}/`);
        setComplaints((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        alert("Delete failed.");
      }
    }
  };

  const stats = {
    total: complaints.length,
    awaiting: complaints.filter((c) =>
      ["pending", "assigned", "in_progress", "escalated"].includes(
        c.status?.toLowerCase(),
      ),
    ).length,
    resolved: complaints.filter((c) => c.status?.toLowerCase() === "resolved")
      .length,
    rejected: complaints.filter((c) => c.status?.toLowerCase() === "rejected")
      .length,
  };

  const getDeptStats = () => {
    const deptMap = {};
    const officialDepts = ["Light", "Road", "Sewage", "Water", "Garbage"];
    officialDepts.forEach((d) => (deptMap[d] = 0));
    complaints.forEach((c) => {
      if (officialDepts.includes(c.department)) {
        deptMap[c.department] += 1;
      }
    });
    return Object.keys(deptMap).map((key) => ({
      name: key,
      count: deptMap[key],
    }));
  };

  const filteredComplaints = complaints
    .filter((c) => {
      const matchesFilter =
        filter === "All" || c.status?.toLowerCase() === filter.toLowerCase();
      const displayName = c.citizen_name || c.username || `User #${c.user}`;
      return (
        matchesFilter &&
        (displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toString().includes(searchQuery))
      );
    })
    .sort((a, b) => {
      if (sortByStatus !== "None") {
        if (a.status === sortByStatus && b.status !== sortByStatus) return -1;
        if (a.status !== sortByStatus && b.status === sortByStatus) return 1;
      }
      const weight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    });

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-blue-600 animate-pulse text-xl">
        Syncing Admin Records...
      </div>
    );

  return (
    <div className="space-y-10 p-6 bg-[#F8FAFC] min-h-screen font-sans relative">
      <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
        SUPER ADMIN DASHBOARD
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatBox
          title="Total Reports"
          value={stats.total}
          icon="📊"
          color="blue"
        />
        <StatBox
          title="Active Tasks"
          value={stats.awaiting}
          icon="⏳"
          color="amber"
        />
        <StatBox
          title="Resolved"
          value={stats.resolved}
          icon="✅"
          color="green"
        />
        <StatBox
          title="Rejected"
          value={stats.rejected}
          icon="🚫"
          color="red"
        />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span>📈</span> Department Performance Overview
        </h2>
        <div style={{ width: "100%", height: "350px", minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getDeptStats()}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={12}
                fontWeight="bold"
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  borderRadius: "15px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                {getDeptStats().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ["#2563eb", "#f59e0b", "#10b981", "#ef4444"][index % 4]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>📝</span> Reports Management
          </h2>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input
              placeholder="Search Citizen or ID..."
              className="border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="border rounded-xl text-sm px-3 py-2 font-bold bg-white outline-none shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Filter: All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-5">ID</th>
                  <th className="px-6 py-5">Citizen & Location</th>
                  <th className="px-6 py-5">Image</th>
                  <th className="px-6 py-5">Department</th>
                  <th className="px-6 py-5 text-center">Priority</th>
                  <th className="p-5">Description</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5">Manage</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredComplaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/10 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-gray-400 text-xs">
                      #{c.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">
                        {c.citizen_name || c.username}
                      </p>
                      <a
                        href={c.formatted_address}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-emerald-600 font-black hover:underline uppercase"
                      >
                        📍 Open Map
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {c.image ? (
                        <img
                          
                          src={
                            c.image.startsWith("http")
                              ? c.image
                              : `http://127.0.0.1:8000${c.image}`
                          }
                          alt="Evidence"
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 border border-gray-200"
                          onClick={() =>
                            setSelectedImg(
                              c.image.startsWith("http")
                                ? c.image
                                : `http://127.0.0.1:8000${c.image}`,
                            )
                          }
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150?text=Error";
                          }} 
                        />
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">
                          No Image
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase border border-blue-100">
                        {c.department || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${c.priority === "CRITICAL" || c.priority === "HIGH" ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td
                      className="p-5 text-gray-600 text-xs max-w-xs truncate"
                      title={c.description}
                    >
                      {c.description || "No details provided"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${c.status?.includes("resolved") ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
                      >
                        {c.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        disabled={c.status === "resolved"}
                        value={
                          c.status === "in_progress" ? "in_progress" : c.status
                        }
                        onChange={(e) =>
                          handleStatusUpdate(c.id, e.target.value)
                        }
                        className="text-[11px] font-bold border rounded-lg p-1.5 bg-white outline-none disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                        <option value="escalated">Escalated</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-300 hover:text-red-600 transition"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-gray-200">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
          <span>⭐</span> Citizen Feedbacks
        </h2>
        {feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-[10px] font-black rounded-bl-xl">
                  {f.rating} / 5 ⭐
                </div>
                <div className="mb-4">
                  <p className="text-[10px] font-black text-blue-500 uppercase mb-1">
                    ID: #{f.grievance}
                  </p>
                  <p className="text-sm text-gray-700 font-medium italic">
                    "{f.comment || "No comments."}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {f.officer_name?.charAt(0) || "O"}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase leading-none">
                      Resolved By
                    </p>
                    <p className="text-xs font-bold text-gray-800">
                      {f.officer_name || `Officer ID: ${f.officer}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center opacity-40">
            No feedback received.
          </div>
        )}
      </div>

      {/* ✅ २. इमेज ओव्हरले (Modal) - हा मुख्य return च्या शेवटी हलवला */}
      {selectedImg && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-10 backdrop-blur-md cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-10 right-10 text-white text-4xl font-black">
            ×
          </button>
          <img
            src={selectedImg}
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in duration-300 object-contain"
            alt="Full View"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ✅ ३. StatBox कॉम्पोनंटला बाहेर काढले आणि क्लीन केले
function StatBox({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-600",
    amber: "bg-amber-500",
    green: "bg-green-600",
    red: "bg-red-600",
  };
  return (
    <div
      className={`p-6 rounded-3xl shadow-lg text-white ${styles[color]} transform hover:scale-105 transition-all`}
    >
      <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">
        {title}
      </p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-4xl font-black">{value}</p>
        <span className="text-2xl opacity-40">{icon}</span>
      </div>
    </div>
  );
}
