import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/grievances/citizen/";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: null,
  });

  // ---------------- IMAGE ----------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ---------------- GPS ----------------
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
        },
        () => alert("Location is mandatory. Please enable GPS permissions."),
      );
    }
  }, []);

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return alert("Please upload a photo of the issue.");
    if (!formData.location)
      return alert("Waiting for location. Please wait a moment.");

    setIsSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("description", formData.description.trim());
    data.append("image", image);
    data.append("latitude", formData.location.lat);
    data.append("longitude", formData.location.lng);

    const token = localStorage.getItem("access");

    try {
      await axios.post(API_URL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setIsSuccess(true);
      setTimeout(() => navigate("/user-dashboard"), 2000);
    } catch (error) {
      console.error("Backend Error Details:", error.response?.data);
      const errorMsg = error.response?.data
        ? Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n")
        : "Server unreachable. Make sure the Django server is running.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- VOICE FEATURE ----------------
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = () => {
    resetTranscript(); // clear old voice text

    SpeechRecognition.startListening({
      continuous: false, // ✅ IMPORTANT CHANGE
      language: "en-IN",
    });
  };

  const handleVoiceFill = () => {
    if (!transcript) return alert("No voice detected.");

    setFormData((prev) => ({
      ...prev,
      description: transcript,
      title: transcript.split(" ").slice(0, 5).join(" "),
    }));

    SpeechRecognition.stopListening(); // stop mic safely
    resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-10 text-center">
        Your browser does not support speech recognition.
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-[60vh] text-center bg-white rounded-3xl shadow-sm mx-4 mt-10 border border-green-100">
        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[#0F2A44]">Report Received</h2>
        <p className="text-slate-500 mt-2">Thank you for your contribution.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-[#0F2A44] p-8 text-white relative">
          <h2 className="text-2xl font-bold tracking-tight">New Report</h2>
          <p className="text-blue-200 text-sm mt-1 opacity-90">
            Fill in the details below
          </p>

          <div
            className={`absolute top-8 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              formData.location
                ? "bg-green-500/20 border-green-400 text-green-400"
                : "bg-orange-500/20 border-orange-400 text-orange-400 animate-pulse"
            }`}
          >
            {formData.location ? "● Location Locked" : "○ Finding GPS..."}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Issue Title */}
          <div className="group">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Issue Title
            </label>
            <input
              type="text"
              placeholder="What is the problem?"
              required
              value={formData.title}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Detailed Description */}
          <div className="group relative">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Description
              </label>

              <button
                type="button"
                onClick={startListening}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-all ${
                  listening
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                🎤 {listening ? "Listening..." : "Speak"}
              </button>
            </div>

            <textarea
              placeholder="Describe what you see..."
              required
              value={formData.description}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 resize-none"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            {transcript && (
              <button
                type="button"
                onClick={handleVoiceFill}
                className="text-xs text-green-600 mt-2 hover:underline"
              >
                Use Voice Text
              </button>
            )}
          </div>

          {/* Photo Evidence */}
          <div className="group">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Evidence Photo
            </label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-all overflow-hidden group/box min-h-[160px] flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                required
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover z-10"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="text-3xl mb-2 opacity-40">📷</div>
                  <p className="text-xs font-semibold text-slate-400">
                    Tap to Capture / Upload
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.location}
            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
              isSubmitting || !formData.location
                ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send Report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
