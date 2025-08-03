import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Service for handling lab result-related API calls for doctors
 */
class LabResultService {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Add request interceptor to attach JWT token
    axios.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all lab results for patients of the doctor
   * @param {string} doctorId - Doctor ID to filter results by their patients
   * @param {string} testType - Optional test type filter
   * @param {string} patientId - Optional patient ID filter
   * @param {string} searchTerm - Optional search term
   * @returns {Promise} List of lab results
   */
  async getLabResults(doctorId = null, testType = null, patientId = null, searchTerm = null) {
    try {
      const params = {};
      if (doctorId) params.doctorId = doctorId;
      if (testType && testType !== 'all') params.testType = testType;
      if (patientId && patientId !== 'all') params.patientId = patientId;
      if (searchTerm) params.searchTerm = searchTerm;

      const response = await axios.get(`${API_BASE_URL}/doctor/lab-results`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get lab result by ID
   * @param {number} id - Lab result ID
   * @param {number} doctorId - Doctor ID to verify the result belongs to doctor's patient
   * @returns {Promise} Lab result details
   */
  async getLabResultById(id, doctorId) {
    try {
      // Get the current user to extract doctorId if not provided
      if (!doctorId) {
        const user = authService.getCurrentUser();
        doctorId = user?.doctorId;
      }
      
      const params = doctorId ? { doctorId } : {};
      const response = await axios.get(`${API_BASE_URL}/doctor/lab-results/${id}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lab result details:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create a new lab result
   * @param {object} labResultData - Lab result data
   * @returns {Promise} Created lab result
   */
  async createLabResult(labResultData) {
    try {
      // Ensure doctorId is included in the data
      if (!labResultData.doctorId) {
        const user = authService.getCurrentUser();
        if (user?.doctorId) {
          labResultData.doctorId = user.doctorId;
        }
      }
      
      const response = await axios.post(`${API_BASE_URL}/doctor/lab-results`, labResultData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating lab result:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update an existing lab result
   * @param {number} id - Lab result ID
   * @param {object} labResultData - Updated lab result data
   * @returns {Promise} Updated lab result
   */
  async updateLabResult(id, labResultData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/doctor/lab-results/${id}`, labResultData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating lab result:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete a lab result
   * @param {number} id - Lab result ID
   * @returns {Promise} Success message
   */
  async deleteLabResult(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/doctor/lab-results/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lab result:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get all test types for lab results
   * @returns {Promise} List of test types
   */
  async getTestTypes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/lab-results/test-types`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching test types:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleApiError(error) {
    if (error.response) {
      // Server responded with an error status
      const serverError = error.response.data;
      return {
        status: error.response.status,
        message: serverError.message || 'An error occurred',
        errors: serverError.errors || []
      };
    } else if (error.request) {
      // No response received
      return {
        status: 0,
        message: 'No response from server. Please check your connection.'
      };
    } else {
      // Request setup error
      return {
        status: 0,
        message: error.message || 'An unknown error occurred'
      };
    }
  }
}

export default new LabResultService(); 