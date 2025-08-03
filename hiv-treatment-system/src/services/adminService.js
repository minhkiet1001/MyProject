import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Add response interceptor for standard error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access, redirecting to login');
      // Could redirect to login page or dispatch an authentication error action
    }
    
    return Promise.reject(error);
  }
);

const adminService = {
  // Get all users with optional filters
  async getUsers(filters = {}) {
    try {
      // Convert filters to query parameters
      const params = new URLSearchParams();
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFilter) params.append('dateFilter', filters.dateFilter);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
      if (filters.page) params.append('page', filters.page - 1); // API is 0-indexed, UI is 1-indexed
      if (filters.limit) params.append('size', filters.limit);

      try {
        const response = await axios.get(`${API_URL}/admin/users`, { params });
        return this.standardizeResponse(response);
      } catch (apiError) {
        // Check if there's a network or server error
        console.error('API Error in getUsers:', apiError);
        
        // In development mode, return mock data as fallback
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data in development mode');
          return this.getMockUsers(filters);
        }
        
        throw apiError;
      }
    } catch (error) {
      return this.handleError(error, 'Error fetching users');
    }
  },

  // Get mock users (for development/testing)
  getMockUsers(filters = {}) {
    console.log('Generating mock user data');
    
    const mockUsers = [
      {
        id: 1,
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: '2023-01-01T00:00:00.000Z',
        last_login_at: '2023-07-25T10:30:00.000Z',
        avatar_url: null
      },
      {
        id: 2,
        name: 'Doctor User',
        username: 'doctor',
        email: 'doctor@example.com',
        role: 'DOCTOR',
        status: 'ACTIVE',
        created_at: '2023-02-15T00:00:00.000Z',
        last_login_at: '2023-07-24T14:20:00.000Z',
        avatar_url: null
      },
      {
        id: 3,
        name: 'Staff User',
        username: 'staff',
        email: 'staff@example.com',
        role: 'STAFF',
        status: 'ACTIVE',
        created_at: '2023-03-10T00:00:00.000Z',
        last_login_at: '2023-07-23T09:15:00.000Z',
        avatar_url: null
      },
      {
        id: 4,
        name: 'Patient User',
        username: 'patient',
        email: 'patient@example.com',
        role: 'CUSTOMER',
        status: 'INACTIVE',
        created_at: '2023-04-05T00:00:00.000Z',
        last_login_at: null,
        avatar_url: null
      }
    ];
    
    // Apply filtering based on filters
    let filteredUsers = [...mockUsers];
    
    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => 
        user.status.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy;
      const sortDirection = filters.sortDirection === 'desc' ? -1 : 1;
      
      filteredUsers.sort((a, b) => {
        let valueA = a[sortField] || '';
        let valueB = b[sortField] || '';
        
        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        return valueA > valueB ? sortDirection : -sortDirection;
      });
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        content: paginatedUsers,
        totalElements: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        size: limit,
        number: page - 1,
        numberOfElements: paginatedUsers.length
      }
    };
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`);
      return this.standardizeResponse(response);
    } catch (error) {
      this.handleError(error, `Error fetching user with ID ${userId}`);
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      console.log('Creating user with data:', userData);
      const response = await axios.post(`${API_URL}/admin/users`, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone || '',
        birthdate: userData.birthdate || null,
        address: userData.address || '',
        gender: userData.gender || 'MALE',
        department: userData.department || null
      });
      console.log('Create user response:', response);
      return this.standardizeResponse(response);
    } catch (error) {
      console.error('API Error in createUser:', error.response?.data || error.message);
      
      // Extract the error message from the response if available
      let errorMessage = 'Error creating user';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Extract message from response data object
          errorMessage = error.response.data.message || 'Unknown server error';
        } else {
          // If response data is not an object, use it directly
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        // Use error message if response data is not available
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}`, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone || '',
        birthdate: userData.birthdate || null,
        address: userData.address || '',
        gender: userData.gender || 'MALE',
        status: userData.status,
        department: userData.department || null
      });
      return this.standardizeResponse(response);
    } catch (error) {
      this.handleError(error, `Error updating user with ID ${userId}`);
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${API_URL}/admin/users/${userId}`);
      return this.standardizeResponse(response);
    } catch (error) {
      this.handleError(error, `Error deleting user with ID ${userId}`);
    }
  },

  // Change user status (activate, deactivate, suspend)
  async changeUserStatus(userId, status) {
    try {
      const response = await axios.patch(`${API_URL}/admin/users/${userId}/status`, { status });
      return this.standardizeResponse(response);
    } catch (error) {
      this.handleError(error, `Error changing status for user with ID ${userId}`);
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await axios.get(`${API_URL}/admin/users/stats`);
      return this.standardizeResponse(response);
    } catch (error) {
      this.handleError(error, 'Error fetching user statistics');
    }
  },

  // Helper function to format user data from API to UI format
  formatUserData(apiUser) {
    if (!apiUser) {
      console.error('Received null or undefined user data');
      return {
        id: 'unknown',
        avatar: `https://ui-avatars.com/api/?name=Unknown&background=random`,
        fullName: 'Unknown User',
        username: 'unknown',
        email: 'unknown@example.com',
        role: 'UNKNOWN',
        status: 'inactive',
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
    }
    
    return {
      id: apiUser.id || 'unknown',
      avatar: apiUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.name || 'Unknown')}&background=random`,
      fullName: apiUser.name || 'Unknown User',
      username: apiUser.username || (apiUser.email ? apiUser.email.split('@')[0] : 'unknown'),
      email: apiUser.email || 'unknown@example.com',
      role: apiUser.role || 'UNKNOWN',
      status: apiUser.status ? apiUser.status.toLowerCase() : 'inactive',
      createdAt: apiUser.created_at || new Date().toISOString(),
      lastLogin: apiUser.last_login_at || null,
      department: apiUser.department || '',
      phoneNumber: apiUser.phone || '',
      address: apiUser.address || '',
      dateOfBirth: apiUser.birthdate || null
    };
  },

  // Standardize API responses
  standardizeResponse(response) {
    // Check if response is valid
    if (!response || !response.data) {
      throw new Error('Invalid API response');
    }
    
    // If the API explicitly returns success: false
    if (response.data.success === false) {
      throw new Error(response.data.message || 'API operation failed');
    }
    
    // Different API response formats
    if (response.data.data) {
      // Some APIs wrap data in a 'data' property
      return {
        ...response.data,
        data: response.data.data
      };
    } else if (response.data.content) {
      // Some APIs use a pagination structure with 'content'
      return {
        ...response.data,
        data: {
          content: response.data.content,
          totalElements: response.data.totalElements || response.data.content.length,
          totalPages: response.data.totalPages || Math.ceil(response.data.content.length / 10)
        }
      };
    }
    
    // Default case: data is directly in response.data
    return {
      success: true,
      data: response.data
    };
  },

  // Standardized error handling
  handleError(error, defaultMessage = 'API Error') {
    const errorMessage = error.response?.data?.message || error.message || defaultMessage;
    console.error(errorMessage, error);
    
    // Return a standardized error response
    return {
      success: false,
      error: errorMessage,
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0
      }
    };
  }
};

export default adminService; 