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

      console.log('Sending book data to server:', formattedData);

      const response = await axios.post(
        `${API_URL}/Books/AddBooks`, 
        formattedData,
        { headers: getAuthHeader() }
      );

      console.log('Server response for addBook:', response);

      // Check the structure of the response to ensure we're returning the correct data
      const responseData = response.data;
      
      // If the response doesn't have a bookId property, try to extract it from the response
      if (responseData && typeof responseData === 'object' && !responseData.bookId && !responseData.BookId) {
        console.log('Book ID not found in expected format, full response:', responseData);
        
        // Look for any property that might contain the book ID
        if (responseData.BookId) return { ...responseData, bookId: responseData.BookId };
        if (responseData.bookID) return { ...responseData, bookId: responseData.bookID };
        if (responseData.BookID) return { ...responseData, bookId: responseData.BookID };
        
        // If we have a property called 'Book' that contains the ID
        if (responseData.Book && responseData.Book.BookId) {
          return { ...responseData, bookId: responseData.Book.BookId };
        }
      }
      
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
      if (!bookId) {
        console.error('Cannot add image: Book ID is null or undefined');
        throw new Error('Book ID is required to add an image');
      }

      console.log(`Adding image for book with ID: ${bookId}`);
      console.log('Image data:', imageData.get('image') ? 'Image file present' : 'No image file');

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
      
      console.log('Image upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding image for book with ID ${bookId}:`, error);
      if (error.response) {
        console.error('Server response for image upload error:', error.response.data);
        console.error('Status code:', error.response.status);
      }
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
