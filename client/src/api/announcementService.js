import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = 'http://localhost:5129/api';

const announcementService = {
  getAllAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_URL}/Announcements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },
  
  getActiveAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_URL}/Announcements/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active announcements:', error);
      throw error;
    }
  },
  
  getAnnouncementById: async (announcementId) => {
    try {
      const response = await axios.get(`${API_URL}/Announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching announcement with ID ${announcementId}:`, error);
      throw error;
    }
  },
  
  createAnnouncement: async (announcementData) => {
    try {
      const response = await axios.post(`${API_URL}/Announcements`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },
  
  updateAnnouncement: async (announcementId, announcementData) => {
    try {
      const response = await axios.put(`${API_URL}/Announcements/${announcementId}`, announcementData);
      return response.data;
    } catch (error) {
      console.error(`Error updating announcement with ID ${announcementId}:`, error);
      throw error;
    }
  },
  
  deleteAnnouncement: async (announcementId) => {
    try {
      const response = await axios.delete(`${API_URL}/Announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting announcement with ID ${announcementId}:`, error);
      throw error;
    }
  }
};

export default announcementService; 