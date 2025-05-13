import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = 'http://localhost:5129/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const notificationService = {
  getNotifications: async () => {
    try {
      const response = await axios.get(`${API_URL}/notification`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axios.post(
        `${API_URL}/notification/markAsRead/${notificationId}`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }
};

export default notificationService; 