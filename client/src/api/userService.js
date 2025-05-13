import axios from "axios";

const api_url = "http://localhost:5129/api/user";

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
  getUserById: async () => {
    try {
      const response = await axios.get(`${api_url}/Get-User-By-Id`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("User by ID not fetched:", error);
      throw error; // Ensure the error is propagated properly
    }
  },
  updateUser: async (userId) => {
    try {
      const response = await axios.put(`${api_url}/update-user/${userId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("User not updated", error);
      throw error;
    }
  },
};

export default userService;
