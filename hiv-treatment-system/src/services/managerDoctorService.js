import axios from 'axios';

const API_URL = 'http://localhost:8080/api/manager/doctors';

// Add axios interceptor to handle token
// Already setup globally in authService.js, but added here for safety
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get all doctors with optional filter for active only
 * @param {boolean} activeOnly - If true, return only active doctors
 * @returns {Promise} API response with doctors list
 */
const getAllDoctors = async (activeOnly = false) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: { activeOnly }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || { message: 'Failed to fetch doctors' };
  }
};

/**
 * Get doctor details by ID
 * @param {number} doctorId - The ID of the doctor to retrieve
 * @returns {Promise} API response with doctor details
 */
const getDoctorById = async (doctorId) => {
  try {
    const response = await axios.get(`${API_URL}/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || { message: 'Failed to fetch doctor details' };
  }
};

/**
 * Create a new doctor
 * @param {object} doctorData - The doctor data to create
 * @returns {Promise} API response with created doctor
 */
const createDoctor = async (doctorData) => {
  try {
    const response = await axios.post(`${API_URL}`, doctorData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || { message: 'Failed to create doctor' };
  }
};

/**
 * Update an existing doctor
 * @param {number} doctorId - The ID of the doctor to update
 * @param {object} doctorData - The doctor data to update
 * @returns {Promise} API response with updated doctor
 */
const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await axios.put(`${API_URL}/${doctorId}`, doctorData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || { message: 'Failed to update doctor' };
  }
};

/**
 * Update doctor activation status
 * @param {number} doctorId - The ID of the doctor to update status
 * @param {boolean} active - The new status (true for active, false for inactive)
 * @returns {Promise} API response with updated doctor
 */
const updateDoctorStatus = async (doctorId, active) => {
  try {
    const response = await axios.patch(`${API_URL}/${doctorId}/status?active=${active}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || { message: 'Failed to update doctor status' };
  }
};

/**
 * Delete a doctor (soft delete)
 * @param {number} doctorId - The ID of the doctor to delete
 * @returns {Promise} API response
 */
const deleteDoctor = async (doctorId) => {
  try {
    const response = await axios.delete(`${API_URL}/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || { message: 'Failed to delete doctor' };
  }
};

/**
 * Format doctor data for creating or updating
 * Transforms frontend model to backend DTO
 */
const formatDoctorData = (doctorData) => {
  // For creation
  if (doctorData.password) {
    return {
      name: doctorData.name,
      email: doctorData.email,
      password: doctorData.password,
      phone: doctorData.phone,
      birthdate: doctorData.birthdate,
      address: doctorData.address,
      gender: doctorData.gender,
      avatarUrl: doctorData.avatarUrl,
      specialty: doctorData.specialty,
      degree: doctorData.degree,
      bio: doctorData.bio,
      experienceYears: parseInt(doctorData.experienceYears || doctorData.experience || 0),
      maxPatientsPerDay: parseInt(doctorData.maxPatientsPerDay || 0)
    };
  } 
  // For update
  else {
    return {
      name: doctorData.name,
      phone: doctorData.phone,
      address: doctorData.address,
      avatarUrl: doctorData.avatarUrl,
      specialty: doctorData.specialty,
      degree: doctorData.degree,
      bio: doctorData.bio,
      experienceYears: parseInt(doctorData.experienceYears || doctorData.experience || 0),
      maxPatientsPerDay: parseInt(doctorData.maxPatientsPerDay || 0)
    };
  }
};

const managerDoctorService = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  updateDoctorStatus,
  deleteDoctor,
  formatDoctorData
};

export default managerDoctorService; 