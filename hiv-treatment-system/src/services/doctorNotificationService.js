import axios from 'axios';
import authService from './authService';
import notificationService from './notificationService';

const API_BASE_URL = 'http://localhost:8080/api';

class DoctorNotificationService {
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
   * Get all notifications for doctor
   * @returns {Promise} All notifications for the current doctor
   */
  async getDoctorNotifications() {
    return notificationService.getAllNotifications();
  }

  /**
   * Get unread notifications for doctor
   * @returns {Promise} Unread notifications for the current doctor
   */
  async getDoctorUnreadNotifications() {
    return notificationService.getUnreadNotifications();
  }

  /**
   * Get unread notification count for doctor
   * @returns {Promise} Unread count for the current doctor
   */
  async getDoctorUnreadCount() {
    return notificationService.getUnreadCount();
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Updated notification data
   */
  async markAsRead(notificationId) {
    return notificationService.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   * @returns {Promise} Result data
   */
  async markAllAsRead() {
    return notificationService.markAllAsRead();
  }

  /**
   * Format notifications for display in the doctor dashboard
   * @param {Array} notifications - Raw notifications from the API
   * @returns {Array} Formatted notifications for display
   */
  formatNotifications(notifications) {
    if (!notifications || !notifications.length) return [];
    
    return notifications.map(notification => {
      const isAppointment = notification.type?.toLowerCase() === 'appointment';
      
      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        time: this.formatTimeAgo(notification.createdAt),
        read: notification.isRead,
        type: notification.type?.toLowerCase() || 'system',
        referenceId: notification.referenceId,
        referenceType: notification.referenceType,
        // For appointment notifications, extract appointment ID from message if available
        appointmentId: isAppointment && notification.referenceId ? notification.referenceId : null,
        priority: notification.priority || 'normal'
      };
    });
  }

  /**
   * Format time ago for display
   * @param {string} dateString - Date string from API
   * @returns {string} Formatted time ago string
   */
  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs} giây trước`;
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  }
}

const doctorNotificationService = new DoctorNotificationService();
export default doctorNotificationService; 