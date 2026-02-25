import API from "./api";

export const fetchNotifications = async () => {
  const response = await API.get("notifications/");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await API.post(`notifications/${id}/read/`);
  return response.data;
};

export const markAllAsReadFront = async (unreadNotifications) => {
  try {
    const promises = unreadNotifications.map((n) =>
      API.post(`notifications/${n.id}/read/`)
    );

    await Promise.all(promises);
    return { message: "All marked as read" };
  } catch (error) {
    console.error("Error marking all read", error);
    throw error;
  }
};