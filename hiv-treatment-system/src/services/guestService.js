import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * GuestService - Service for public/guest users to access doctor and schedule information
 * 
 * This class provides methods for accessing public doctor information and schedules
 * without requiring authentication, for use in guest/public pages.
 */
class GuestService {
  /**
   * Get all active doctors
   * @returns {Promise} List of doctors
   */
  async getAllDoctors() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Doctors retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get doctors with available schedules
   * @returns {Promise} List of available doctors
   */
  async getAvailableDoctors() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/available`);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Available doctors retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get doctors by specialty
   * @param {string} specialty - Doctor specialty code
   * @returns {Promise} List of doctors with the specified specialty
   */
  async getDoctorsBySpecialty(specialty) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/specialty/${specialty}`);
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Doctors by specialty retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching doctors by specialty:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get a specific doctor by ID
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Doctor details
   */
  async getDoctorById(doctorId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`);
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || 'Doctor retrieved successfully'
      };
    } catch (error) {
      console.error(`Error fetching doctor ${doctorId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Search doctors by keyword
   * @param {string} keyword - Search term
   * @returns {Promise} List of doctors matching search term
   */
  async searchDoctors(keyword) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/search`, {
        params: { keyword }
      });
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Doctors search completed successfully'
      };
    } catch (error) {
      console.error('Error searching doctors:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get available time slots for a doctor on a specific date
   * @param {number} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {number} serviceId - Service ID (optional)
   * @returns {Promise} List of available time slots
   */
  async getAvailableSlots(doctorId, date, serviceId = null) {
    try {
      const response = await axios.get(`${API_BASE_URL}/schedules/available-slots`, {
        params: {
          doctorId,
          date,
          serviceId
        }
      });
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Available slots retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get available dates for a doctor (dates that have schedules)
   * @param {number} doctorId - Doctor ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} List of available dates
   */
  async getAvailableDates(doctorId, startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/schedules/available-dates`, {
        params: {
          doctorId,
          startDate,
          endDate
        }
      });
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Available dates retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching available dates:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Check if a specific time slot is available
   * @param {number} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} time - Time (HH:MM)
   * @param {number} serviceId - Service ID (optional)
   * @returns {Promise} Whether the slot is available
   */
  async checkSlotAvailability(doctorId, date, time, serviceId = null) {
    try {
      const response = await axios.get(`${API_BASE_URL}/schedules/check-availability`, {
        params: {
          doctorId,
          date,
          time,
          serviceId
        }
      });
      return {
        success: true,
        data: response.data.data || false,
        message: response.data.message || 'Slot availability checked successfully'
      };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Handle API errors and return standardized error response
   * @param {Error} error - Error object from axios
   * @returns {Object} Standardized error response
   */
  handleApiError(error) {
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'API Error',
        statusCode: error.response.status,
      };
    }
    return {
      success: false,
      message: error.message || 'Network Error',
      statusCode: 500,
    };
  }
}

const guestService = new GuestService();
export default guestService; 