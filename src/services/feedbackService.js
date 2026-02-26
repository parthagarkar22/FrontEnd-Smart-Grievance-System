import API from "./api";

// १. फीडबॅक सबमिट करण्यासाठी (User Side)
export const submitFeedback = async (feedbackData) => {
  try {
    // बॅकएंड पेलोडमध्ये 'grievance', 'officer', 'rating', 'comment' अनिवार्य आहेत
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

// ३. नोटिफिकेशन्स फेच करण्यासाठी
export const fetchUserNotifications = async () => {
  try {
    const response = await API.get("notifications/");
    return response.data;
  } catch (error) {
    console.error("Notification Error:", error);
    throw error;
  }
};
