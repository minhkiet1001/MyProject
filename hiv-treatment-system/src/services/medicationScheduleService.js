import axios from 'axios';

const API_URL = 'http://localhost:8080/api/medication-schedules';

/**
 * Service for handling medication schedule-related API calls
 */
const medicationScheduleService = {
  /**
   * Get all schedules for a specific medication
   * @param {number} medicationId - The ID of the medication
   */
  async getSchedulesForMedication(medicationId) {
    try {
      const response = await axios.get(`${API_URL}/medication/${medicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication schedules:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create default schedules for a medication based on its frequency
   * @param {number} medicationId - The ID of the medication
   */
  async createDefaultSchedules(medicationId) {
    try {
      const response = await axios.post(`${API_URL}/medication/${medicationId}/default`);
      return response.data;
    } catch (error) {
      console.error('Error creating default schedules:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create custom schedules for a medication
   * @param {number} medicationId - The ID of the medication
   * @param {Array} schedules - Array of schedule objects
   */
  async createCustomSchedules(medicationId, schedules) {
    try {
      const response = await axios.post(`${API_URL}/medication/${medicationId}/custom`, schedules);
      return response.data;
    } catch (error) {
      console.error('Error creating custom schedules:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a medication schedule
   * @param {number} scheduleId - The ID of the schedule
   * @param {Object} scheduleData - The updated schedule data
   */
  async updateSchedule(scheduleId, scheduleData) {
    try {
      const response = await axios.put(`${API_URL}/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a medication schedule
   * @param {number} scheduleId - The ID of the schedule
   */
  async deleteSchedule(scheduleId) {
    try {
      const response = await axios.delete(`${API_URL}/${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark a medication as taken
   * @param {number} scheduleId - The ID of the schedule
   */
  async markAsTaken(scheduleId) {
    try {
      const response = await axios.put(`${API_URL}/${scheduleId}/taken`);
      return response.data;
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default medicationScheduleService; 