import axios from 'axios';

// API URL for reviews
const API_URL = 'http://localhost:5129/api/ReviewContoller';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reviewService = {
  // Get all reviews
  getAllReviews: async () => {
    try {
      const response = await axios.get(`${API_URL}/GetAllReviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Get reviews for a specific book
  getReviewById: async (reviewId) => {
    try {
      const response = await axios.get(`${API_URL}/GetReviewsById?reviewID=${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review with ID ${reviewId}:`, error);
      throw error;
    }
  },
  
  // Get reviews for a specific book - this is the method used in IndividualBook.jsx
  getReviewsByBook: async (bookId) => {
    try{
      const response = await axios.get(`${API_URL}/GetReviewByBookId?bookID=${bookId}`);
      console.log(response);
      return response.data;
    }
    catch(error){
      console.error(`Error fetching reviews for book with ID ${bookId}:`, error);
      throw error;
    }
  },

  // Alias for getReviewsByBook for backward compatibility
  getReviewByBook: async (bookId) => {
    try{
      return await reviewService.getReviewsByBook(bookId);
    }
    catch(error){
      console.error(`Error fetching reviews for book with ID ${bookId}:`, error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (bookId, reviewData) => {
    try {
      const response = await axios.post(
        `${API_URL}?bookId=${bookId}`,
        reviewData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update an existing review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.put(
        `${API_URL}?reviewId=${reviewId}`,
        reviewData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating review with ID ${reviewId}:`, error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await axios.delete(
        `${API_URL}?reviewId=${reviewId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting review with ID ${reviewId}:`, error);
      throw error;
    }
  }
};

export default reviewService;
