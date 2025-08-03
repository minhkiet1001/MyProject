import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

class NotificationService {
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
   * Get all notifications for current user
   * @returns {Promise} Notifications data
   */
  async getAllNotifications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get unread notifications count
   * @returns {Promise} Unread count data
   */
  async getUnreadCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get unread notifications
   * @returns {Promise} Unread notifications data
   */
  async getUnreadNotifications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Updated notification data
   */
  async markAsRead(notificationId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise} Result data
   */
  async markAllAsRead() {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/mark-all-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Delete notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Result data
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors and return user-friendly messages
   * @param {Error} error - Axios error object
   * @returns {Error} User-friendly error object
   */
  handleApiError(error) {
    let message = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
    
    if (error.response) {
      // Server responded with error status code
      const responseData = error.response.data;
      if (responseData && responseData.message) {
        message = responseData.message;
      } else if (error.response.status === 401) {
        message = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response.status === 403) {
        message = 'Bạn không có quyền thực hiện hành động này.';
      } else if (error.response.status === 404) {
        message = 'Không tìm thấy tài nguyên yêu cầu.';
      } else if (error.response.status >= 500) {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      }
    } else if (error.request) {
      // Request was made but no response was received
      message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    
    return new Error(message);
  }
}

const notificationService = new NotificationService();
export default notificationService; 