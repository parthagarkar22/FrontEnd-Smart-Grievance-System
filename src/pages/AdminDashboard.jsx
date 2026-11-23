import React, { useEffect, useState } from "react";
import {
  fetchAllComplaints,
  updateComplaintStatus,
  fetchAllFeedbacks,
  takeAdminAction,
} from "../services/grievanceService";
import API from "../services/api";
import GrievanceMap from "../components/GrievanceMap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AlertTicker from "../components/AlertTicker";
import autoTable from "jspdf-autotable"; // 🆕 Added for government style report
import { getMediaUrl } from "../config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid, // 🆕 Added for graph styling
} from "recharts";

// helper component
function StatBox({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-600 shadow-blue-200",
    amber: "bg-amber-500 shadow-amber-200",
    green: "bg-green-600 shadow-green-200",
    red: "bg-red-600 shadow-red-200",
  };
  return (
    <div
      className={`p-6 rounded-[2rem] shadow-xl text-white ${styles[color]} transform hover:scale-105 transition-all cursor-default relative overflow-hidden group`}
    >
      <span className="absolute -right-4 -bottom-4 text-7xl opacity-10 group-hover:scale-125 transition-transform">
        {icon}
      </span>
      <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">
        {title}
      </p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-4xl font-black">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("analytics");
  const [rejectFile, setRejectFile] = useState(null); // Rejection proof ke liye
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const [selectedImg, setSelectedImg] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  // States for Admin Actions
  const [resolvedFile, setResolvedFile] = useState(null);
  const [resNote, setResNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [activeDept, setActiveDept] = useState("All"); // 1. Default to All
  const departments = ["All", "Road", "Light", "Water", "Sewage", "Garbage"];

  // PDF Export States
  const [reportDept, setReportDept] = useState("All");
  const [reportDays, setReportDays] = useState("7");

  const getFullImgUrl = (path) => {
    if (!path)
      return "https://via.placeholder.com/800x600?text=No+Image+Available";
    return getMediaUrl(path);
  };

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

  const handleAdminAction = async (id, type) => {
    // 1. Ask reason from admin
    const reason = prompt(`Enter official reason for ${type}:`);

    // 2. Validation
    if (!reason || !reason.trim()) {
      alert("❌ Action aborted: Reason is required.");
      return;
    }

    try {
      // 3. ✅ FIXED API CALL (Correct format)
      const res = await takeAdminAction(id, {
        action_type: type, // 🔥 important change
        reason: reason.trim(),
      });

      // 4. Success handling
      alert(
        `✅ System Updated: ${
          res?.data?.message || "Action processed successfully"
        }`,
      );

      loadData();
      setViewDetails(null);
    } catch (error) {
      console.error("Action Error:", error);

      const serverError =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Action Failed";

      alert(`❌ Error: ${serverError}`);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Official Header Design
    doc.setFillColor(15, 42, 68); // Dark Navy Blue
    doc.rect(0, 0, pageWidth, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SMART MUNICIPAL CORPORATION", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("ADMINISTRATIVE REVENUE & GRIEVANCE DIVISION", pageWidth / 2, 28, {
      align: "center",
    });
    doc.text("OFFICIAL PERFORMANCE AUDIT REPORT", pageWidth / 2, 35, {
      align: "center",
    });

    // 2. Report Metadata
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("REPORT SUMMARY", 14, 55);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Department Scope: ${reportDept.toUpperCase()}`, 14, 62);
    doc.text(`Timeline: Last ${reportDays} Days`, 14, 67);
    doc.text(`Generated By: System Administrator`, 14, 72);
    doc.text(`Date: ${new Date().toLocaleString()}`, pageWidth - 14, 62, {
      align: "right",
    });

    // 3. Data Filtering Logic
    const filteredData = complaints.filter((c) => {
      const deptMatch =
        reportDept === "All" ||
        (Array.isArray(c.department)
          ? c.department.includes(reportDept)
          : c.department === reportDept);

      const complaintDate = new Date(c.created_at);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(reportDays));

      return deptMatch && complaintDate >= daysAgo;
    });

    // Table Structure
    const tableColumn = [
      "ID",
      "Citizen Name",
      "Department",
      "Priority",
      "Status",
      "Reported Date",
    ];
    const tableRows = filteredData.map((c) => [
      `#${c.id}`,
      c.citizen_name || "N/A",
      Array.isArray(c.department) ? c.department.join(", ") : c.department,
      c.priority,
      c.status.toUpperCase(),
      new Date(c.created_at).toLocaleDateString(),
    ]);

    // 4. Generate Professional Table
    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [15, 42, 68],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: { fontSize: 9, halign: "center" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 10 },
    });

    // 5. Official Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Official Seal & Signature", pageWidth - 60, finalY);

    doc.setDrawColor(15, 42, 68);
    doc.line(14, 280, pageWidth - 14, 280);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "This is a computer-generated document. No physical signature is required.",
      pageWidth / 2,
      285,
      { align: "center" },
    );

    // Save PDF
    doc.save(`Muni_Official_Report_${reportDept}_${new Date().getTime()}.pdf`);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    // 1. Double Check: Agar case pehle se finalized hai toh rok dein
    if (
      viewDetails.status === "resolved" ||
      viewDetails.status === "rejected"
    ) {
      return alert(
        `❌ Action Denied: This case is already ${viewDetails.status}.`,
      );
    }

    // 2. Rejection Validation (Wahi logic jo aapne diya hai)
    if (newStatus === "rejected") {
      if (!rejectReason) return alert("Please provide a reason for rejection.");
      if (!rejectFile)
        return alert("Please upload an image as rejection proof.");
    }

    const formData = new FormData();
    formData.append("status", newStatus);

    // 3. Data Mapping: As per your Postman/Backend requirements
    if (newStatus === "rejected") {
      formData.append("rejection_reason", rejectReason);
      formData.append("rejection_proof", rejectFile);
    } else if (newStatus === "resolved") {
      // Agar Admin directly resolve kar raha hai
      formData.append(
        "resolution_note",
        resNote || "Work completed and verified by Admin.",
      );
      if (resolvedFile) formData.append("after_image", resolvedFile);
    } else {
      formData.append("resolution_note", "Updated by Admin System");
    }

    try {
      setIsSubmitting(true);

      // 🚀 API Call: Admin Path
      await API.patch(`grievances/admin/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`✅ Success: Case #${id} marked as ${newStatus.replace("_", " ")}`);

      // 4. UI Reset
      loadData();
      setViewDetails(null);
      setRejectReason("");
      setRejectFile(null);
      setResolvedFile(null); // Clear resolved image too
    } catch (error) {
      console.error("Critical Update Error:", error.response?.data);
      const errorMsg =
        error.response?.data?.rejection_reason?.[0] ||
        error.response?.data?.after_image?.[0] ||
        error.response?.data?.detail ||
        "Update failed due to server constraints.";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveWithPhoto = async (id) => {
    if (!resolvedFile || !resNote)
      return alert("Upload After Image & add Note!");
    const formData = new FormData();
    formData.append("status", "resolved");
    formData.append("after_image", resolvedFile);
    formData.append("resolution_note", resNote);

    try {
      await API.patch(`grievances/admin/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("System: Grievance Resolved with Proof!");
      loadData();
      setViewDetails(null);
      setResolvedFile(null);
      setResNote("");
    } catch (error) {
      alert("Resolution upload failed.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "PERMANENT DELETE: Are you sure you want to remove this record?",
      )
    )
      return;

    try {
      await API.delete(`grievances/admin/${id}/`);
      alert("System: Grievance record deleted successfully.");
      loadData();
      setViewDetails(null);
    } catch (error) {
      console.error("Delete Error:", error.response?.data);
      alert(`Delete Failed: ${error.response?.data?.detail || "Error"}`);
    }
  };

  // ---------------- 📊 AI-OPTIMIZED ANALYTICS LOGIC ----------------
  const getActiveDeptStats = () => {
    const statsArr = [
      { name: "Pending", count: 0, color: "#2563eb" },
      { name: "In Progress", count: 0, color: "#f59e0b" },
      { name: "Resolved", count: 0, color: "#10b981" },
      { name: "Rejected", count: 0, color: "#ef4444" },
    ];

    const uniqueComplaints = complaints.filter(
      (c) => c.is_duplicate === false || c.parent_id === null,
    );

    uniqueComplaints.forEach((c) => {
      const depts = Array.isArray(c.department) ? c.department : [c.department];
      if (
        activeDept === "All" ||
        depts.some((d) => d?.toLowerCase() === activeDept.toLowerCase())
      ) {
        const s = c.status?.toLowerCase().replace(" ", "_");
        if (s === "pending") statsArr[0].count++;
        else if (s === "in_progress") statsArr[1].count++;
        else if (s === "resolved") statsArr[2].count++;
        else if (s === "rejected") statsArr[3].count++;
      }
    });
    return statsArr;
  };

  // ---------------- ✨ AI-OPTIMIZED FILTERING ----------------
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus =
      filter === "All" ||
      c.status?.toLowerCase().replace(" ", "_") === filter.toLowerCase();
    const searchableDepts = Array.isArray(c.department)
      ? c.department.join(" ")
      : c.department || "";

    const matchesSearch =
      (c.citizen_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery) ||
      searchQuery === "" ||
      searchableDepts.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const displayComplaints = filteredComplaints.filter((c) => {
    return c.is_duplicate === false || c.parent_id === null;
  });

  if (loading)
    return (
      <div className="p-20 text-center font-black text-blue-600 animate-pulse text-xl uppercase">
        Initializing Secure Terminal...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <div className="space-y-8 p-6 relative max-w-[1600px] mx-auto pb-32">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
            SUPER ADMIN <span className="text-blue-600">DASHBOARD</span>
          </h1>
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveView("analytics")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === "analytics" ? "bg-white shadow-md text-blue-600" : "text-slate-500"}`}
            >
              📊 Stats
            </button>
            <button
              onClick={() => setActiveView("heatmap")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === "heatmap" ? "bg-white shadow-md text-blue-600" : "text-slate-500"}`}
            >
              🌍 Heatmap
            </button>
          </div>
        </div>

        <AlertTicker complaints={complaints} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatBox
            title="Total Records"
            value={complaints.length}
            icon="📊"
            color="blue"
          />
          <StatBox
            title="Needs Action"
            value={
              complaints.filter((c) =>
                ["pending", "in_progress"].includes(
                  c.status?.toLowerCase().replace(" ", "_"),
                ),
              ).length
            }
            icon="⏳"
            color="amber"
          />
          <StatBox
            title="Closed Cases"
            value={
              complaints.filter((c) => c.status?.toLowerCase() === "resolved")
                .length
            }
            icon="✅"
            color="green"
          />
          <StatBox
            title="Rejected"
            value={
              complaints.filter((c) => c.status?.toLowerCase() === "rejected")
                .length
            }
            icon="🚫"
            color="red"
          />
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-slate-200/40 min-h-[550px] transition-all duration-500">
          {activeView === "analytics" ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-50 pb-8">
                <div>
                  <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                    <span className="p-1.5 bg-blue-50 rounded-lg">📈</span>{" "}
                    Strategic Analysis
                  </h2>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">
                    {activeDept}{" "}
                    <span className="text-slate-400">Division Insight</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setActiveDept(dept)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${activeDept === dept ? "bg-white text-blue-600 shadow-md transform scale-105" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div
                id="admin-report-area"
                className="relative"
                style={{ width: "100%", height: "400px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getActiveDeptStats()}
                    margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="10 10"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      fontSize={11}
                      fontWeight="900"
                      tick={{ fill: "#94A3B8" }}
                      dy={15}
                    />
                    <YAxis hide domain={[0, "dataMax + 5"]} />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC", radius: 20 }}
                      contentStyle={{
                        borderRadius: "20px",
                        border: "none",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        padding: "15px 20px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[20, 20, 20, 20]}
                      barSize={65}
                      animationDuration={1500}
                    >
                      {getActiveDeptStats().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={0.9}
                        />
                      ))}
                      <LabelList
                        dataKey="count"
                        position="top"
                        style={{
                          fill: "#1E293B",
                          fontWeight: "900",
                          fontSize: "16px",
                        }}
                        offset={15}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <GrievanceMap
                complaints={complaints}
                onMarkerClick={(c) => setViewDetails(c)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 mb-6">
          <div className="relative flex-1 group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              🔍
            </span>
            <input
              type="text"
              placeholder="Instant Search..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent text-sm font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 ring-blue-50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-6 py-2 rounded-2xl border-2 border-transparent focus-within:border-blue-500 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Status:
            </span>
            <select
              className="bg-transparent py-2 text-[11px] font-black uppercase outline-none cursor-pointer text-slate-700 min-w-[150px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Global (All Records)</option>
              <option value="pending">🕒 Pending</option>
              <option value="in_progress">🏗️ In Progress</option>
              <option value="resolved">✅ Resolved</option>
              <option value="rejected">🚫 Rejected</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-4 rounded-[1.5rem] shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] border border-blue-400/20 relative overflow-hidden">
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-black uppercase text-blue-100/70 tracking-[0.2em]">
                Database Match
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-baseline gap-1">
                {filteredComplaints.length}{" "}
                <span className="text-[10px] font-bold text-blue-200/80">
                  Entries
                </span>
              </p>
            </div>
            <div className="ml-2 p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${filteredComplaints.length > 0 ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-slate-400"}`}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-8 py-6">Complaint ID</th>
                <th className="px-8 py-6">Reporting Citizen</th>
                <th className="px-8 py-6">Sectors</th>
                <th className="px-8 py-6 text-center">Severity</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayComplaints.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setViewDetails(c)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-all group"
                >
                  <td className="px-8 py-6 font-mono font-black text-slate-900 text-sm">
                    #{c.id}
                  </td>
                  <td className="px-8 py-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      {(c.citizen_name || "U")[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800 leading-none">
                          {c.citizen_name}
                        </p>
                        {c.total_reports > 1 && (
                          <div className="flex items-center gap-1 bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-lg border border-orange-100 animate-pulse">
                            <span>🔥</span>{" "}
                            <span>{c.total_reports} REPORTS</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                        {c.total_reports > 1
                          ? "Merged Intelligence"
                          : "Single Report"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-1 flex-wrap">
                      {(Array.isArray(c.department)
                        ? c.department
                        : [c.department]
                      ).map((d, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border-2 transition-all shadow-sm ${
                        {
                          critical:
                            "bg-red-600 text-white border-red-700 shadow-red-300/60 animate-pulse",
                          high: "bg-orange-500 text-white border-orange-600 shadow-orange-300/50",
                          medium:
                            "bg-blue-600 text-white border-blue-700 shadow-blue-200/50",
                          low: "bg-gray-500 text-white border-gray-600 shadow-gray-300/40",
                        }[c.priority?.toLowerCase()] ||
                        "bg-gray-400 text-white border-gray-500"
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border-2 transition-all shadow-sm ${
                        {
                          pending:
                            "bg-blue-600 text-white border-blue-700 shadow-blue-200/50",
                          in_progress:
                            "bg-yellow-500 text-white border-yellow-600 shadow-yellow-300/60 animate-pulse",
                          resolved:
                            "bg-green-600 text-white border-green-700 shadow-green-200/50",
                          rejected:
                            "bg-red-600 text-white border-red-700 shadow-red-200/50",
                          escalated:
                            "bg-purple-600 text-white border-purple-700 shadow-purple-200/50",
                        }[c.status?.toLowerCase().replace(" ", "_")] ||
                        "bg-gray-400 text-white border-gray-500"
                      }`}
                    >
                      {c.status?.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-black uppercase italic">
              Administrative Report Center
            </h3>
            <p className="text-blue-100 text-sm font-medium">
              Export categorized grievances for official auditing.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 bg-white/10 p-3 rounded-3xl backdrop-blur-md">
            <select
              className="bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-bold outline-none"
              value={reportDept}
              onChange={(e) => setReportDept(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d} Dept
                </option>
              ))}
            </select>
            <select
              className="bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-bold outline-none"
              value={reportDays}
              onChange={(e) => setReportDays(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days (1 Month)</option>
            </select>
            <button
              onClick={generatePDFReport}
              className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-yellow-300 transition-all"
            >
              Download PDF
            </button>
          </div>
        </div>

        {viewDetails && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
            {/* Clean Dark Backdrop (No Blur as requested) */}
            <div
              className="absolute inset-0 bg-slate-500/10 backdrop-blur-[2px] animate-in fade-in duration-300 cursor-pointer"
              onClick={() => setViewDetails(null)}
            />

            {/* Main Popup Container */}
            <div className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col mx-4 border border-white/20">
              {/* 🟢 Header Section */}
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Case Intelligence Center
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Complaint Reference: #{viewDetails.id}
                  </p>
                </div>
                <button
                  onClick={() => setViewDetails(null)}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-red-500 text-2xl transition-all flex items-center justify-center active:scale-90"
                >
                  ×
                </button>
              </div>

              {/* 🔵 Scrollable Content Area */}
              <div className="p-8 lg:p-10 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  {/* Left Side: Actions & Descriptions (Col span 3) */}
                  <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Issue Description
                      </label>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        "{viewDetails.description}"
                      </p>
                    </div>

                    {/* 🛡️ Administrative Intelligence Actions - Hidden if Resolved/Rejected */}
                    {viewDetails.status !== "resolved" &&
                      viewDetails.status !== "rejected" && (
                        <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200">
                          <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <span>🛡️</span> Administrative Intelligence
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {viewDetails.status?.toLowerCase() ===
                              "escalated" && (
                              <button
                                onClick={() =>
                                  handleAdminAction(viewDetails.id, "REASSIGN")
                                }
                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                              >
                                🔄 Reassign Officer
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleAdminAction(viewDetails.id, "WARNING")
                              }
                              className="bg-orange-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                            >
                              ⚠️ Issue Warning
                            </button>
                            <button
                              onClick={() => handleDelete(viewDetails.id)}
                              className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                            >
                              Terminate Record
                            </button>
                          </div>
                        </div>
                      )}

                    {/* ⚡ Rapid Operations Section - Hidden if Resolved/Rejected */}
                    {viewDetails.status !== "resolved" &&
                      viewDetails.status !== "rejected" && (
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-2">
                            <span>⚡</span> Rapid Operations
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  viewDetails.id,
                                  "in_progress",
                                )
                              }
                              className="bg-yellow-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-yellow-600 hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-300/50 active:scale-95"
                            >
                              ⚡ Mark In Progress
                            </button>
                          </div>
                        </div>
                      )}

                    {/* 🚀 Dual Action Grid: Resolve & Reject (Logic Updated) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 1. Resolve Section - Hide if status is rejected OR already resolved */}
                      {viewDetails.status !== "rejected" &&
                        viewDetails.status !== "resolved" && (
                          <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4 shadow-sm">
                            <h4 className="text-[11px] font-black text-emerald-700 uppercase">
                              Resolve Case
                            </h4>
                            <input
                              type="file"
                              className="text-[9px] block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-emerald-600 file:text-white"
                              onChange={(e) =>
                                setResolvedFile(e.target.files[0])
                              }
                            />
                            <textarea
                              placeholder="Resolution final note..."
                              className="w-full p-4 text-xs rounded-2xl h-20 outline-none border border-emerald-100 shadow-sm focus:ring-2 ring-emerald-200"
                              onChange={(e) => setResNote(e.target.value)}
                            />
                            <button
                              onClick={() =>
                                handleResolveWithPhoto(viewDetails.id)
                              }
                              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 shadow-lg transition-all"
                            >
                              Submit Resolution
                            </button>
                          </div>
                        )}

                      {/* 2. Reject Section - Hide if status is resolved OR already rejected */}
                      {viewDetails.status !== "resolved" &&
                        viewDetails.status !== "rejected" && (
                          <div className="p-6 bg-red-50 rounded-[2.5rem] border border-red-100 space-y-4 shadow-sm">
                            <h4 className="text-[11px] font-black text-red-700 uppercase">
                              Reject Request
                            </h4>
                            <div className="space-y-1">
                              <input
                                type="file"
                                accept="image/*"
                                className="text-[9px] block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-red-600 file:text-white"
                                onChange={(e) =>
                                  setRejectFile(e.target.files[0])
                                }
                              />
                              {rejectFile && (
                                <p className="text-[8px] text-green-600 font-bold mt-1 ml-2">
                                  ✅ {rejectFile.name} ready
                                </p>
                              )}
                            </div>
                            <textarea
                              placeholder="Reason for rejection..."
                              className="w-full p-4 text-xs rounded-2xl h-20 outline-none border border-red-100 shadow-sm focus:ring-2 ring-red-200"
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <button
                              onClick={() =>
                                handleUpdateStatus(viewDetails.id, "rejected")
                              }
                              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-700 shadow-lg transition-all disabled:bg-slate-300"
                              disabled={!rejectReason || !rejectFile}
                            >
                              Confirm Denial
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Finalized Status Message - Appears when Case is Closed */}
                    {(viewDetails.status === "resolved" ||
                      viewDetails.status === "rejected") && (
                      <div
                        className={`p-6 rounded-[2rem] border text-center font-black uppercase tracking-widest ${viewDetails.status === "resolved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}`}
                      >
                        Case is {viewDetails.status}
                        <p className="text-[9px] normal-case font-medium mt-1 opacity-70">
                          This record is locked for further modifications.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Visual Evidence & Map Link (Col span 2) */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                        Primary Citizen Evidence
                      </label>
                      <div className="w-full aspect-square rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-100 relative group">
                        <img
                          src={getFullImgUrl(viewDetails.image)}
                          className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-700"
                          alt="Incident"
                          onClick={() =>
                            setSelectedImg(getFullImgUrl(viewDetails.image))
                          }
                        />
                      </div>
                    </div>
                    <a
                      href={viewDetails.formatted_address}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full bg-slate-900 text-white p-5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95"
                    >
                      📍 Synchronize Location Data
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedImg && (
          <div
            className="fixed inset-0 bg-slate-950/95 z-[9999] flex items-center justify-center p-10 cursor-zoom-out animate-in fade-in duration-300"
            onClick={() => setSelectedImg(null)}
          >
            <img
              src={selectedImg}
              className="max-w-full max-h-[90vh] rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 object-contain border-8 border-white/5"
              alt="High Res Proof"
            />
          </div>
        )}
      </div>
    </div>
  );
}
