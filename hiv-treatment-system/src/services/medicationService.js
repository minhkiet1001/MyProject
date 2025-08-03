import axios from 'axios';

const API_URL = 'http://localhost:8080/api/medications';

/**
 * Service for handling medication-related API calls
 */
const medicationService = {
  /**
   * Get active medications for the current patient
   * Uses the patient-specific endpoint we created
   */
  async getPatientMedications() {
    try {
      const response = await axios.get(`${API_URL}/patient/medications`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get medication reminders for the current patient
   * Uses our new reminders endpoint
   */
  async getPatientReminders() {
    try {
      const response = await axios.get(`${API_URL}/patient/reminders`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all medications for a specific user
   * @param {number} userId - The ID of the user
   */
  async getUserMedications(userId) {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get active medications for a specific user
   * @param {number} userId - The ID of the user
   */
  async getActiveUserMedications(userId) {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}/active`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get medications for a specific treatment plan
   * @param {number} treatmentPlanId - The ID of the treatment plan
   */
  async getMedicationsByTreatmentPlan(treatmentPlanId) {
    try {
      const response = await axios.get(`${API_URL}/treatment-plan/${treatmentPlanId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get details of a specific medication
   * @param {number} medicationId - The ID of the medication
   */
  async getMedicationById(medicationId) {
    try {
      const response = await axios.get(`${API_URL}/${medicationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all reference medications (for doctors/staff)
   */
  async getAllMedications() {
    try {
      const response = await axios.get(`${API_URL}/reference`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Test authentication status
   * Useful for debugging token/permission issues
   */
  async testAuth() {
    try {
      const response = await axios.get(`${API_URL}/test-auth`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default medicationService; 