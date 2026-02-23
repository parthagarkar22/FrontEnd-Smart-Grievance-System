import React from "react";

const StatusBadge = ({ status }) => {
  // Mapping backend status strings to Tailwind CSS colors
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    escalated: "bg-orange-100 text-orange-800 border-orange-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || "bg-gray-100"}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};

export default StatusBadge;
