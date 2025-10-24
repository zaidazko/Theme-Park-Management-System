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

  registerEmployee: async (employeeData) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register-employee`,
      employeeData
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

  getProfile: async (userId, userType = "Customer") => {
    const response = await axios.get(
      `${API_BASE_URL}/auth/profile/${userId}?userType=${userType}`
    );
    return response.data;
  },

  updateProfile: async (userId, profileData, userType = "Customer") => {
    const response = await axios.put(
      `${API_BASE_URL}/auth/profile/${userId}?userType=${userType}`,
      profileData
    );
    return response.data;
  },

  getAllCustomers: async () => {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    return response.data;
  },

  deleteCustomer: async (customerId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/customers/${customerId}`
    );
    return response.data;
  },
};

export const ridesAPI = {
  // Get all rides
  getAllRides: async () => {
    const response = await axios.get(`${API_BASE_URL}/rides`);
    return response.data;
  },

  // Update ride status only
  updateRideStatus: async (rideId, status) => {
    const currentRide = await ridesAPI.getAllRides();
    const ride = currentRide.find((r) => r.ride_ID == rideId);

    const response = await axios.put(`${API_BASE_URL}/rides/${rideId}`, {
      Ride_ID: rideId,
      Ride_Name: ride.ride_Name,
      Capacity: ride.capacity,
      Status: status,
    });
    return response.data;
  },
};

export const employeeAPI = {
  getAllEmployees: async () => {
    const response = await axios.get(`${API_BASE_URL}/employee`);
    return response.data;
  },

  getEmployee: async (employeeId) => {
    const response = await axios.get(`${API_BASE_URL}/employee/${employeeId}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await axios.post(`${API_BASE_URL}/employee`, employeeData);
    return response.data;
  },

  updateEmployee: async (employeeId, employeeData) => {
    const response = await axios.put(
      `${API_BASE_URL}/employee/${employeeId}`,
      employeeData
    );
    return response.data;
  },

  deleteEmployee: async (employeeId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/employee/${employeeId}`
    );
    return response.data;
  },

  getAllDepartments: async () => {
    const response = await axios.get(`${API_BASE_URL}/department`);
    return response.data;
  },

  getDepartment: async (departmentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/department/${departmentId}`
    );
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await axios.post(
      `${API_BASE_URL}/department`,
      departmentData
    );
    return response.data;
  },

  updateDepartment: async (departmentId, departmentData) => {
    const response = await axios.put(
      `${API_BASE_URL}/department/${departmentId}`,
      departmentData
    );
    return response.data;
  },

  deleteDepartment: async (departmentId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/department/${departmentId}`
    );
    return response.data;
  },

  getAllRoles: async () => {
    const response = await axios.get(`${API_BASE_URL}/role`);
    return response.data;
  },

  getRole: async (roleId) => {
    const response = await axios.get(`${API_BASE_URL}/role/${roleId}`);
    return response.data;
  },

  createRole: async (roleData) => {
    const response = await axios.post(`${API_BASE_URL}/role`, roleData);
    return response.data;
  },

  updateRole: async (roleId, roleData) => {
    const response = await axios.put(
      `${API_BASE_URL}/role/${roleId}`,
      roleData
    );
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await axios.delete(`${API_BASE_URL}/role/${roleId}`);
    return response.data;
  },
};

export const maintenanceRequestAPI = {
  createMaintenanceRequest: async (requestData) => {
    const response = await axios.post(
      `${API_BASE_URL}/maintenancerequest`,
      requestData
    );
    return response.data;
  },

  getAllMaintenanceRequests: async () => {
    const response = await axios.get(`${API_BASE_URL}/maintenancerequest`);
    return response.data;
  },

  getMaintenanceRequest: async (requestId) => {
    const response = await axios.get(
      `${API_BASE_URL}/maintenancerequest/${requestId}`
    );
    return response.data;
  },

  getMaintenanceRequestsByStatus: async (status) => {
    const response = await axios.get(
      `${API_BASE_URL}/maintenancerequest/status/${status}`
    );
    return response.data;
  },

  completeMaintenanceRequest: async (requestId) => {
    const response = await axios.put(
      `${API_BASE_URL}/maintenancerequest/${requestId}/complete`
    );
    return response.data;
  },
};

export const UserPermissionsAPI = {
  getAllAccounts: async () => {
    const response = await axios.get(`${API_BASE_URL}/user_login`);
    return response.data;
  },
};
