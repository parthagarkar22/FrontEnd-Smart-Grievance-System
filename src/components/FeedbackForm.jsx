import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitFeedback } from "../services/feedbackService";

const FeedbackForm = ({ onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // MyComplaints कडून येणारा डेटा रिसीव्ह करणे
  const { grievanceId, officerId } = location.state || {};

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ पेलोड तयार करणे - ऑफिसर आयडी आता कंपल्सरी पाठवला आहे
    const payload = {
      grievance: parseInt(grievanceId),
      rating: parseInt(rating),
      comment: comment.trim() || "Resolution satisfied.",
      // मित्राने सांगितल्याप्रमाणे ही फील्ड आता अनिवार्य आहे
      officer: officerId?.id ? parseInt(officerId.id) : parseInt(officerId),
    };

    // 🚨 व्हॅलिडेशन: जर डेटा नसेल तर सबमिट करू नका
    if (!payload.grievance || !payload.officer) {
      alert(
        "Error: Grievance or Officer information is missing. Please try again from My History.",
      );
      setLoading(false);
      return;
    }

    try {
      await submitFeedback(payload);
      alert("Feedback submitted successfully! ⭐");

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      const serverError = err.response?.data;
      console.error("Submission Error:", serverError);

      if (serverError?.grievance) {
        alert("Error: You have already submitted feedback for this grievance!");
      } else if (serverError?.officer) {
        alert("Error: Officer field is mandatory according to backend.");
      } else {
        alert(
          serverError?.error ||
            "Submission Failed: Please check your connection.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-blue-50 shadow-2xl max-w-md mx-auto mt-16 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>

      <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">
        Rate the Resolution
      </h3>
      <div className="flex items-center gap-2 mb-8">
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          Grievance: #{grievanceId || "N/A"}
        </span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
          Officer: #{officerId?.id || officerId || "N/A"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div>
          <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-4">
            How was your experience?
          </label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`w-12 h-12 rounded-2xl font-black text-lg transition-all transform active:scale-90 ${
                  rating === num
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200 -rotate-3 scale-110"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-3">
            Your Comments
          </label>
          <textarea
            className="w-full p-5 border border-slate-100 rounded-[24px] bg-slate-50 text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all italic text-slate-600"
            rows="4"
            placeholder="Share your experience with the officer..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !grievanceId || !officerId}
          className="w-full py-5 bg-[#10B981] text-white rounded-[20px] font-black text-xs hover:bg-[#059669] transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 uppercase tracking-[0.2em]"
        >
          {loading ? "Syncing with Server..." : "Submit Experience →"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
