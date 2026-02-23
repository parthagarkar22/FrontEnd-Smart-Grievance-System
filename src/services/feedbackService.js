import API from "./api";

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await API.post("feedback/", feedbackData);
    return response.data;
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    throw error;
  }
};

export const fetchUserNotifications = async () => {
  try {
    const response = await API.get("notifications/"); // Postman: user notification
    return response.data;
  } catch (error) {
    console.error("Notification Error:", error);
    throw error;
  }
};
