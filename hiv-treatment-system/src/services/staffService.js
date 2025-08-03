import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

class StaffService {
  constructor() {
    // Set up axios interceptors for authentication
    this.setupInterceptors();
  }

  setupInterceptors() {
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

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get appointments scheduled for today
   * @returns {Promise} List of today's appointments
   */
  async getTodayAppointments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/appointments/today`);
      return response.data;
    } catch (error) {
      console.error("Error getting today's appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all appointments with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Filter by status
   * @param {string} filters.date - Filter by date
   * @param {string} filters.searchTerm - Search by patient name or ID
   * @returns {Promise} List of appointments
   */
  async getAllAppointments(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/appointments`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error("Error getting appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Check in a patient for their appointment
   * @param {number} appointmentId - ID of the appointment
   * @returns {Promise} Updated appointment info
   */
  async checkInAppointment(appointmentId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/staff/appointments/${appointmentId}/checkin`
      );
      return response.data;
    } catch (error) {
      console.error(`Error checking in appointment ${appointmentId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get appointment details by ID
   * @param {number} appointmentId - ID of the appointment
   * @returns {Promise} Appointment details
   */
  async getAppointmentById(appointmentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/staff/appointments/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${appointmentId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update appointment status
   * @param {number} appointmentId - ID of the appointment
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Promise} Updated appointment
   */
  async updateAppointmentStatus(appointmentId, status, notes = "") {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/staff/appointments/${appointmentId}/status`,
        { status, notes }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${appointmentId} status:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get lab test requests
   * @param {Object} filters - Optional filters
   * @returns {Promise} Lab test requests
   */
  async getLabRequests(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/lab-requests`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error("Error getting lab requests:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors and format user messages
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error message
   */
  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.message || "Dữ liệu không hợp lệ");
        case 401:
          return new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
          );
        case 403:
          return new Error("Bạn không có quyền thực hiện thao tác này");
        case 404:
          return new Error("Không tìm thấy dữ liệu yêu cầu");
        case 409:
          return new Error(data.message || "Lỗi xung đột dữ liệu");
        case 500:
          return new Error("Lỗi server. Vui lòng thử lại sau");
        default:
          return new Error(data.message || "Có lỗi xảy ra. Vui lòng thử lại");
      }
    } else if (error.request) {
      return new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng"
      );
    } else {
      return new Error(error.message || "Có lỗi không xác định xảy ra");
    }
  }
}

const staffService = new StaffService();
export default staffService;