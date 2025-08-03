import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Service for handling doctor-related API calls
 */
class DoctorService {
  constructor() {
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

    // Response interceptor to handle authentication errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          authService.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Helper method to handle API errors
   */
  handleApiError(error) {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || "API Error",
        statusCode: error.response.status,
      };
    }
    return {
      success: false,
      message: error.message || "Network Error",
      statusCode: 500,
    };
  }

  /**
   * Get doctor profile by user ID
   * @param {number} userId - User ID of the doctor
   * @returns {Promise} Doctor profile data
   */
  async getDoctorProfile(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/my-profile`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all patients for a doctor
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} List of patients
   */
  async getPatients(doctorId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patients/doctor/${doctorId}`
      );
      return {
        success: true,
        data: response.data.data || response.data,
        message: "Patients retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching patients:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Search patients by doctor
   * @param {number} doctorId - Doctor ID
   * @param {string} searchTerm - Search term
   * @returns {Promise} List of patients matching search term
   */
  async searchPatients(doctorId, searchTerm) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patients/doctor/${doctorId}/search`,
        {
          params: { searchTerm },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching patients:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get patient details
   * @param {number} patientId - Patient ID
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Patient details
   */
  async getPatientDetails(patientId, doctorId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patients/${patientId}/doctor/${doctorId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching patient details:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update patient health status
   * @param {number} patientId - Patient ID
   * @param {number} doctorId - Doctor ID
   * @param {string} status - Health status ('stable', 'critical', 'attention', etc.)
   * @param {string} notes - Health notes
   * @returns {Promise} Update result
   */
  async updatePatientHealthStatus(patientId, doctorId, status, notes) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/patients/${patientId}/doctor/${doctorId}/health-status`,
        {
          healthStatus: status,
          notes: notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating patient health status:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get upcoming appointments for doctor
   * @param {number} doctorId - Doctor ID
   * @param {number} limit - Maximum number of appointments to retrieve
   * @returns {Promise} Upcoming appointments
   */
  async getUpcomingAppointments(doctorId, limit = 10) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/${doctorId}`
      );
      // Filter for upcoming appointments on the client side
      const appointments = response.data;
      if (appointments.success && appointments.data) {
        const upcomingAppointments = appointments.data
          .filter((appt) => {
            const appointmentDate = new Date(appt.date);
            return appointmentDate >= new Date();
          })
          .slice(0, limit);

        return {
          ...appointments,
          data: upcomingAppointments,
        };
      }
      return appointments;
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get today's appointments for doctor
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Today's appointments
   */
  async getTodayAppointments(doctorId) {
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/${doctorId}/date`,
        {
          params: {
            date: `${formattedDate}T00:00:00`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching today appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get doctor's monthly work schedule
   * @param {number} doctorId - Doctor ID
   * @param {number} year - Year (e.g. 2023)
   * @param {number} month - Month (1-12)
   * @returns {Promise} Monthly work schedule
   */
  async getDoctorMonthlySchedule(doctorId, year, month) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor-schedules/doctor/${doctorId}/month`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor monthly schedule:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get patient health status color
   * @param {string} status - Health status
   * @returns {string} CSS class for status color
   */
  getPatientStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "attention":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  /**
   * Get patient health status text in Vietnamese
   * @param {string} status - Health status
   * @returns {string} Status text in Vietnamese
   */
  getPatientStatusText(status) {
    switch (status?.toLowerCase()) {
      case "stable":
        return "Ổn định";
      case "attention":
        return "Cần chú ý";
      case "critical":
        return "Nguy hiểm";
      case "new":
        return "Bệnh nhân mới";
      case "inactive":
        return "Không hoạt động";
      default:
        return status || "Không xác định";
    }
  }
}

export default new DoctorService();
