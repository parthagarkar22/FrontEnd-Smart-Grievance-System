import { useEffect, useState } from "react";
import { fetchUserComplaints } from "../services/grievanceService";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import SocialShare from "../components/SocialShare"; // Professional Integration
import { getMediaUrl } from "../config";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();

  // ✨ Helper to handle nested image paths from backend
  const getFullImgUrl = (path) => getMediaUrl(path);

  // ✨ Advanced Helper: Image URL to Base64 for PDF
  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  // ✨ Professional PDF Generation Function
  const generateReceipt = async (complaint) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      doc.setFillColor(15, 42, 68); // Your theme color #0F2A44
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("SMART MUNICIPAL CORPORATION", pageWidth / 2, 20, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Official Resolution Completion Certificate",
        pageWidth / 2,
        28,
        { align: "center" },
      );

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(`Receipt ID: SMC-RES-${complaint.id}`, 20, 55);
      doc.text(
        `Generated On: ${new Date().toLocaleDateString()}`,
        pageWidth - 20,
        55,
        { align: "right" },
      );
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 60, pageWidth - 20, 60);

      doc.setFont("helvetica", "bold");
      doc.text("CITIZEN DETAILS", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${complaint.citizen_name || "Verified Citizen"}`, 20, 78);
      doc.text(
        `Description: ${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? "..." : ""}`,
        20,
        84,
      );
      doc.text(
        `Reported Date: ${new Date(complaint.created_at).toLocaleDateString()}`,
        20,
        90,
      );

      doc.setFont("helvetica", "bold");
      doc.text("VISUAL EVIDENCE LOG", 20, 105);

      const beforeUrl = getFullImgUrl(complaint.image);
      const resolvedTask = complaint.department_tasks?.find(
        (t) => t.status === "resolved",
      );
      const afterUrl = resolvedTask
        ? getFullImgUrl(resolvedTask.after_image)
        : complaint.after_image
          ? getFullImgUrl(complaint.after_image)
          : null;

      if (beforeUrl) {
        const beforeImg = await getBase64ImageFromURL(beforeUrl);
        doc.addImage(beforeImg, "JPEG", 20, 110, 80, 50);
        doc.setFontSize(8);
        doc.text("INITIAL REPORT IMAGE", 20, 165);
      }

      if (afterUrl) {
        const afterImg = await getBase64ImageFromURL(afterUrl);
        doc.addImage(afterImg, "JPEG", 110, 110, 80, 50);
        doc.setFontSize(8);
        doc.text("RESOLUTION PROOF IMAGE", 110, 165);
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DEPARTMENT ACTION REPORT", 20, 185);

      let yPos = 195;
      const tasks = Array.isArray(complaint.department_tasks)
        ? complaint.department_tasks
        : [];
      tasks.forEach((task) => {
        doc.setFont("helvetica", "bold");
        doc.text(`- ${task.department}:`, 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Status: COMPLETED | Note: ${task.resolution_note || "No remarks provided"}`,
          50,
          yPos,
        );
        yPos += 8;
      });

      doc.setDrawColor(15, 42, 68);
      doc.line(20, 275, pageWidth - 20, 275);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "This is a system-generated document and does not require a physical signature.",
        pageWidth / 2,
        282,
        { align: "center" },
      );
      doc.text(
        "Smart Municipal Grievance Redressal System © 2026",
        pageWidth / 2,
        287,
        { align: "center" },
      );

      doc.save(`Resolution_Receipt_${complaint.id}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF. Please ensure images are accessible.");
    }
  };

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

  const filtered = complaints
    .filter((c) =>
      (c.description || "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

  if (loading)
    return (
      <div className="p-20 text-center text-blue-600 font-black animate-pulse uppercase tracking-widest">
        Syncing Your Secure Reports...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="mb-10 flex flex-col md:items-center text-center gap-4">
        <h2 className="text-4xl font-black text-[#0F2A44] tracking-tighter uppercase">
          My Reports
        </h2>
        <p className="text-slate-500 font-medium">
          Track the real-time progress of your grievances
        </p>
        <input
          placeholder="Search by description..."
          className="rounded-2xl border-2 border-slate-100 px-6 py-4 text-sm focus:border-blue-500 outline-none shadow-xl bg-white w-full max-w-md transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        <ComplaintGroup
          title="🕒 Pending"
          data={grouped.pending}
          color="blue"
          onCardClick={setSelectedComplaint}
        />
        <ComplaintGroup
          title="⏳ In Progress"
          data={grouped.inProgress}
          color="amber"
          onCardClick={setSelectedComplaint}
        />
        <ComplaintGroup
          title="✅ Resolved"
          data={grouped.resolved}
          color="emerald"
          onCardClick={setSelectedComplaint}
        />
        <ComplaintGroup
          title="🚫 Rejected"
          data={grouped.rejected}
          color="red"
          onCardClick={setSelectedComplaint}
        />
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/90 z-[5000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className={`bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border-t-[12px] ${selectedComplaint.status === "resolved" ? "border-emerald-500" : selectedComplaint.status === "rejected" ? "border-red-500" : "border-slate-900"}`}
          >
            <div
              className={`${selectedComplaint.status === "resolved" ? "bg-emerald-50" : selectedComplaint.status === "rejected" ? "bg-red-50" : "bg-slate-50"} p-8 flex justify-between items-center border-b`}
            >
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedComplaint.status === "resolved" ? "text-emerald-600" : selectedComplaint.status === "rejected" ? "text-red-500" : "text-blue-500"}`}
                >
                  Complaint ID: #{selectedComplaint.id}
                </p>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  Status Tracking
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-12 h-12 rounded-2xl bg-white shadow-md text-slate-400 hover:text-red-500 transition-all text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(selectedComplaint.department) ? (
                  selectedComplaint.department.map((dept) => (
                    <span
                      key={dept}
                      className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase border border-slate-200"
                    >
                      🏢 {dept} Dept
                    </span>
                  ))
                ) : (
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase border border-slate-200">
                    🏢 {selectedComplaint.department}
                  </span>
                )}
              </div>

              <StatusTimeline status={selectedComplaint.status} />

              {/* 🚀 Social Share Section Integration */}
              {selectedComplaint.status?.toLowerCase() !== "rejected" && (
                <SocialShare
                  complaintId={selectedComplaint.id}
                  status={selectedComplaint.status}
                />
              )}

              {selectedComplaint.status?.toLowerCase() === "rejected" && (
                <div className="bg-red-50 p-6 rounded-[2.5rem] border-2 border-red-100 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                      <span>⚠️</span> Rejection Evidence & Reason
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-red-400 uppercase block mb-1">
                        Official Proof
                      </label>
                      <div className="aspect-video rounded-2xl overflow-hidden border-2 border-red-200 shadow-sm bg-white">
                        <img
                          src={getFullImgUrl(selectedComplaint.rejection_proof)}
                          className="w-full h-full object-cover"
                          alt="Rejection Proof"
                          onError={(e) =>
                            (e.target.src =
                              "https://via.placeholder.com/300x200?text=No+Proof+Available")
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <label className="text-[9px] font-black text-red-400 uppercase block mb-1">
                        Remarks
                      </label>
                      <p className="text-sm font-bold text-red-800 italic bg-white/50 p-4 rounded-2xl border border-red-100">
                        "
                        {selectedComplaint.rejection_reason ||
                          "No specific reason provided by the authority."}
                        "
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Original Grievance
                    </label>
                    <p className="text-slate-700 font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100 italic leading-relaxed text-sm">
                      "{selectedComplaint.description}"
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Original Evidence (Main)
                    </label>
                    <div className="aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                      <img
                        src={getFullImgUrl(selectedComplaint.image)}
                        className="w-full h-full object-cover"
                        alt="Original Incident"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/400x300?text=Evidence+Not+Available")
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                    Department Proofs (Resolution)
                  </label>

                  {selectedComplaint.status?.toLowerCase() === "resolved" ? (
                    <div className="space-y-4">
                      {(!selectedComplaint.department_tasks ||
                        selectedComplaint.department_tasks.length === 0) &&
                        selectedComplaint.after_image && (
                          <div className="p-4 bg-white rounded-3xl border-2 border-slate-50 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800 uppercase">
                                System Resolution (Merged)
                              </span>
                              <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase bg-green-100 text-green-600">
                                Resolved
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="relative group">
                                <p className="text-[7px] font-black text-slate-400 uppercase absolute top-1 left-2 z-10 bg-white/80 px-1 rounded">
                                  Before Work
                                </p>
                                <img
                                  src={getFullImgUrl(selectedComplaint.image)}
                                  className="w-full h-24 object-cover rounded-xl border border-slate-100"
                                  alt="Before"
                                />
                              </div>
                              <div className="relative group">
                                <p className="text-[7px] font-black text-emerald-600 uppercase absolute top-1 left-2 z-10 bg-white/80 px-1 rounded">
                                  After Work
                                </p>
                                <img
                                  src={getFullImgUrl(
                                    selectedComplaint.after_image,
                                  )}
                                  className="w-full h-24 object-cover rounded-xl border-2 border-emerald-100 shadow-sm"
                                  alt="After"
                                />
                              </div>
                              <p className="col-span-2 text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                Note:{" "}
                                {selectedComplaint.resolution_note ||
                                  "Resolved by Municipal Administrator."}
                              </p>
                            </div>
                          </div>
                        )}

                      {selectedComplaint.department_tasks &&
                      selectedComplaint.department_tasks.length > 0
                        ? selectedComplaint.department_tasks.map(
                            (task, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-white rounded-3xl border-2 border-slate-50 shadow-sm space-y-3"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-800 uppercase">
                                    {task.department}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${task.status === "resolved" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
                                  >
                                    {task.status}
                                  </span>
                                </div>
                                {task.status === "resolved" && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="relative group">
                                      <p className="text-[7px] font-black text-slate-400 uppercase absolute top-1 left-2 z-10 bg-white/80 px-1 rounded">
                                        Before Work
                                      </p>
                                      <img
                                        src={getFullImgUrl(
                                          task.before_image ||
                                            selectedComplaint.image,
                                        )}
                                        className="w-full h-24 object-cover rounded-xl border border-slate-100"
                                        alt="Before"
                                      />
                                    </div>
                                    <div className="relative group">
                                      <p className="text-[7px] font-black text-emerald-600 uppercase absolute top-1 left-2 z-10 bg-white/80 px-1 rounded">
                                        After Work
                                      </p>
                                      <img
                                        src={getFullImgUrl(
                                          task.after_image ||
                                            selectedComplaint.after_image,
                                        )}
                                        className="w-full h-24 object-cover rounded-xl border-2 border-emerald-100 shadow-sm"
                                        alt="After"
                                      />
                                    </div>
                                    <p className="col-span-2 text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                      Note:{" "}
                                      {task.resolution_note ||
                                        "Resolved successfully"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ),
                          )
                        : null}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                        Awaiting assigned department action...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                {selectedComplaint.status?.toLowerCase() === "resolved" && (
                  <button
                    onClick={() =>
                      navigate("/feedback", {
                        state: { grievanceId: selectedComplaint.id },
                      })
                    }
                    className="w-full bg-emerald-600 text-white p-5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    ⭐ Authenticate Service Quality
                  </button>
                )}

                {selectedComplaint.status?.toLowerCase() === "resolved" && (
                  <button
                    onClick={() => generateReceipt(selectedComplaint)}
                    className="w-full bg-slate-900 text-white p-5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 border-2 border-slate-700"
                  >
                    📄 Download Completion Receipt (PDF)
                  </button>
                )}

                <a
                  href={selectedComplaint.formatted_address || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-slate-100 text-slate-800 p-5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                >
                  📍 View Location Insight
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplaintGroup({ title, data, color, onCardClick }) {
  if (data.length === 0) return null;
  const colors = {
    blue: "border-l-blue-500 hover:shadow-blue-100",
    amber: "border-l-amber-500 hover:shadow-amber-100",
    emerald: "border-l-emerald-500 hover:shadow-emerald-100 bg-emerald-50/20",
    red: "border-l-red-500 hover:shadow-red-100",
  };
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((c) => (
          <div
            key={c.id}
            onClick={() => onCardClick(c)}
            className={`bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:scale-[1.02] cursor-pointer transition-all border-l-[12px] ${colors[color]}`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-black text-slate-800 text-lg leading-tight truncate flex-1 pr-4">
                {c.description}
              </h4>
              <span
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${color === "emerald" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : color === "red" ? "bg-red-100 text-red-700 border-red-200" : "bg-white text-slate-400"}`}
              >
                {c.status?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                <span className="text-blue-500 font-black">
                  #Complaint-{c.id}
                </span>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex -space-x-2">
                {Array.isArray(c.department) &&
                  c.department.map((d, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-[8px] text-white font-black uppercase"
                    >
                      {d[0]}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusTimeline({ status }) {
  const steps = ["Submitted", "Verified", "In Progress", "Resolved"];
  const currentStatus = status?.toLowerCase();
  let activeIndex = 0;
  if (["pending", "submitted", "verified"].includes(currentStatus))
    activeIndex = 1;
  if (["assigned", "in progress", "in_progress"].includes(currentStatus))
    activeIndex = 2;
  if (currentStatus === "resolved") activeIndex = 3;

  if (currentStatus === "rejected")
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase text-xs tracking-widest text-center border-2 border-red-100 animate-pulse">
        ⚠️ Case Rejected by Authority
      </div>
    );

  return (
    <div className="py-10 px-4">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-[3px] bg-blue-600 -translate-y-1/2 z-0 transition-all duration-1000 rounded-full"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, index) => (
          <div key={step} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${index <= activeIndex ? "bg-blue-600 text-white scale-110" : "bg-white border-2 border-slate-100 text-slate-200"}`}
            >
              {index < activeIndex ? (
                "✓"
              ) : (
                <span className="text-[11px] font-black">{index + 1}</span>
              )}
            </div>
            <p
              className={`absolute -bottom-8 text-[9px] font-black uppercase tracking-tighter whitespace-nowrap ${index <= activeIndex ? "text-blue-600" : "text-slate-300"}`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
