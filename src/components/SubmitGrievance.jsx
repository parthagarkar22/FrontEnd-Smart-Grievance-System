import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SubmitGrievance = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "Road Improvement", // Default selection
    priority: "LOW",
    location: null, // Will hold {lat, lng}
  });

  // Automatically get GPS location when component mounts
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Constructing the GeoJSON Point for the backend models.PointField
    const payload = {
      title: formData.title,
      description: formData.description,
      department: formData.department,
      priority: formData.priority,
      location: {
        type: "Point",
        coordinates: [formData.location.lng, formData.location.lat], // [Longitude, Latitude]
      },
    };

    try {
      // Path: router.register(r'citizen', GrievanceViewSet)
      await axios.post(
        "http://127.0.0.1:8000/api/grievances/citizen/",
        payload,
      );
      alert("Complaint Registered Successfully!");
      navigate("/user-dashboard");
    } catch (error) {
      console.error("Error submitting grievance", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            required
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Department</label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          >
            <option value="Road Improvement">Road Improvement</option>
            <option value="Rain/Drainage">Rain/Drainage Department</option>
            <option value="Electricity">Electricity</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            rows="4"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="text-xs text-gray-500">
          {formData.location
            ? `📍 Location captured: ${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`
            : "⌛ Capturing location..."}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
};

export default SubmitGrievance;