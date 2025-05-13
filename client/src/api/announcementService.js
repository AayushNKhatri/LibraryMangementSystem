import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = 'http://localhost:5129/api';

const handleUnauthorized = () => {
  // Redirect to login page
  window.location.href = '/login';
};

// const checkAdminAuth = () => {
//   // You should implement proper admin check here
//   // For now, we'll use a simple check
//   const isAdmin = localStorage.getItem('isAdmin') === 'true';
//   if (!isAdmin) {
//     throw new Error('Unauthorized: You must be an admin to perform this action');
//   }
// };

const announcementService = {
  getAllAnnouncements: async () => {
    try {
      checkAdminAuth();
      const response = await axios.get(`${API_URL}/Anoucment`);
      return response.data;
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        handleUnauthorized();
      }
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  getActiveAnnouncements: async () => {
    try {
      checkAdminAuth();
      const response = await axios.get(`${API_URL}/Announcements/active`);
      return response.data;
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        handleUnauthorized();
      }
      console.error('Error fetching active announcements:', error);
      throw error;
    }
  },

  getAnnouncementById: async (id) => {
    try {
      checkAdminAuth();
      const response = await axios.get(`${API_URL}/Anoucment/${id}`);
      return response.data;
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        handleUnauthorized();
      }
      console.error(`Error fetching announcement with ID ${id}:`, error);
      throw error;
    }
  },

  createAnnouncement: async (announcementData) => {
    try {
      checkAdminAuth();
      const apiData = {
        announcementType: parseInt(announcementData.type),
        announcementDescription: announcementData.content,
        startDate: announcementData.startDate,
        endDate: announcementData.endDate
      };

      const response = await axios.post(`${API_URL}/Anoucment`, apiData);
      return response.data;
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        handleUnauthorized();
      }
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  updateAnnouncement: async (id, announcementData) => {
    try {
      checkAdminAuth();
      const apiData = {
        announcementType: parseInt(announcementData.type),
        announcementDescription: announcementData.content,
        startDate: announcementData.startDate,
        endDate: announcementData.endDate
      };

      const response = await axios.put(`${API_URL}/Anoucment/${id}`, apiData);
      return response.data;
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        handleUnauthorized();
      }
      console.error(`Error updating announcement with ID ${id}:`, error);
      throw error;
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      checkAdminAuth();
      const response = await axios.delete(`${API_URL}/Anoucment/${id}`);
      return response.data;
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        handleUnauthorized();
      }
      console.error(`Error deleting announcement with ID ${id}:`, error);
      throw error;
    }
  }
};

export default announcementService;
