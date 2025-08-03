import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Service for handling doctor lab result-related API calls
 */
class DoctorLabResultService {
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
   * Get lab results with optional filters
   * @param {string} testType - Optional test type filter
   * @param {string} patientId - Optional patient ID filter
   * @param {string} searchTerm - Optional search term
   * @returns {Promise} Filtered lab results
   */
  async getLabResults(testType = null, patientId = null, searchTerm = null) {
    try {
      let url = `${API_BASE_URL}/doctor/lab-results`;

      // Add query parameters if provided
      const params = new URLSearchParams();
      if (testType) params.append("testType", testType);
      if (patientId) params.append("patientId", patientId);
      if (searchTerm) params.append("searchTerm", searchTerm);

      // Append params to URL if any exist
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await axios.get(url);
      return {
        success: true,
        data: response.data.data,
        message: "Lab results retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching lab results with filters:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get lab result by ID
   * @param {number} resultId - Lab result ID
   * @returns {Promise} Lab result details
   */
  async getLabResultById(resultId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/${resultId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: "Lab result retrieved successfully",
      };
    } catch (error) {
      console.error(`Error fetching lab result ${resultId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Update a lab result
   * @param {number} resultId - Lab result ID
   * @param {Object} labResultData - Lab result data
   * @returns {Promise} Updated lab result
   */
  async updateLabResult(resultId, labResultData) {
    try {
      // Format and validate dates
      if (labResultData.testDate) {
        // Ensure test date is not in the future (to comply with DB constraint)
        const testDate = new Date(labResultData.testDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day

        if (testDate > today) {
          console.error("Test date cannot be in the future");
          return {
            success: false,
            message: "Ngày xét nghiệm không thể là ngày trong tương lai",
          };
        }

        labResultData.testDate = testDate.toISOString().split("T")[0];
      }

      const response = await axios.put(
        `${API_BASE_URL}/doctor/lab-results/${resultId}`,
        labResultData
      );
      return {
        success: true,
        data: response.data.data,
        message: "Lab result updated successfully",
      };
    } catch (error) {
      console.error(`Error updating lab result ${resultId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Delete a lab result
   * @param {number} resultId - Lab result ID
   * @returns {Promise} Result of delete operation
   */
  async deleteLabResult(resultId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/doctor/lab-results/${resultId}`
      );
      return {
        success: true,
        message: response.data.message || "Lab result deleted successfully",
      };
    } catch (error) {
      console.error(`Error deleting lab result ${resultId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get test types
   * @returns {Promise} List of test types
   */
  async getTestTypes() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/test-types`
      );
      return {
        success: true,
        data: response.data.data,
        message: "Test types retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching test types:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get lab result statistics for doctor
   * @returns {Promise} Lab result statistics
   */
  async getLabResultStatistics() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/statistics`
      );
      return {
        success: true,
        data: response.data.data,
        message: "Lab result statistics retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching lab result statistics:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Check if lab results exist for an appointment
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Boolean indicating if lab results exist
   */
  async checkLabResultsForAppointment(appointmentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/check-appointment/${appointmentId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error(
        `Error checking lab results for appointment ${appointmentId}:`,
        error
      );
      return this.handleApiError(error);
    }
  }

  /**
   * Get patient lab results
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient lab results
   */
  async getPatientLabResults(patientId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/patients/${patientId}`
      );
      return {
        success: true,
        data: response.data.data,
        message: "Patient lab results retrieved successfully",
      };
    } catch (error) {
      console.error(
        `Error fetching lab results for patient ${patientId}:`,
        error
      );
      return this.handleApiError(error);
    }
  }

  /**
   * Get pending lab results that need doctor approval
   * @returns {Promise} Pending lab results
   */
  async getPendingLabResults() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/admin/pending`
      );
      return {
        success: true,
        data: response.data.data,
        message: "Pending lab results retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching pending lab results:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get pending lab results for the doctor's patients only
   * @returns {Promise} Pending lab results for doctor's patients
   */
  async getPendingLabResultsForDoctorPatients() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/pending`
      );
      return {
        success: true,
        data: response.data.data,
        message:
          "Pending lab results for doctor patients retrieved successfully",
      };
    } catch (error) {
      console.error(
        "Error fetching pending lab results for doctor patients:",
        error
      );
      return this.handleApiError(error);
    }
  }

  /**
   * Approve a lab result
   * @param {number} resultId - Lab result ID
   * @param {string} notes - Optional approval notes
   * @returns {Promise} Approved lab result
   */
  async approveLabResult(resultId, notes = "") {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/doctor/lab-results/${resultId}/approve`,
        { notes }
      );
      return {
        success: true,
        data: response.data.data,
        message: "Lab result approved successfully",
      };
    } catch (error) {
      console.error(`Error approving lab result ${resultId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Reject a lab result
   * @param {number} resultId - Lab result ID
   * @param {string} notes - Rejection reason
   * @returns {Promise} Rejected lab result
   */
  async rejectLabResult(resultId, notes) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/doctor/lab-results/${resultId}/reject`,
        { notes }
      );
      return {
        success: true,
        data: response.data.data,
        message: "Lab result rejected successfully",
      };
    } catch (error) {
      console.error(`Error rejecting lab result ${resultId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get appointments with approved lab results
   * @returns {Promise} Appointments with approved lab results
   */
  async getAppointmentsWithApprovedLabResults() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/doctor/lab-results/appointments-with-approved-results`
      );
      return {
        success: true,
        data: response.data.data || [],
        message:
          "Appointments with approved lab results retrieved successfully",
      };
    } catch (error) {
      console.error(
        "Error fetching appointments with approved lab results:",
        error
      );
      return this.handleApiError(error);
    }
  }
}

const doctorLabResultService = new DoctorLabResultService();
export default doctorLabResultService;
