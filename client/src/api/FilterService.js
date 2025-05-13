import axios from 'axios';

// API URL should match the pattern used in other services (like bookService)
const API_URL = 'http://localhost:5129';

const filterService = {
    getFilteredBooks: async (filterType, filterValue = null) => {
        try {
            let endpoint;
            
            switch(filterType) {
                case 'language':
                    endpoint = `/filter/language/${filterValue}`;
                    break;
                case 'status':
                    endpoint = `/filter/status/${filterValue}`;
                    break;
                case 'category':
                    endpoint = `/filter/category/${filterValue}`;
                    break;
                case 'genre':
                    endpoint = `/filter/genre/${filterValue}`;
                    break;
                case 'format':
                    endpoint = `/filter/format/${filterValue}`;
                    break;
                case 'author':
                    endpoint = `/filter/author`;
                    break;
                case 'new-arrivals':
                    endpoint = `/filter/new-arrivals`;
                    break;
                case 'collectors':
                    endpoint = `/filter/collectors`;
                    break;
                case 'paperbacks':
                    endpoint = `/filter/paperbacks`;
                    break;
                case 'fantasy':
                    endpoint = `/filter/fantasy`;
                    break;
                case 'adventure':
                    endpoint = `/filter/adventure`;
                    break;
                case 'science':
                    endpoint = `/filter/science`;
                    break;
                case 'fiction':
                    endpoint = `/filter/fiction`;
                    break;
                case 'non-fiction':
                    endpoint = `/filter/nonfiction`;
                    break;
                default:
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

    getFilteredPapaerbacks : async() => {
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
            const response = await axios.get(`${API_URL}/filter/non-fiction`);
            return response.data;
        } catch (error) {
            console.error('Error fetching non-fiction books:', error);
            throw error;
        }
    },
}

export default filterService;