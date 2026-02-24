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

    // 🛡️ ४०० एरर फिक्स करण्यासाठी डेटा 'Integer' मध्ये कन्व्हर्ट करणे
    const payload = {
      grievance: parseInt(grievanceId), // Grievance ची ID
      officer:
        typeof officerId === "object" ? officerId.id : parseInt(officerId), // Officer ची ID
      rating: parseInt(rating), // Rating 1-5
      comment: comment.trim() || "Thank you for the resolution.", // Text comment
    };

    try {
      await submitFeedback(payload);
      alert("Feedback submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      // जर ४०० एरर आला तर सर्वर काय म्हणतोय ते अलर्ट मध्ये दाखवा
      const serverMsg = err.response?.data;
      console.log("Validation Error:", serverMsg);
      alert(
        serverMsg?.detail ||
          "You have already submitted feedback for this grievance.",
      );
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
