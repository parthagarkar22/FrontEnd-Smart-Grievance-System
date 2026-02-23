import API from "./api";

export const fetchMunicipalData = async () => {
  try {
    // This calls http://127.0.0.1:8000/api/grievances/officer/
    // and http://127.0.0.1:8000/api/dashboard/officer/
    const grievancesRes = await API.get("grievances/officer/");
    const statsRes = await API.get("dashboard/officer/");

    return {
      complaints: grievancesRes.data.results || grievancesRes.data,
      stats: statsRes.data,
    };
  } catch (error) {
    console.error("Officer Data Fetch Error:", error.response?.data || error);
    throw error;
  }
};
