import axios from 'axios';

// API URL for bookmarks
const API_URL = 'http://localhost:5129/api/Bookmark';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const bookmarkService = {
  // Get all bookmarks for the current user
  getAllBookmarks: async () => {
    try {
      const response = await axios.get(`${API_URL}/GetAllBookmark`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  },

  // Get bookmark by ID
  getBookmarkById: async (bookmarkId) => {
    try {
      const response = await axios.get(`${API_URL}/BookmarkBy/${bookmarkId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookmark with ID ${bookmarkId}:`, error);
      throw error;
    }
  },

  // Add a book to bookmarks/wishlist
  addBookmark: async (bookId) => {
    try {
      const response = await axios.post(
        `${API_URL}?bookId=${bookId}`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding book ID ${bookId} to bookmarks:`, error);
      throw error;
    }
  },

  // Remove a bookmark
  removeBookmark: async (bookmarkId) => {
    try {
      const response = await axios.delete(
        `${API_URL}?bookmarkId=${bookmarkId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error removing bookmark ID ${bookmarkId}:`, error);
      throw error;
    }
  }
};

export default bookmarkService; 