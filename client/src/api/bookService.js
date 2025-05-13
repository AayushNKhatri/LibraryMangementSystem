import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = 'http://localhost:5129/api';

const bookService = {
  getAllBooks: async () => {
    try {
      const response = await axios.get(`${API_URL}/Books`);
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  getBookById: async (bookId) => {
    try {
      const response = await axios.get(`${API_URL}/Books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book with ID ${bookId}:`, error);
      throw error;
    }
  },

  addBook: async (bookData) => {
    try {
      // Ensure dates are in proper ISO format
      const formattedData = {
        ...bookData,
        publicationDate: new Date(bookData.publicationDate).toISOString(),
        createdDate: new Date().toISOString(),
        discoundStartDate: bookData.isOnSale ? new Date(bookData.discoundStartDate).toISOString() : new Date().toISOString(),
        discoundEndDate: bookData.isOnSale ? new Date(bookData.discoundEndDate).toISOString() : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      };

      const response = await axios.post(`${API_URL}/Books/AddBooks`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error adding book:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  updateBook: async (bookId, bookData) => {
    try {
      // Ensure dates are in proper ISO format
      const formattedData = {
        ...bookData,
        publicationDate: new Date(bookData.publicationDate).toISOString(),
        discoundStartDate: bookData.isOnSale ? new Date(bookData.discoundStartDate).toISOString() : new Date().toISOString(),
        discoundEndDate: bookData.isOnSale ? new Date(bookData.discoundEndDate).toISOString() : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      };

      const response = await axios.put(`${API_URL}/Books/${bookId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book with ID ${bookId}:`, error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  deleteBook: async (bookId) => {
    try {
      const response = await axios.delete(`${API_URL}/Books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting book with ID ${bookId}:`, error);
      throw error;
    }
  }
};

export default bookService;
