import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = 'http://localhost:5129/api';

// Match the backend enum
export const AnnouncementType = {
  Deal: 0,
  New_Arrival: 1,
  Information: 2
};

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

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const announcementService = {
  getAllAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_URL}/Anoucment`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  getActiveAnnouncements: async () => {
    try {
      const response = await axios.get(`${API_URL}/Anoucment/active`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      console.error('Error fetching active announcements:', error);
      throw error;
    }
  },

  getAnnouncementById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Anoucment/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      console.error(`Error fetching announcement with ID ${id}:`, error);
      throw error;
    }
  },

  createAnnouncement: async (announcementData) => {
    try {
      // The controller expects a CreateAnnouncementDTO
      const data = {
        announcementType: announcementData.type,
        announcementDescription: announcementData.content,
        endDate: new Date(announcementData.endDate).toISOString()
      };

      const response = await axios.post(`${API_URL}/Anoucment`, data, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      console.error('Error creating announcement:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  updateAnnouncement: async (id, announcementData) => {
    try {
      // The controller expects a CreateAnnouncementDTO
      const data = {
        announcementType: announcementData.type,
        announcementDescription: announcementData.content,
        endDate: new Date(announcementData.endDate).toISOString()
      };

      const response = await axios.put(`${API_URL}/Anoucment/${id}`, data, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      console.error(`Error updating announcement with ID ${id}:`, error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/Anoucment/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
      }
      console.error(`Error deleting announcement with ID ${id}:`, error);
      throw error;
    }
  }
};

export default announcementService;
