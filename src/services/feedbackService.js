import API from "./api";

export const submitFeedback = async (feedbackData) => {
  try {
    // Postman नुसार 'feedback/' ऐवजी पूर्ण पाथ चेक कर (उदा. 'feedback/')
    const response = await API.post("feedback/", feedbackData);
    return response.data;
  } catch (error) {
    console.error(
      "Feedback Submission Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const fetchUserNotifications = async () => {
  try {
    // Postman: "user notification" GET request
    const response = await API.get("notifications/");
    return response.data;
  } catch (error) {
    console.error("Notification Error:", error);
    throw error;
  }
};
