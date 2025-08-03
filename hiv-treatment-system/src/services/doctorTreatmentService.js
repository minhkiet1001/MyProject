import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Service for handling doctor treatment-related API calls
 */
class DoctorTreatmentService {
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
   * Get treatment plans with optional filters
   * @param {string} status - Optional status filter
   * @param {string} searchTerm - Optional search term
   * @returns {Promise} Filtered treatment plans
   */
  async getTreatmentPlans(status = null, searchTerm = null) {
    try {
      let url = `${API_BASE_URL}/doctor/treatment-plans`;
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);
      
      // Append params to URL if any exist
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await axios.get(url);
      return {
        success: true,
        data: response.data.data,
        message: 'Treatment plans retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching treatment plans with filters:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get doctor treatment plans
   * @returns {Promise} Treatment plans
   */
  async getDoctorTreatmentPlans() {
    try {
      const response = await axios.get(`${TREATMENT_PLANS_URL}/doctor`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor treatment plans:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get treatment plan by ID
   * @param {number} planId - Treatment plan ID
   * @returns {Promise} Treatment plan details
   */
  async getTreatmentPlanById(planId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/treatment-plans/${planId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Treatment plan retrieved successfully'
      };
    } catch (error) {
      console.error(`Error fetching treatment plan ${planId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Create a new treatment plan
   * @param {Object} treatmentPlanData - Treatment plan data
   * @returns {Promise} Created treatment plan
   */
  async createTreatmentPlan(treatmentPlanData) {
    try {
      console.log("Creating treatment plan with data:", {
        patientId: treatmentPlanData.patientId,
        appointmentId: treatmentPlanData.appointmentId,
        description: treatmentPlanData.description,
        startDate: treatmentPlanData.startDate,
        medicationsCount: treatmentPlanData.medications?.length || 0
      });
      
      // Make sure patientId is present
      if (!treatmentPlanData.patientId) {
        console.error("Missing patientId in treatmentPlanData");
        return {
          success: false,
          message: 'Missing required field: patientId'
        };
      }
      
      // Format dates to ensure they're compatible with backend
      if (treatmentPlanData.startDate) {
        treatmentPlanData.startDate = new Date(treatmentPlanData.startDate).toISOString().split('T')[0];
      }
      
      if (treatmentPlanData.endDate) {
        treatmentPlanData.endDate = new Date(treatmentPlanData.endDate).toISOString().split('T')[0];
      }
      
      if (treatmentPlanData.nextAppointmentDate) {
        treatmentPlanData.nextAppointmentDate = new Date(treatmentPlanData.nextAppointmentDate).toISOString().split('T')[0];
      }
      
      // Process medications if they exist
      if (treatmentPlanData.medications && treatmentPlanData.medications.length > 0) {
        console.log("Medications in treatment plan before processing:", treatmentPlanData.medications);
        
        treatmentPlanData.medications = treatmentPlanData.medications.map(med => {
          const processedMed = { ...med };
          
          // Format dates for each medication
          if (processedMed.startDate) {
            processedMed.startDate = new Date(processedMed.startDate).toISOString().split('T')[0];
          }
          
          if (processedMed.endDate) {
            processedMed.endDate = new Date(processedMed.endDate).toISOString().split('T')[0];
          }

          // Ensure prescribedBy and instructions are included
          if (!processedMed.prescribedBy) {
            // Get doctor name from localStorage if available
            const doctorName = localStorage.getItem('doctorName');
            processedMed.prescribedBy = doctorName || 'Bác sĩ điều trị';
            console.log(`Setting prescribedBy to ${processedMed.prescribedBy} for medication`);
          }
          
          if (!processedMed.instructions) {
            processedMed.instructions = '';
          }
          
          return processedMed;
        });
        
        console.log("Medications in treatment plan after processing:", treatmentPlanData.medications);
      }
      
      // Create a clean object to send to the API
      const dataToSend = { ...treatmentPlanData };
      
      console.log("Sending data to API:", dataToSend);
      
      // Handle skipAppointmentCheck flag - if true, add a parameter to tell backend to skip validation
      if (treatmentPlanData.skipAppointmentCheck) {
        // Add URL parameter for backend to skip appointment validation
        const response = await axios.post(`${API_BASE_URL}/doctor/treatment-plans?skipAppointmentCheck=true`, dataToSend);
        console.log("Backend response for create treatment plan (skipping appointment check):", response.data);
        return {
          success: true,
          data: response.data.data,
          message: 'Treatment plan created successfully'
        };
      } else {
        // Regular request with appointment validation
        const response = await axios.post(`${API_BASE_URL}/doctor/treatment-plans`, dataToSend);
        console.log("Backend response for create treatment plan:", response.data);
        return {
          success: true,
          data: response.data.data,
          message: 'Treatment plan created successfully'
        };
      }
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      console.error('Error response data:', error.response?.data);
      return this.handleApiError(error);
    }
  }

  /**
   * Update a treatment plan
   * @param {number} planId - Treatment plan ID
   * @param {Object} treatmentPlanData - Treatment plan data
   * @returns {Promise} Updated treatment plan
   */
  async updateTreatmentPlan(planId, treatmentPlanData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/doctor/treatment-plans/${planId}`, treatmentPlanData);
      return {
        success: true,
        data: response.data.data,
        message: 'Treatment plan updated successfully'
      };
    } catch (error) {
      console.error(`Error updating treatment plan ${planId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Add medication to treatment plan
   * @param {number} planId - Treatment plan ID
   * @param {Object} medicationData - Medication data
   * @returns {Promise} Added medication
   */
  async addMedication(planId, medicationData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/doctor/treatment-plans/${planId}/medications`, medicationData);
      return {
        success: true,
        data: response.data.data,
        message: 'Medication added successfully'
      };
    } catch (error) {
      console.error(`Error adding medication to plan ${planId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Add multiple medications to treatment plan
   * @param {number} planId - Treatment plan ID
   * @param {Array} medications - Array of medication data
   * @returns {Promise} Result of batch operation
   */
  async addMultipleMedicationsToTreatmentPlan(planId, medications) {
    try {
      if (!medications || !medications.length) {
        console.warn("No medications provided to add to treatment plan");
        return {
          success: true,
          message: 'No medications to add'
        };
      }
      
      // Format medications to ensure they have the correct structure
      const formattedMedications = medications.map(med => {
        // Debug logs for medication fields
        console.log('Processing medication:', {
          id: med.medicationId,
          instructions: med.instructions,
          prescribedBy: med.prescribedBy,
          original: med // Log the entire medication object
        });
        
        const formattedMed = {
        medication: {
          id: parseInt(med.medicationId, 10)
        },
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instructions || '',
          startDate: med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : null,
          endDate: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : null,
        status: med.status || 'ACTIVE',
        prescribedBy: med.prescribedBy || 'Bác sĩ điều trị'
        };
        
        console.log('Formatted medication:', formattedMed);
        
        return formattedMed;
      });
      
      console.log(`Adding ${formattedMedications.length} medications to plan ${planId}:`, formattedMedications);
      
      const response = await axios.post(
        `${API_BASE_URL}/doctor/treatment-plans/${planId}/medications/batch`, 
        formattedMedications
      );
      
      return {
        success: true,
        data: response.data.data,
        message: 'Medications added successfully'
      };
    } catch (error) {
      console.error(`Error adding multiple medications to plan ${planId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Update medication in treatment plan
   * @param {number} planId - Treatment plan ID
   * @param {number} medicationId - Medication ID
   * @param {Object} medicationData - Medication data
   * @returns {Promise} Updated medication
   */
  async updateMedication(planId, medicationId, medicationData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/doctor/treatment-plans/${planId}/medications/${medicationId}`, 
        medicationData
      );
      return {
        success: true,
        data: response.data.data,
        message: 'Medication updated successfully'
      };
    } catch (error) {
      console.error(`Error updating medication ${medicationId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Delete medication from treatment plan
   * @param {number} planId - Treatment plan ID
   * @param {number} medicationId - Medication ID
   * @returns {Promise} Result
   */
  async deleteMedication(planId, medicationId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/doctor/treatment-plans/${planId}/medications/${medicationId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Medication deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting medication ${medicationId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Change treatment plan status
   * @param {number} planId - Treatment plan ID
   * @param {string} status - New status
   * @param {string} reason - Reason for status change
   * @returns {Promise} Updated treatment plan
   */
  async changeTreatmentPlanStatus(planId, status, reason) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/doctor/treatment-plans/${planId}/status`, {
        status: status,
        reason: reason
      });
      return {
        success: true,
        data: response.data.data,
        message: 'Treatment plan status changed successfully'
      };
    } catch (error) {
      console.error(`Error changing treatment plan ${planId} status:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Update treatment plan status (with simplified interface)
   * @param {number} planId - Treatment plan ID
   * @param {string} status - New status
   * @returns {Promise} Result with updated treatment plan
   */
  async updateTreatmentPlanStatus(planId, status) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/doctor/treatment-plans/${planId}/status`, {
        status: status
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Treatment plan status updated successfully'
      };
    } catch (error) {
      console.error(`Error updating treatment plan ${planId} status:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Delete a treatment plan
   * @param {number} planId - Treatment plan ID
   * @returns {Promise} Result of delete operation
   */
  async deleteTreatmentPlan(planId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/doctor/treatment-plans/${planId}`);
      return {
        success: true,
        message: response.data.message || 'Treatment plan deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting treatment plan ${planId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get patient treatment plans
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient treatment plans
   */
  async getPatientTreatmentPlans(patientId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/treatment-plans/patients/${patientId}/treatment-plans`);
      return {
        success: true,
        data: response.data.data,
        message: 'Patient treatment plans retrieved successfully'
      };
    } catch (error) {
      console.error(`Error fetching treatment plans for patient ${patientId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get treatment plan statistics for doctor
   * @returns {Promise} Treatment plan statistics
   */
  async getTreatmentPlanStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/treatment-plans/statistics`);
      return {
        success: true,
        data: response.data.data,
        message: 'Treatment plan statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching treatment plan statistics:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get patient treatment dashboard data
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient treatment dashboard data
   */
  async getPatientTreatmentDashboard(patientId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/treatment-plans/patients/${patientId}/dashboard`);
      return {
        success: true,
        data: response.data.data,
        message: 'Patient treatment dashboard retrieved successfully'
      };
    } catch (error) {
      console.error(`Error fetching treatment dashboard for patient ${patientId}:`, error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get doctor dashboard statistics
   * @returns {Promise} Doctor dashboard statistics
   */
  async getDoctorDashboardStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/dashboard/stats`);
      return {
        success: true,
        data: response.data.data,
        message: 'Doctor dashboard statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching doctor dashboard statistics:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get patients available for treatment plans
   * @returns {Promise} List of patients
   */
  async getPatientsForTreatmentPlan() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/treatment-plans/patients`);
      return {
        success: true,
        data: response.data.data,
        message: 'Patients retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching patients for treatment plans:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get completed appointments for a patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of completed appointments
   */
  async getCompletedAppointments(patientId) {
    try {
      // Add simplify=true parameter to request a simplified response without proxied objects
      const response = await axios.get(`${API_BASE_URL}/doctor/treatment-plans/appointments/completed/${patientId}?simplify=true`);
      return {
        success: true,
        data: response.data.data,
        message: 'Completed appointments retrieved successfully'
      };
    } catch (error) {
      console.error(`Error fetching completed appointments for patient ${patientId}:`, error);
      
      // More detailed error handling for debugging
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
      }
      
      // Return a more user-friendly error message
      return {
        success: false,
        message: 'Không thể tìm thấy lịch hẹn hoàn thành cho bệnh nhân này',
        error: this.handleApiError(error)
      };
    }
  }
}

export default new DoctorTreatmentService(); 