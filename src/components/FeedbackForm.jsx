import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitFeedback } from "../services/feedbackService";

const FeedbackForm = ({ onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // state मधून डेटा रिसीव्ह करणे
  const { grievanceId, officerId } = location.state || {};

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Debug: कन्सोलमध्ये व्हॅल्यू चेक करा
    console.log("Submitting Feedback - Grievance ID:", grievanceId);

    const payload = {
      grievance: parseInt(grievanceId),
      rating: parseInt(rating),
      comment: comment.trim() || "Resolution satisfied.",
      // ✅ आपण बॅकएंड अपडेट केल्यामुळे आता 'officer' पाठवणे अनिवार्य नाही,
      // तरीही सुरक्षेसाठी आपण तो पाठवूया जर उपलब्ध असेल तर.
      officer: officerId?.id
        ? parseInt(officerId.id)
        : officerId
          ? parseInt(officerId)
          : null,
    };

    // 🚨 व्हॅलिडेशन: तक्रार आयडी असणे सर्वात महत्त्वाचे आहे
    if (!payload.grievance) {
      alert(
        "Error: Grievance ID is missing. Please try again from My History.",
      );
      setLoading(false);
      return;
    }

    try {
      // ✅ आता बॅकएंड स्वतः 'officer' शोधून सेव्ह करेल
      await submitFeedback(payload);
      alert("Feedback submitted successfully!");

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/user-dashboard"); // यशस्वी सबमिशननंतर डॅशबोर्डवर नेव्हिगेट करा
      }
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError?.grievance) {
        alert("Error: You have already submitted feedback for this grievance!");
      } else {
        // बॅकएंडमधील नेमका एरर मेसेज दाखवा
        alert(
          serverError?.error || "Submission Failed: Please try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-xl max-w-md mx-auto mt-10">
      <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-tight">
        Rate the Resolution
      </h3>
      <p className="text-gray-400 text-xs font-bold mb-6 uppercase">
        Grievance ID: #{grievanceId || "N/A"}
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
          disabled={loading || !grievanceId}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 disabled:opacity-50 uppercase tracking-widest"
        >
          {loading ? "Processing..." : "Submit Experience"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
