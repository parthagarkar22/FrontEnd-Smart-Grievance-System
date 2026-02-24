import React, { useEffect, useState } from "react";
import { fetchAllFeedbacks } from "../services/grievanceService";

export default function ViewFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await fetchAllFeedbacks();
        setFeedbacks(data || []);
      } catch (error) {
        console.error("Error loading feedbacks", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, []);

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-blue-600 animate-pulse">
        Loading Feedbacks...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#F8FAFC] min-h-screen">
      <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tight">
        Citizen Feedbacks
      </h2>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
            <tr>
              <th className="px-6 py-4">Grievance ID</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Comment</th>
              <th className="px-6 py-4">Resolved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {feedbacks.map((f) => (
              <tr key={f.id} className="hover:bg-blue-50/10">
                <td className="px-6 py-4 font-bold text-blue-600">
                  #{f.grievance}
                </td>
                <td className="px-6 py-4 text-emerald-600 font-black">
                  {f.rating} / 5 ⭐
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 italic font-medium">
                  "{f.comment || "No comment provided."}"
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-800">
                  {f.officer_name || `Officer #${f.officer}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
