import axios from 'axios';

// Use environment variable if available, otherwise fallback to localhost
const API_URL = 'http://localhost:5129/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

      const response = await axios.post(
        `${API_URL}/Books/AddBooks`, 
        formattedData,
        { headers: getAuthHeader() }
      );
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

      const response = await axios.put(
        `${API_URL}/Books/${bookId}`, 
        formattedData,
        { headers: getAuthHeader() }
      );
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
      const response = await axios.delete(
        `${API_URL}/Books/${bookId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting book with ID ${bookId}:`, error);
      throw error;
    }
  },

  // Add book image
  addBookImage: async (bookId, imageData) => {
    try {
      const response = await axios.post(
        `${API_URL}/Books/BookImage/${bookId}`,
        imageData,
        { 
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding image for book with ID ${bookId}:`, error);
      throw error;
    }
  },

  // Update book image
  updateBookImage: async (bookId, imageData) => {
    try {
      const response = await axios.patch(
        `${API_URL}/Books/BookImage/${bookId}`,
        imageData,
        { 
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating image for book with ID ${bookId}:`, error);
      throw error;
    }
  }
};

export default bookService;
