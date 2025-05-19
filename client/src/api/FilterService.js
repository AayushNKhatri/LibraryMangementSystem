import axios from 'axios';

// API URL should match the pattern used in other services (like bookService)
const API_URL = 'http://localhost:5129';

const filterService = {
    getFilteredBooks: async (filterType, filterValue = null) => {
        try {
            let endpoint;
            
            // Handle different filter types
            if (['language', 'status', 'category', 'genre', 'format'].includes(filterType) && filterValue) {
                // These filters require a value parameter
                endpoint = `/filter/${filterType}/${filterValue}`;
            } else if (['author', 'new-arrivals', 'collectors', 'paperbacks', 'fantasy', 'adventure', 'science', 'fiction'].includes(filterType)) {
                // These filters don't require a value parameter
                endpoint = `/filter/${filterType}`;
            } else if (filterType === 'non-fiction') {
                // Special case for non-fiction (backend endpoint might be different)
                endpoint = `/filter/nonfiction`;
            } else {
                throw new Error(`Unknown filter type: ${filterType}`);
            }
            
            const response = await axios.get(`${API_URL}${endpoint}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching filtered books for ${filterType}:`, error);
            throw error;
        }
    },

    getFilteredAuthors : async () => {
        try {
            // Using direc
            const response = await axios.get(`${API_URL}/filter/author`);
            return response.data;
        } catch (error) {
            console.error('Error fetching authors:', error);
            throw error;
        }
    },

    getFilteredNewArrivals : async () => {
        try {
            const response = await axios.get(`${API_URL}/filter/new-arrivals`);
            return response.data;
        } catch (error) {
            console.error('Error fetching new arrivals:', error);
            throw error;
        }
    },

    getFilteredCollectors : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/collectors`);
            return response.data;
        } catch (error) {
            console.error('Error fetching collectors:', error);
            throw error;
        }
    },

    getFilteredPaperbacks : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/paperbacks`);
            return response.data;
        } catch (error) {
            console.error('Error fetching paperbacks:', error);
            throw error;
        }
    },

    getFilteredFantasy : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/fantasy`);
            return response.data;
        } catch (error) {
            console.error('Error fetching fantasy books:', error);
            throw error;
        }
    },

    getFilteredAdventure : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/adventure`);
            return response.data;
        } catch (error) {
            console.error('Error fetching adventure books:', error);
            throw error;
        }
    },

    getFilteredScience : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/science`);
            return response.data;
        } catch (error) {
            console.error('Error fetching science books:', error);
            throw error;
        }
    },

    getFilteredFiction : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/fiction`);
            return response.data;
        } catch (error) {
            console.error('Error fetching fiction books:', error);
            throw error;
        }
    },

    getFilteredNonFiction : async() => {
        try {
            const response = await axios.get(`${API_URL}/filter/nonfiction`);
            return response.data;
        } catch (error) {
            console.error('Error fetching non-fiction books:', error);
            throw error;
        }
    },
    
    // Helper method to get all available filter options
    getFilterOptions: async () => {
        try {
            const response = await axios.get(`${API_URL}/filter/options`);
            return response.data;
        } catch (error) {
            console.error('Error fetching filter options:', error);
            throw error;
        }
    },
}

export default filterService;