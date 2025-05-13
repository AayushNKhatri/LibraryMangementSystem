import axios from 'axios';

// API URL should match the pattern used in other services (like bookService)
const API_URL = 'http://localhost:5129';

const filterService = {
    getFilteredAuthors : async () => {
        try {
            // Using direc
            const response = await axios.get(`${API_URL}/filter/author`);
            return response.data;
        } catch (error) {
            console.error('Error fetching authors:', error);
            throw error;
        }
    }
}

export default filterService;