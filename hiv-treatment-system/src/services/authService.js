import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Add axios interceptor to handle token
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

const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        phone: userData.phone,
        gender: userData.gender,
        birthdate: userData.birthdate,
        address: userData.address || '',
        role: 'CUSTOMER', // Default role for registration
        status: 'ACTIVE', // Default status
        avatar_url: userData.avatar_url || null
      });

      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send OTP to email
  async sendOtp(email) {
    try {
      const response = await axios.post(`${API_URL}/send-otp`, {
        email: email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify OTP code
  async verifyOtp(email, otpCode) {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, {
        email: email,
        otpCode: otpCode
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resend OTP code
  async resendOtp(email) {
    try {
      const response = await axios.post(`${API_URL}/resend-otp`, {
        email: email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        // Store doctor name if user is a doctor
        if (response.data.data.role === 'DOCTOR' && response.data.data.name) {
          localStorage.setItem('doctorName', `BS. ${response.data.data.name}`);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  async logout() {
    try {
      // First, try to call the logout API
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('doctorName');
      // Clear any other auth-related data you might have
      localStorage.removeItem('remember-me');
    }
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && user.status === 'ACTIVE');
  },

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/profile`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${API_URL}/profile`, {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        address: profileData.address || '',
        avatar_url: profileData.avatar_url || null
      });
      
      // Update local storage with new user data if available
      if (response.data.data) {
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword, confirmNewPassword) {
    try {
      const response = await axios.post(`${API_URL}/change-password`, {
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check server health
  async checkHealth() {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user role and redirect path
  getUserRoleAndPath() {
    const user = this.getCurrentUser();
    if (!user) return { role: null, path: '/login' };

    switch (user.role) {
      case 'ADMIN':
        return { role: 'ADMIN', path: '/admin/dashboard' };
      case 'DOCTOR':
        return { role: 'DOCTOR', path: '/doctor/dashboard' };
      case 'STAFF':
        return { role: 'STAFF', path: '/staff/dashboard' };
      case 'MANAGER':
        return { role: 'MANAGER', path: '/manager/dashboard' };
      case 'CUSTOMER':
        return { role: 'CUSTOMER', path: '/customer/dashboard' };
      default:
        return { role: 'GUEST', path: '/login' };
    }
  },
  
  // Get user ID
  getUserId() {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }
};

export default authService; 