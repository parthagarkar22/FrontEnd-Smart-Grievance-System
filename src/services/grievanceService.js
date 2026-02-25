import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor: Token automatically pathavnyasathi
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Citizen: Swataha chya तक्रारी बघणे
export const fetchUserComplaints = async () => {
  const response = await API.get("grievances/citizen/");
  return response.data.results || response.data;
};

// Admin: Srv तक्रारी बघणे
export const fetchAllComplaints = async () => {
  const response = await API.get("grievances/admin/");
  return response.data.results || response.data;
};

// Officer: Swataha chya Dept chya तक्रari baghne
export const fetchMunicipalData = async () => {
  const grievancesRes = await API.get("grievances/officer/");
  const statsRes = await API.get("dashboard/officer/");
  return {
    complaints: grievancesRes.data.results || grievancesRes.data,
    stats: statsRes.data,
  };
};

export const updateComplaintStatus = async (id, status) => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const rolePath = savedUser?.role === "ADMIN" ? "admin" : "officer";

  let backendStatus = status.toLowerCase();
  if (backendStatus === "in progress") backendStatus = "in_progress";

  try {
    const response = await API.patch(`grievances/${rolePath}/${id}/`, {
      status: backendStatus,
    });
    return response.data;
  } catch (error) {
    console.error("Payload mismatch error:", { sent: backendStatus });
    throw error;
  }
};

export const fetchAllFeedbacks = async () => {
  try {
    const response = await API.get("feedback/all/");
    return response.data;
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    throw error;
  }
};
