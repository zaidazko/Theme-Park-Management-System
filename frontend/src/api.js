import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const authAPI = {
  getEmployeeLogin: async (employeeId) => {
    const response = await axios.get(
      `${API_BASE_URL}/auth/employee-login/${employeeId}`
    );
    return response.data;
  },
  getCustomerLogin: async (customerId) => {
    const response = await axios.get(
      `${API_BASE_URL}/auth/customer-login/${customerId}`
    );
    return response.data;
  },
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

  // Add new ride
  createRide: async (rideData) => {
    const response = await axios.post(`${API_BASE_URL}/rides`, rideData);
    return response.data;
  },

  deleteRide: async (rideId) => {
    const response = await axios.delete(`${API_BASE_URL}/rides/${rideId}`);
    return response.data;
  },

  updateRideData: async (rideId, rideData) => {
    const response = await axios.put(
      `${API_BASE_URL}/rides/${rideId}`,
      rideData
    );
    return response.data;
  }
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

  completeMaintenanceRequest: async (requestId, workDetails) => {
    const response = await axios.put(
      `${API_BASE_URL}/maintenancerequest/${requestId}/complete`,
      { workDetails: workDetails }
    );
    return response.data;
  },

  assignMaintenanceRequest: async (requestId, employeeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/maintenancerequest/${requestId}/assign`,
      { assignedTo: employeeId }
    );
    return response.data;
  },

  getMaintenanceRequestsAssignedToEmployee: async (employeeId) => {
    const response = await axios.get(
      `${API_BASE_URL}/maintenancerequest/assigned/${employeeId}`
    );
    return response.data;
  },

  cancelMaintenanceRequest: async (requestId) => {
    const response = await axios.put(
      `${API_BASE_URL}/maintenancerequest/${requestId}/cancel`
    );
    return response.data;
  },

  getMaintenanceLogsByRequestId: async (requestId) => {
    const response = await axios.get(
      `${API_BASE_URL}/maintenancerequest/${requestId}/logs`
    );
    return response.data;
  },
};

export const ticketAPI = {
  getTicketTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/ticket/types`);
    return response.data;
  },

  getDiscontinuedTicketTypes: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/ticket/types/discontinued`
    );
    return response.data;
  },

  createTicketType: async (ticketData) => {
    const response = await axios.post(
      `${API_BASE_URL}/ticket/types`,
      ticketData
    );
    return response.data;
  },

  updateTicketType: async (ticketTypeId, ticketData) => {
    const response = await axios.put(
      `${API_BASE_URL}/ticket/types/${ticketTypeId}`,
      ticketData
    );
    return response.data;
  },

  deleteTicketType: async (ticketTypeId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/ticket/types/${ticketTypeId}`
    );
    return response.data;
  },

  restoreTicketType: async (ticketTypeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/ticket/types/${ticketTypeId}/restore`
    );
    return response.data;
  },

  permanentlyDeleteTicketType: async (ticketTypeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/ticket/types/${ticketTypeId}/delete`
    );
    return response.data;
  },
};

export const commodityAPI = {
  getCommodityTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/commodity/types`);
    return response.data;
  },

  getDiscontinuedCommodityTypes: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/commodity/types/discontinued`
    );
    return response.data;
  },

  createCommodityType: async (commodityData) => {
    const response = await axios.post(
      `${API_BASE_URL}/commodity/types`,
      commodityData
    );
    return response.data;
  },

  updateCommodityType: async (commodityTypeId, commodityData) => {
    const response = await axios.put(
      `${API_BASE_URL}/commodity/types/${commodityTypeId}`,
      commodityData
    );
    return response.data;
  },

  deleteCommodityType: async (commodityTypeId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/commodity/types/${commodityTypeId}`
    );
    return response.data;
  },

  restoreCommodityType: async (commodityTypeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/commodity/types/${commodityTypeId}/restore`
    );
    return response.data;
  },

  permanentlyDeleteCommodityType: async (commodityTypeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/commodity/types/${commodityTypeId}/delete`
    );
    return response.data;
  },
};

export const menuAPI = {
  getMenuTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/menu/types`);
    return response.data;
  },

  getDiscontinuedMenuTypes: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/menu/types/discontinued`
    );
    return response.data;
  },

  createMenuType: async (menuData) => {
    const response = await axios.post(
      `${API_BASE_URL}/menu/types`,
      menuData
    );
    return response.data;
  },

  updateMenuType: async (menuTypeId, menuData) => {
    const response = await axios.put(
      `${API_BASE_URL}/menu/types/${menuTypeId}`,
      menuData
    );
    return response.data;
  },

  deleteMenuType: async (menuTypeId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/menu/types/${menuTypeId}`
    );
    return response.data;
  },

  restoreMenuType: async (menuTypeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/menu/types/${menuTypeId}/restore`
    );
    return response.data;
  },

  permanentlyDeleteMenuType: async (menuTypeId) => {
    const response = await axios.put(
      `${API_BASE_URL}/menu/types/${menuTypeId}/delete`
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

export const ReviewsAPI = {
  createReview: async (reviewData) => {
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await axios.get(`${API_BASE_URL}/reviews/ride`);
    return response.data;
  },
  
  deleteReview: async (reviewId) => {
    const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
    return response.data;
  },

  updateReviewData: async (reviewId, reviewData) => {
    const response = await axios.put(
      `${API_BASE_URL}/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  }
};

export const weatherAPI = {
  getLatestWeather: async () => {
    const response = await axios.get(`${API_BASE_URL}/weather`);
    return response.data;
  },

  updateWeather: async (weatherData) => {
    const response = await axios.post(`${API_BASE_URL}/weather`, weatherData);
    return response.data;
  },
};
