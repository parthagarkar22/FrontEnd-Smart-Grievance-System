import React, { useState } from "react";
import { submitFeedback } from "../services/feedbackService";

const FeedbackForm = ({ grievanceId, officerId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // FeedbackForm.jsx मधील handleSubmit मधील हा भाग रिप्लेस कर:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Debug करण्यासाठी हा लॉग टाकून बघ की officerId मध्ये व्हॅल्यू येतेय का
    console.log("Current Officer ID:", officerId);

    const payload = {
      grievance: parseInt(grievanceId),
      // ✅ बदल: जर officerId ऑब्जेक्ट असेल तर त्याची .id घे, नाहीतर डायरेक्ट व्हॅल्यू घे
      officer: officerId?.id ? parseInt(officerId.id) : parseInt(officerId),
      rating: parseInt(rating),
      comment: comment.trim() || "Resolution satisfied.",
    };

    // 🚨 जर ऑफिसर आयडी नसेल तर सबमिट करू नको
    if (!payload.officer) {
      alert("Error: Officer information is missing. Cannot submit feedback.");
      setLoading(false);
      return;
    }

    try {
      await submitFeedback(payload);
      alert("Feedback submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError?.grievance) {
        alert("Error: You have already submitted feedback for this grievance!");
      } else {
        alert("Submission Failed: Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">
        Rate the Resolution
      </h3>
      <p className="text-gray-400 text-xs font-bold mb-6 uppercase">
        Grievance ID: #{grievanceId}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-3">
            Service Rating
          </label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`w-12 h-12 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
                  rating === num
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 rotate-3"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">
            Additional Comments
          </label>
          <textarea
            className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all italic"
            rows="3"
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 disabled:opacity-50 uppercase tracking-widest"
        >
          {loading ? "Processing..." : "Submit Experience"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
