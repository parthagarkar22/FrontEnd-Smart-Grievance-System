import API from "./api";


export const fetchNotifications = async () => {
  try {
    const response = await API.get("notifications/");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};


export const markAsRead = async (id) => {
  try {
    const response = await API.post(`notifications/mark-read/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
