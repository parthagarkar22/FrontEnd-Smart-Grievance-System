import React, { useEffect, useState, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  fetchMunicipalData,
  updateComplaintStatus,
} from "../services/grievanceService";
import API from "../services/api";
import GrievanceMap from "../components/GrievanceMap"; // Added Map Component
import { getMediaUrl } from "../config";

const MunicipalDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeView, setActiveView] = useState("list"); // 'list' or 'map'

  // ✨ Resolution & Rejection States
  const [afterImage, setAfterImage] = useState(null);
  const [resNote, setResNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectFile, setRejectFile] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMunicipalData();
      setComplaints(data.complaints || []);
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error("Error fetching officer data", err);
    } finally {
      setLoading(false);
    }
  };

  // ✨ FIXED Helper: Handle nested image paths properly
  const getFullImgUrl = (path) => {
    if (!path)
      return "https://via.placeholder.com/800x600?text=No+Image+Available";
    return getMediaUrl(path);
  };

  // ✅ Status-wise Filtering Logic
  const filteredComplaints = useMemo(() => {
    let filtered = complaints;
    if (statusFilter !== "All") {
      filtered = complaints.filter(
        (c) => c.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    return filtered.sort((a, b) => {
      const weight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    });
  }, [complaints, statusFilter]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) =>
      ["pending", "in_progress"].includes(c.status?.toLowerCase()),
    ).length,
    resolved: complaints.filter((c) => c.status?.toLowerCase() === "resolved")
      .length,
    rejected: complaints.filter((c) => c.status?.toLowerCase() === "rejected")
      .length,
  };

  // ✨ Unified Update Logic (Supports Resolve & Reject with Proof)
  // ✨ Unified Update Logic (Supports Resolve & Reject with Proof)
  const handleUpdateAction = async (complaintId, targetStatus) => {
    const formData = new FormData();
    formData.append("status", targetStatus);

    if (targetStatus === "resolved") {
      if (!afterImage || !resNote) {
        alert("Upload Work Image & Resolution Note!");
        return;
      }
      formData.append("after_image", afterImage);
      formData.append("resolution_note", resNote);
    }

    if (targetStatus === "rejected") {
      if (!rejectReason || !rejectFile) {
        alert("Provide Rejection Reason & Proof Image!");
        return;
      }
      formData.append("rejection_reason", rejectReason);
      formData.append("rejection_proof", rejectFile);
    }

    try {
      const res = await API.patch(
        `grievances/officer/${complaintId}/`,
        formData,
        // ❌ REMOVED HEADERS (IMPORTANT FIX)
      );

      console.log("🔥 API RESPONSE:", res.data);

      // 🔥 Update modal instantly
      setViewDetails(res.data);

      // 🔥 Refresh list
      setTimeout(() => {
        loadData();
      }, 300);

      // 🔥 Reset states
      setAfterImage(null);
      setRejectFile(null);
      setResNote("");
      setRejectReason("");

      alert(`✅ Case marked as ${targetStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Action Failed:", err.response?.data);
      alert("Submission failed. Check backend.");
    }
  };

  // 🚀 FIXED: handleStatusChange now avoids 400 error by passing necessary empty fields
  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "rejected" || newStatus === "resolved") return;
    try {
      let statusToBackend = newStatus.toLowerCase().replace(" ", "_");

      // Sending empty strings for notes to satisfy strict backend serializers
      const payload = {
        status: statusToBackend,
        resolution_note: "",
        rejection_reason: "",
      };

      await API.patch(`grievances/officer/${id}/`, payload);
      loadData();
      alert(`✅ Status updated to ${newStatus.toUpperCase()}`);
      if (viewDetails?.id === id)
        setViewDetails({ ...viewDetails, status: statusToBackend });
    } catch (err) {
      console.error("Status sync failed:", err.response?.data);
      alert("Status sync failed. Check server console.");
    }
  };

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
          feedbacks.length
        ).toFixed(1)
      : "5.0";

  if (loading)
    return (
      <div className="p-20 text-center text-blue-600 font-black animate-pulse text-xl tracking-widest uppercase">
        SECURE SYNC: {user?.department} TERMINAL...
      </div>
    );

  return (
    <div className="space-y-10 p-6 font-sans bg-[#F8FAFC] min-h-screen relative">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">
            {user?.department}{" "}
            <span className="text-blue-600">OFFICER HUB</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">
            Identity: {user?.first_name || user?.username} | Unit: Municipal
            Division
          </p>
        </div>

        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveView("list")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === "list" ? "bg-white shadow-md text-blue-600" : "text-slate-500"}`}
          >
            📑 Tasks
          </button>
          <button
            onClick={() => setActiveView("map")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === "map" ? "bg-white shadow-md text-blue-600" : "text-slate-500"}`}
          >
            🌍 View Map
          </button>
        </div>

        <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl text-center shadow-2xl">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">
            Performance Index
          </p>
          <p className="text-3xl font-black text-blue-400">{avgRating} ★</p>
        </div>
      </div>

      {activeView === "map" ? (
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 h-[600px] animate-in fade-in zoom-in-95 duration-500">
          <GrievanceMap
            complaints={complaints}
            onMarkerClick={(c) => {
              setViewDetails(c);
              setActiveView("list");
            }}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Workload"
              value={stats.total}
              color="bg-blue-600"
              icon="📂"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              color="bg-yellow-600"
              icon="⏳"
            />
            <StatCard
              title="Completed"
              value={stats.resolved}
              color="bg-emerald-500"
              icon="✅"
            />
            <StatCard
              title="Rejected"
              value={stats.rejected}
              color="bg-red-600"
              icon="🚫"
            />
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Operational Task List
              </h2>
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                {["All", "Pending", "In_Progress", "Resolved", "Rejected"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === status ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-6">Complaint ID</th>
                    <th className="px-8 py-6">Details</th>
                    <th className="px-8 py-6 text-center">Priority</th>
                    <th className="px-8 py-6 text-center">Status</th>
                    <th className="px-8 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setViewDetails(c)}
                      className="group hover:bg-blue-50/40 cursor-pointer transition-all"
                    >
                      <td className="px-8 py-6 font-mono font-black text-slate-900 text-sm">
                        #{c.id}
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800 text-sm truncate max-w-[250px]">
                          {c.description}
                        </p>
                        <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">
                          📍 Geo-Tagged Incident
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${c.priority === "CRITICAL" ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100"}`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-8 py-6 text-right font-black text-blue-400 group-hover:text-blue-600 text-[10px] uppercase">
                        Review Case →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-auto">
          {/* ✨ Clean Light Backdrop */}
          <div
            className="absolute inset-0 bg-gray-200/30 animate-in fade-in duration-300 cursor-pointer"
            onClick={() => setViewDetails(null)}
          />
          {/* ✨ Main Modal Container */}
          <div className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col mx-4 border border-white/20">
            {/* 🟢 Header Section */}
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                  Grievance Authority Terminal
                </p>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  CASE REFERENCE: #{viewDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setViewDetails(null)}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-red-500 text-2xl transition-all flex items-center justify-center active:scale-90"
              >
                ×
              </button>
            </div>

            {/* 🔵 Scrollable Content Area */}
            <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column: Descriptions & Actions */}
                <div className="space-y-8">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-widest">
                      Citizen Description
                    </label>
                    <p className="text-sm text-slate-600 leading-relaxed bg-white p-6 rounded-3xl border border-slate-100 italic shadow-sm">
                      "{viewDetails.description}"
                    </p>
                  </div>

                  {/* 🚀 ACTION LOGIC: Mutual Exclusion (Only show if NOT finalized) */}
                  {viewDetails.status !== "resolved" &&
                    viewDetails.status !== "rejected" && (
                      <div className="space-y-6">
                        {/* 1. Resolve Work Section (Hide if Rejected) */}
                        {viewDetails.status !== "rejected" && (
                          <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-6 shadow-inner">
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                              📸 Submit Resolution Proof (After Image)
                            </h4>
                            <input
                              type="file"
                              onChange={(e) => setAfterImage(e.target.files[0])}
                              className="text-[10px] block w-full file:bg-emerald-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-full file:font-black file:cursor-pointer"
                            />
                            <textarea
                              placeholder="Technical summary of work done..."
                              className="w-full p-4 text-sm rounded-2xl outline-none shadow-sm h-24 border border-emerald-100 focus:ring-2 ring-emerald-200"
                              onChange={(e) => setResNote(e.target.value)}
                            />
                            <button
                              onClick={() =>
                                handleUpdateAction(viewDetails.id, "resolved")
                              }
                              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                            >
                              Submit Resolution Proof
                            </button>
                          </div>
                        )}

                        {/* 2. Reject Section (Hide if Resolved) */}
                        {viewDetails.status !== "resolved" && (
                          <div className="p-8 bg-red-50 rounded-[3rem] border border-red-100 space-y-6 shadow-inner">
                            <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest">
                              🚫 Reject Request with Proof
                            </h4>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setRejectFile(e.target.files[0])}
                              className="text-[10px] block w-full file:bg-red-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-full file:font-black file:cursor-pointer"
                            />
                            <textarea
                              placeholder="Official reason for rejection..."
                              className="w-full p-4 text-sm rounded-2xl outline-none shadow-sm h-20 border border-red-100 focus:ring-2 ring-red-200"
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <button
                              onClick={() =>
                                handleUpdateAction(viewDetails.id, "rejected")
                              }
                              className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                              disabled={!rejectReason || !rejectFile}
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Display Authority Remarks if Finalized */}
                  {(viewDetails.status === "resolved" ||
                    viewDetails.status === "rejected") && (
                    <div
                      className={`p-6 rounded-[2rem] border ${viewDetails.status === "resolved" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"}`}
                    >
                      <label className="text-[10px] font-black uppercase block mb-2 tracking-widest opacity-60">
                        Authority Final Remarks
                      </label>
                      <p className="text-sm italic font-medium leading-relaxed">
                        "
                        {viewDetails.resolution_note ||
                          viewDetails.rejection_reason ||
                          "Case finalized by Municipal Authority."}
                        "
                      </p>
                    </div>
                  )}

                  {/* Intermediate Status Update */}
                  {viewDetails.status !== "resolved" &&
                    viewDetails.status !== "rejected" && (
                      <div className="pt-4 border-t border-slate-200/60">
                        <button
                          onClick={() =>
                            handleStatusChange(viewDetails.id, "in_progress")
                          }
                          className="w-full bg-white border-2 border-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all"
                        >
                          🏗️ Mark Task In Progress
                        </button>
                      </div>
                    )}
                </div>

                {/* Right Column: Visual Evidence Analysis (BEFORE & AFTER) */}
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                    Visual Evidence Verification
                  </label>
                  <div className="space-y-6">
                    {/* BEFORE IMAGE */}
                    <div className="relative group">
                      <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase shadow-lg">
                        BEFORE (Original Report)
                      </span>
                      <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100 group-hover:scale-[1.02] transition-transform duration-500">
                        <img
                          src={getFullImgUrl(viewDetails.image)}
                          className="w-full h-full object-cover cursor-zoom-in"
                          alt="Initial report"
                          onClick={() =>
                            setSelectedImg(getFullImgUrl(viewDetails.image))
                          }
                        />
                      </div>
                    </div>

                    {/* AFTER IMAGE / REJECTION PROOF */}
                    {(viewDetails.after_image ||
                      viewDetails.rejection_proof) && (
                      <div className="relative group animate-in slide-in-from-bottom-4 duration-500">
                        <span
                          className={`absolute top-4 left-4 z-10 text-white text-[8px] font-black px-2 py-1 rounded uppercase shadow-lg ${
                            viewDetails.status === "resolved"
                              ? "bg-emerald-600"
                              : "bg-red-600"
                          }`}
                        >
                          {viewDetails.status === "resolved"
                            ? "AFTER (Work Proof)"
                            : "OFFICIAL REJECTION PROOF"}
                        </span>
                        <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100 group-hover:scale-[1.02] transition-transform duration-500">
                          <img
                            key={
                              viewDetails.after_image ||
                              viewDetails.rejection_proof
                            }
                            src={getFullImgUrl(
                              viewDetails.after_image ||
                                viewDetails.rejection_proof,
                            )}
                            className="w-full h-full object-cover cursor-zoom-in"
                            alt="Authority proof"
                            // Double check on load error
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x300?text=Processing+Image...";
                            }}
                            onClick={() =>
                              setSelectedImg(
                                getFullImgUrl(
                                  viewDetails.after_image ||
                                    viewDetails.rejection_proof,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <a
                    href={viewDetails.formatted_address}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-slate-900 text-white p-5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95"
                  >
                    📍 GPS Intelligence View
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedImg && (
        <div
          className="fixed inset-0 bg-slate-950/95 z-[9999] flex items-center justify-center p-10 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <img
            src={selectedImg}
            className="max-w-full max-h-[90vh] rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 object-contain border-8 border-white/5"
            alt="Evidence"
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div
    className={`${color} text-white p-8 rounded-[2.5rem] shadow-2xl transform hover:scale-105 transition-all relative overflow-hidden group`}
  >
    <span className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:scale-150 transition-transform">
      {icon}
    </span>
    <h3 className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em]">
      {title}
    </h3>
    <p className="text-5xl font-black mt-2 tracking-tighter">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  let bg = "bg-amber-50 text-amber-600 border-amber-100";
  if (s === "resolved")
    bg = "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (s === "rejected") bg = "bg-red-50 text-red-600 border-red-100";
  if (s === "in_progress" || s === "in progress")
    bg = "bg-blue-50 text-blue-600 border-blue-100 animate-pulse";
  return (
    <span
      className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border-2 ${bg}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

export default MunicipalDashboard;
