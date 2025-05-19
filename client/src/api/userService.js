import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api_url = "http://localhost:5129/api/user";

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
  // Simplified check for logged in status
  isLoggedIn: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Get user role from token (keep this for role-based permissions)
  getUserRoleFromToken: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.role || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Get current user data - no need for userId, token contains it
  getUserById: async () => {
    try {
      const response = await axios.get(`${api_url}/Get-User-By-Id`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("User by ID not fetched:", error);
      throw error;
    }
  },
  
  // Method to get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${api_url}/Get-User`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },
  
  // Simplified updateUserProfile - no need for userId param
  updateUserProfile: async (userData) => {
    try {
      const response = await axios.put(
        `${api_url}/update-user`, 
        userData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("User profile not updated:", error);
      throw error;
    }
  },
  
  // Add method for password reset request
  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post(
        `${api_url}/Forgot-Password`,
        { email }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to request password reset:", error);
      throw error;
    }
  },
  
  // Add method for resetting password
  resetPassword: async (resetData, token) => {
    try {
      // Format the data according to what the backend expects (ResetPasswordDto)
      const formattedData = {
        Email: resetData.email,
        NewPassword: resetData.newPassword
      };
      
      const response = await axios.post(
        `${api_url}/request-password-reset?token=${token}`,
        formattedData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  },
  
  // Add user registration method
  registerUser: async (userData) => {
    try {
      const response = await axios.post(
        `${api_url}/Register-User`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("User registration failed:", error);
      throw error;
    }
  },
  
  // Add user login method
  loginUser: async (credentials) => {
    try {
      const response = await axios.post(
        `${api_url}/Login`,
        credentials
      );
      
      // Store the token in localStorage
      localStorage.setItem('authToken', response.data);
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },
  
  // Add logout method
  logout: () => {
    localStorage.removeItem('authToken');
  }
};

export default userService;
