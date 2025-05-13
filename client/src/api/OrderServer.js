import axios from "axios";

const API_URL = "http://localhost:5129/api/order";

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const orderService = {
  getCartItems: async () => {
    try {
      const response = await axios.get(`${API_URL}/Get-user-cart`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching cart items", error);
      throw error;
    }
  },
  getOrderSummary: async () => {
    try {
      const response = await axios.get(`${API_URL}/get-cart-summary`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching cart summary", error);
      throw error;
    }
  },
  addOrder: async () => {
    try {
      const response = await axios.post(`${API_URL}/Add Order`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error adding items in cart", error);
      throw error;
    }
  },
  getOrder: async () => {
    try {
      const response = await axios.get(`${API_URL}/Get-orders`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Orders not fetched", error);
      throw error;
    }
  },
  getOrderById: async () => {
    try {
      const response = await axios.get(`${API_URL}/Get-orders-by-id`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Orders not fetched", error);
      throw error;
    }
  },
  increaseCartItmes: async (bookId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/Increase-cartitem/${bookId}`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error Increasing cart items", error);
      throw error;
    }
  },
  decreaseCartItems: async (bookId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/decrease-cartitem/${bookId}`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error decreasing cart items", error);
      throw error;
    }
  },
  removeCartItems: async (bookId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/remove-cartitem/${bookId}`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error removing cart items", error);
      throw error;
    }
  },
  completeOrder: async () => {
    try {
      const response = await axios.patch(`${API_URL}/complete-Order`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error completing order", error);
      throw error;
    }
  },
  cancelOrder: async () => {
    try {
      const response = await axios.patch(`${API_URL}/cancel-order`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error cancelling order", error);
    }
  },
  addCartItems: async (BookId) => {
    try {
      const response = await axios.post(`${API_URL}/Add-To-Cart/${BookId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
export default orderService;
