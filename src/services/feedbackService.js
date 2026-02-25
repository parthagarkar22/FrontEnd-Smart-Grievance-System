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

// २. सर्व फीडबॅक फेच करण्यासाठी (Admin Side)
// ✅ 405 एरर घालवण्यासाठी इथे बदल केला आहे
export const fetchAllFeedbacks = async () => {
  try {
    // बॅकएंड डेव्हलपरने 'feedback/all/' हा पाथ GET साठी दिला आहे
    const response = await API.get("feedback/all/");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching feedbacks:",
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
