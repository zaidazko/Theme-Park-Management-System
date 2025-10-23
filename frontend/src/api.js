import axios from "axios";

const API_BASE_URL = "http://localhost:5239/api";

export const authAPI = {
  register: async (userData) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      userData
    );
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      credentials
    );
    return response.data;
  },

  getProfile: async (customerId) => {
    const response = await axios.get(
      `${API_BASE_URL}/auth/profile/${customerId}`
    );
    return response.data;
  },

  updateProfile: async (customerId, profileData) => {
    const response = await axios.put(
      `${API_BASE_URL}/auth/profile/${customerId}`,
      profileData
    );
    return response.data;
  },

  getAllCustomers: async () => {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    return response.data;
  },

  deleteCustomer: async (customerId) => {
    const response = await axios.delete(`${API_BASE_URL}/customers/${customerId}`);
    return response.data;
  },
};
