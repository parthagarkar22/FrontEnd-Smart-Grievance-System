import API from "./api";

export const fetchNotifications = async () => {
  const response = await API.get("notifications/");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await API.post(`notifications/mark-read/${id}/`);
  return response.data;
};


export const markAllAsReadFront = async (unreadNotifications) => {
  try {
    const promises = unreadNotifications.map((n) =>
      API.post(`notifications/mark-read/${n.id}/`),
    );
    await Promise.all(promises);
    return { message: "All marked as read" };
  } catch (error) {
    console.error("Error marking all read", error);
    throw error;
  }
};
