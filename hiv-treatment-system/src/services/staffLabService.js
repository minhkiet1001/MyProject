import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Service for handling staff lab requests and test results
 */
class StaffLabService {
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
          window.location.href = '/login';
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
        message: error.response.data.message || 'API Error',
        statusCode: error.response.status
      };
    }
    return {
      success: false,
      message: error.message || 'Network Error',
      statusCode: 500
    };
  }

  /**
   * Get all pending lab requests
   * @returns {Promise} All pending lab requests
   */
  async getPendingLabRequests() {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-requests/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending lab requests:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get lab requests assigned to the current staff
   * @param {number} staffId - Staff ID
   * @returns {Promise} Lab requests assigned to the staff
   */
  async getStaffLabRequests(staffId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-requests/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff lab requests:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get completed lab requests for a staff
   * @param {number} staffId - Staff ID
   * @returns {Promise} Completed lab requests for the staff
   */
  async getStaffCompletedLabRequests(staffId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-requests/staff/${staffId}/completed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed lab requests:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get rejected lab requests for a staff
   * @param {number} staffId - Staff ID
   * @returns {Promise} Rejected lab requests for the staff
   */
  async getStaffRejectedLabRequests(staffId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-requests/staff/${staffId}/rejected`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rejected lab requests:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Reactivate a rejected lab request
   * @param {number} requestId - Lab request ID
   * @returns {Promise} Updated lab request
   */
  async reactivateLabRequest(requestId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/lab-requests/${requestId}/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Error reactivating lab request:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get previous lab results for a rejected lab request
   * @param {number} requestId - Lab request ID
   * @returns {Promise} Previous lab results
   */
  async getPreviousLabResults(requestId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/lab/requests/${requestId}/previous-results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching previous lab results:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Assign a lab request to the staff
   * @param {number} requestId - Lab request ID
   * @param {number} staffId - Staff ID
   * @returns {Promise} Updated lab request
   */
  async assignLabRequest(requestId, staffId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/lab-requests/${requestId}/assign?staffId=${staffId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning lab request:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Submit test results for a lab request
   * @param {number} appointmentId - Appointment ID
   * @param {Object} testResult - Test result data
   * @returns {Promise} Created test result
   */
  async submitTestResult(appointmentId, testResult) {
    try {
      const response = await axios.post(`${API_BASE_URL}/doctor/lab-results`, {
        ...testResult,
        appointmentId: appointmentId
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting test result:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Complete a lab request
   * @param {number} requestId - Lab request ID
   * @returns {Promise} Updated lab request
   */
  async completeLabRequest(requestId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/lab-requests/${requestId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing lab request:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get test types
   * @returns {Promise} List of test types
   */
  async getTestTypes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/lab-results/test-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test types:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Submit test results and complete a lab request
   * @param {number} requestId - Lab request ID
   * @param {Array} results - Array of test results
   * @returns {Promise} Updated lab request
   */
  async submitTestResults(requestId, results) {
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/lab/requests/${requestId}/complete`, results);
      return {
        success: true,
        data: response.data,
        message: "Kết quả xét nghiệm đã được lưu thành công"
      };
    } catch (error) {
      console.error('Error submitting test results:', error);
      return this.handleApiError(error);
    }
  }
}

export default new StaffLabService(); 