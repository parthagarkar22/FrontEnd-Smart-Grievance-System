import axios from "axios";
import { API_BASE_URL } from "../config";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor: Token automatically pathavnyasathi
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- CITIZEN APIS ---
export const fetchUserComplaints = async () => {
  const response = await API.get("grievances/citizen/");
  return response.data.results || response.data;
};

// --- ADMIN APIS ---
export const fetchAllComplaints = async () => {
  // ✨ FIX: Role check logic added to prevent 403 for non-admins
  const response = await API.get("grievances/admin/");
  return response.data.results || response.data;
};

export const fetchAllFeedbacks = async () => {
  try {
    const response = await API.get("feedback/admin/");
    return response.data.results || response.data;
  } catch (error) {
    console.error("Feedback Fetch Error Status:", error.response?.status);
    return [];
  }
};

// --- OFFICER APIS ---
export const fetchMunicipalData = async () => {
  const grievancesRes = await API.get("grievances/officer/");
  const statsRes = await API.get("dashboard/officer/");
  return {
    complaints: grievancesRes.data.results || grievancesRes.data,
    stats: statsRes.data,
  };
};

// --- ACTION APIS ---

// ✨ DELETE: Strictly hits the admin endpoint
export const deleteGrievance = async (id) => {
  const response = await API.delete(`grievances/admin/${id}/`);
  return response.data;
};

export const updateComplaintStatus = async (id, status, extraData = {}) => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const rolePath = savedUser?.role === "ADMIN" ? "admin" : "officer";

  let backendStatus = status.toLowerCase();
  if (backendStatus === "in progress") backendStatus = "in_progress";

  // ✨ Logic: Hamesha FormData use karein kyunki Admin ko rejection proof (file) bhejni hai
  const formData = new FormData();
  formData.append("status", backendStatus);

  // Rejection logic for Admin/Officer
  if (backendStatus === "rejected") {
    if (extraData.rejection_reason)
      formData.append("rejection_reason", extraData.rejection_reason);
    if (extraData.rejection_proof)
      formData.append("rejection_proof", extraData.rejection_proof);
  }

  // General resolution note (optional)
  if (extraData.resolution_note) {
    formData.append("resolution_note", extraData.resolution_note);
  }

  try {
    const response = await API.patch(
      `grievances/${rolePath}/${id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Update Status Failed Details:", error.response?.data);
    throw error;
  }
};
// --- ACTION APIS ---

// ✨ FIXED: Added better Multipart handling
export const resolveGrievanceWithPhoto = async (id, photoFile, note) => {
  const formData = new FormData();
  formData.append("status", "resolved");
  formData.append("after_image", photoFile); // Ensure backend expects 'after_image'
  formData.append("resolution_note", note || "Resolved by authority");

  try {
    const response = await API.patch(`grievances/admin/${id}/`, formData, {
      headers: {
        // Axios automatic boundary set karega, isliye manually 'multipart/form-data'
        // kabhi kabhi error deta hai. Leave it to Axios or use this:
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Resolution Upload Error Payload:", error.response?.data);
    throw error;
  }
};

// 🤖 AI/Admin Action Endpoint (Fixed & Flexible)
export const takeAdminAction = async (id, data) => {
  try {
    const response = await API.post(`grievances/admin/take-action/${id}/`, {
      action_type: data.action_type, // ✅ correct key
      reason: data.reason, // ✅ correct key
    });

    return response.data;
  } catch (error) {
    console.error("Admin Action Failed:", error.response?.data);
    throw error;
  }
};

// Social Share Content API call
export const getSocialShareContent = async (grievanceId) => {
  try {
    const response = await API.get(`grievances/share-content/${grievanceId}/`);
    return response.data; // { "message": "...", "link": "..." }
  } catch (error) {
    console.error("Share Content Error:", error);
    throw error;
  }
};
