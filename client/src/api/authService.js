import axios from 'axios';

const API_URL = 'http://localhost:5129/api/User';

const authService = {
    login: async (loginData) => {
        try {
            const response = await axios.post(`${API_URL}/Login`, loginData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/Register-User`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_URL}/Forgot-Password`, { Email: email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (email, newPassword, token) => {
        try {
            const response = await axios.post(`${API_URL}/request-password-reset?token=${token}`, {
                Email: email,
                NewPassword: newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Helper function to get the current user's token
    getToken: () => {
        return localStorage.getItem('authToken');
    },

    // Helper function to check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },

    // Helper function to check if user is admin
    isAdmin: () => {
        return localStorage.getItem('isAdmin') === 'true';
    },

    // Helper function to logout
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    }
};

// Add an axios interceptor to add the auth token to all requests
axios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default authService;
