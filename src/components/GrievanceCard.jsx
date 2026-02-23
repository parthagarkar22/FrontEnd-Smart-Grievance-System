import React from "react";
import StatusBadge from "./StatusBadge";

const GrievanceCard = ({ grievance }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-800">{grievance.title}</h3>
        <StatusBadge status={grievance.status} />
      </div>

      {/* NEW: Image Display Logic */}
      {grievance.image && (
        <div className="mb-3 overflow-hidden rounded-lg border border-gray-100">
          <img
            src={grievance.image}
            alt="Complaint proof"
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {grievance.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex gap-2">
          <span className="bg-gray-100 px-2 py-1 rounded">
            📍 {grievance.department}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            🚩 {grievance.priority}
          </span>
        </div>
        <span>{new Date(grievance.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default GrievanceCard;
