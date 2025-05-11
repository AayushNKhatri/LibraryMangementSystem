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
      const response = await axios.post(`${API_URL}/Books/AddBooks`, bookData);
      return response.data;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  },
  
  updateBook: async (bookId, bookData) => {
    try {
      const response = await axios.put(`${API_URL}/Books/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book with ID ${bookId}:`, error);
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