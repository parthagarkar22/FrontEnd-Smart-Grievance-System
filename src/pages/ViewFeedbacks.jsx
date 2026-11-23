import React, { useEffect, useState } from "react";
import { fetchAllFeedbacks } from "../services/grievanceService";

export default function ViewFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user details from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "ADMIN";
  const userDept = user?.department; // e.g., "Road", "Water"

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await fetchAllFeedbacks();
        const validData = Array.isArray(data) ? data : data?.results || [];

        if (isAdmin) {
          // ✨ ADMIN LOGIC: No filtering, show everything
          setFeedbacks(validData);
        } else {
          // ✨ OFFICER LOGIC: Filter by department using 'officer_name'
          const filtered = validData.filter((f) => {
            const actualDept = f.officer_name || f.department || "";
            return (
              actualDept.toLowerCase().trim() === userDept?.toLowerCase().trim()
            );
          });
          setFeedbacks(filtered);
        }
      } catch (error) {
        console.error("Error loading feedbacks", error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, [isAdmin, userDept]);

  if (loading)
    return (
      <div className="p-20 text-center font-black text-blue-600 animate-pulse text-xl tracking-widest uppercase">
        Accessing feedback database...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
            {isAdmin
              ? "System-Wise Feedback Audit"
              : `${userDept} Performance Reviews`}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isAdmin
              ? "Complete transparency: Viewing citizen ratings across all departments."
              : `Reviewing service excellence for the ${userDept} department.`}
          </p>
        </div>
        <div className="bg-white px-8 py-4 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Feedback Units
          </p>
          <p className="text-2xl font-black text-blue-600">
            {feedbacks.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b">
            <tr>
              <th className="px-8 py-6">ID</th>
              <th className="px-8 py-6">Target Dept.</th>
              <th className="px-8 py-6 text-center">Satisfaction</th>
              <th className="px-8 py-6">Citizen Remarks</th>
              <th className="px-8 py-6 text-right">Resolved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {feedbacks.map((f) => {
              // UI representation of the department
              const displayDept = f.officer_name || f.department || "General";

              return (
                <tr
                  key={f.id}
                  className="hover:bg-blue-50/30 transition-all group"
                >
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-lg">
                      #{f.grievance}
                    </span>
                  </td>

                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                      {displayDept}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`text-sm font-black ${f.rating >= 4 ? "text-emerald-600" : f.rating <= 2 ? "text-red-500" : "text-amber-500"}`}
                      >
                        {f.rating}.0
                      </span>
                      <span className="text-amber-400">★</span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                      "{f.comment || "Citizen appreciated the resolution."}"
                    </p>
                  </td>

                  <td className="px-8 py-6 text-right font-bold text-slate-800 text-xs uppercase">
                    {f.officer_name || "Official"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {feedbacks.length === 0 && (
          <div className="p-32 text-center bg-white">
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
              No specific records available in this view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
