import axios from 'axios';

const API_URL = 'http://localhost:5129/api/User';

const userService = {
    // Get current user profile data
    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post(
                `${API_URL}/Get-User`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Find the current user in the list
            // Assuming the API returns all users and we need to filter
            // based on the user ID in the token
            return response.data;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw error;
        }
    },

    // Update user profile
    updateUserProfile: async (userId, userData) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.put(
                `${API_URL}/update-user/${userId}`,
                userData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Register new user
    registerUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/Register-User`, userData);
            return response.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    // Login user
    loginUser: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/Login`, credentials);
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },
    
    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_URL}/Forgot-Password`, { email });
            return response.data;
        } catch (error) {
            console.error('Error requesting password reset:', error);
            throw error;
        }
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
        return localStorage.getItem('authToken') !== null;
    },
    
    // Logout user
    logout: () => {
        localStorage.removeItem('authToken');
    }
};

export default userService; 