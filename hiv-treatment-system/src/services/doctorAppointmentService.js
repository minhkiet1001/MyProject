import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Service for handling doctor appointment-related API calls
 */
class DoctorAppointmentService {
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
   * Get all appointments for the logged-in doctor
   * @returns {Promise} All appointments
   */
  async getAllAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/all`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get today's appointments for the logged-in doctor
   * @returns {Promise} Today's appointments
   */
  async getTodayAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/today`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Complete an appointment
   * @param {number} appointmentId - Appointment ID
   * @param {string} notes - Optional notes
   * @returns {Promise} Updated appointment
   */
  async completeAppointment(appointmentId, notes) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/complete`,
        {
          notes: notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error completing appointment:", error);
      // Check if the error is about check-in requirement
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("checked-in")
      ) {
        // Get the appointment to check if it's online
        try {
          const appointmentResponse = await axios.get(
            `${API_BASE_URL}/appointments/doctor/${appointmentId}`
          );
          
          // If it's an online appointment, we don't need to enforce check-in
          if (appointmentResponse.data.success && 
              appointmentResponse.data.data.isOnline === true) {
            // Retry the request with a special flag to bypass check-in requirement
            const bypassResponse = await axios.put(
              `${API_BASE_URL}/appointments/doctor/${appointmentId}/complete`,
              { 
                notes: notes,
                bypassCheckIn: true 
              }
            );
            return bypassResponse.data;
          }
        } catch (innerError) {
          console.error("Error checking if appointment is online:", innerError);
        }
        
        // If we get here, it's not an online appointment or the check failed
        throw new Error(
          "Bệnh nhân chưa check-in. Vui lòng check-in bệnh nhân trước khi hoàn thành cuộc hẹn."
        );
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * Cancel an appointment
   * @param {number} appointmentId - Appointment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Updated appointment
   */
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/cancel`,
        {
          reason: reason,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Mark appointment as no-show
   * @param {number} appointmentId - Appointment ID
   * @param {string} notes - Optional notes
   * @returns {Promise} Updated appointment
   */
  async markNoShow(appointmentId, notes) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/no-show`,
        {
          notes: notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking appointment as no-show:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Mark patient as checked in for appointment - REMOVED
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Error message
   */
  async checkInPatient(appointmentId) {
    return {
      success: false,
      message: "Bác sĩ không có quyền check-in bệnh nhân. Bệnh nhân cần tự check-in khi đến phòng khám."
    };
  }

  /**
   * Get completed appointments for the logged-in doctor
   * @returns {Promise} Completed appointments
   */
  async getCompletedAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/status/COMPLETED`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching completed appointments:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Put a checked-in appointment under review
   * @param {number} appointmentId - Appointment ID
   * @param {string} notes - Optional notes
   * @param {string} bloodPressure - Optional blood pressure reading
   * @param {boolean} bloodSampleRequested - Whether blood sample is requested
   * @param {string} symptoms - Updated symptoms as assessed by the doctor
   * @returns {Promise} Updated appointment
   * @description This method updates an appointment to UNDER_REVIEW status and updates patient symptoms
   */
  async putUnderReview(
    appointmentId,
    notes,
    bloodPressure,
    bloodSampleRequested,
    symptoms
  ) {
    try {
      console.log("putUnderReview called with params:", {
        appointmentId, 
        notes, 
        bloodPressure, 
        bloodSampleRequested, 
        symptoms
      });
      
      // Make sure symptoms is properly sent
      const requestData = {
        notes: notes,
        bloodPressure: bloodPressure,
        bloodSampleRequested: bloodSampleRequested,
        symptoms: symptoms, // This will update the symptoms field in the database
        updatedSymptoms: symptoms, // Send as an additional parameter in case the backend is looking for a different field name
      };
      
      console.log("Sending request data:", requestData);
      
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/under-review`,
        requestData
      );
      
      console.log("Response from API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error putting appointment under review:", error);
      // Check if the error is about check-in requirement
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("checked-in")
      ) {
        // Get the appointment to check if it's online
        try {
          const appointmentResponse = await axios.get(
            `${API_BASE_URL}/appointments/doctor/${appointmentId}`
          );
          
          // If it's an online appointment, we don't need to enforce check-in
          if (appointmentResponse.data.success && 
              appointmentResponse.data.data.isOnline === true) {
            // Retry the request with a special flag to bypass check-in requirement
            const bypassResponse = await axios.put(
              `${API_BASE_URL}/appointments/doctor/${appointmentId}/under-review`,
              { 
                ...requestData,
                bypassCheckIn: true 
              }
            );
            return bypassResponse.data;
          }
        } catch (innerError) {
          console.error("Error checking if appointment is online:", innerError);
        }
        
        // If we get here, it's not an online appointment or the check failed
        throw new Error(
          "Bệnh nhân chưa check-in. Vui lòng đảm bảo bệnh nhân đã check-in trước khi tiếp nhận hồ sơ."
        );
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * Complete an appointment after treatment plan has been added
   * @param {number} appointmentId - Appointment ID
   * @param {Object} data - Data containing treatment plan info
   * @returns {Promise} Updated appointment
   */
  async completeAppointmentWithTreatment(appointmentId, data = {}) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/complete-with-treatment`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error completing appointment with treatment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get appointments with UNDER_REVIEW status
   * @returns {Promise} Under review appointments
   */
  async getUnderReviewAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/status/UNDER_REVIEW`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching under review appointments:", error);
      return this.handleApiError(error);
    }
  }
  
  /**
   * Get appointments with a specific status
   * @param {string} status - Appointment status (e.g., "CONFIRMED", "CHECKED_IN", "UNDER_REVIEW")
   * @returns {Promise} Appointments with the specified status
   */
  async getAppointmentsByStatus(status) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments with status ${status}:`, error);
      return this.handleApiError(error);
    }
  }
  
  /**
   * Update appointment symptoms
   * @param {number} appointmentId - Appointment ID
   * @param {string} symptoms - Updated symptoms text
   * @returns {Promise} Updated appointment
   */
  async updateAppointmentSymptoms(appointmentId, symptoms) {
    try {
      console.log(`Updating symptoms for appointment ${appointmentId}:`, symptoms);
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/update-symptoms`,
        { symptoms: symptoms }
      );
      console.log("Symptoms update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating appointment symptoms:", error);
      return this.handleApiError(error);
    }
  }

  /**
   * Test function to verify the PUT under-review endpoint
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Response from the test
   */
  async testPutUnderReview(appointmentId) {
    try {
      const testSymptoms = "Test symptoms from doctor " + new Date().toISOString();
      console.log("Testing PUT under-review with symptoms:", testSymptoms);
      
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/under-review`,
        {
          notes: "Test notes",
          bloodPressure: "120/80",
          bloodSampleRequested: true,
          symptoms: testSymptoms
        }
      );
      
      console.log("Test response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Test error:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Test function to verify the PUT update-symptoms endpoint
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Response from the test
   */
  async testUpdateSymptoms(appointmentId) {
    try {
      const testSymptoms = "Test symptoms update " + new Date().toISOString();
      console.log("Testing UPDATE-SYMPTOMS with:", testSymptoms);
      
      const response = await axios.put(
        `${API_BASE_URL}/appointments/doctor/${appointmentId}/update-symptoms`,
        { symptoms: testSymptoms }
      );
      
      console.log("Test response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Test error:", error);
      throw this.handleApiError(error);
    }
  }
}

export default new DoctorAppointmentService(); 
