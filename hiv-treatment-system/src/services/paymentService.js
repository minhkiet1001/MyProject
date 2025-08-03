import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

class PaymentService {
  constructor() {
    // Set up axios interceptors for authentication
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

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get user's payment transactions
   * @returns {Promise} List of user's payment transactions
   */
  async getUserTransactions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/my-transactions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get payment transaction by appointment ID
   * @param {number} appointmentId - ID of the appointment
   * @returns {Promise} Payment transaction for the appointment
   */
  async getTransactionByAppointmentId(appointmentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction for appointment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Create QR payment for an appointment
   * @param {number} transactionId - ID of the transaction
   * @param {number} amount - Payment amount
   * @param {string} orderInfo - Order info description
   * @returns {Promise} Payment response with QR URL
   */
  async createQrPayment(transactionId, amount, orderInfo) {
    try {
      const orderId = `ORDER_${transactionId}_${Date.now()}`;
      const response = await axios.post(`${API_BASE_URL}/momo-payment/create`, {
        orderId: orderId,
        amount: amount,
        orderInfo: orderInfo || `Thanh toán hóa đơn #${transactionId}`,
        transactionId: transactionId, // Use transactionId instead of appointmentId
        userId: authService.getCurrentUser().id
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error creating QR payment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Confirm cash payment for an appointment
   * @param {Object} data - Payment data
   * @param {number} data.appointmentId - ID of the appointment
   * @param {number} data.amount - Payment amount
   * @returns {Promise} Payment confirmation response
   */
  async confirmCashPayment(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payment/cash`, {
        appointmentId: data.appointmentId,
        userId: authService.getCurrentUser().id,
        amount: data.amount
      });
      
      return response.data;
    } catch (error) {
      console.error("Error confirming cash payment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Check payment status by order ID
   * @param {string} orderId - Order ID to check
   * @returns {Promise} Payment status response
   */
  async checkPaymentStatus(orderId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/momo-payment/status`, {
        params: { orderId }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Manually check and update payment status after MoMo redirect
   * @param {string} orderId - Order ID from MoMo
   * @param {string} transId - Transaction ID from MoMo
   * @returns {Promise} Update status response
   */
  async manualCheckAndUpdatePayment(orderId, transId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/momo-payment/check-and-update`, {
        orderId: orderId,
        transId: transId
      });
      
      return response.data;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Staff confirms payment for an appointment
   * @param {Object} data - Payment data
   * @param {number} data.appointmentId - ID of the appointment
   * @param {string} data.paymentMethod - Payment method (CASH or QR)
   * @param {string} data.notes - Optional notes
   * @returns {Promise} Payment confirmation response
   */
  async staffConfirmPayment(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/staff/confirm`, {
        appointmentId: data.appointmentId,
        paymentMethod: data.paymentMethod,
        notes: data.notes || ""
      });
      
      return response.data;
    } catch (error) {
      console.error("Error confirming payment by staff:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors and format user messages
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error message
   */
  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.message || "Dữ liệu không hợp lệ");
        case 401:
          return new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
          );
        case 403:
          return new Error("Bạn không có quyền thực hiện thao tác này");
        case 404:
          return new Error("Không tìm thấy dữ liệu yêu cầu");
        case 409:
          return new Error(data.message || "Lỗi xung đột dữ liệu");
        case 500:
          return new Error("Lỗi server. Vui lòng thử lại sau");
        default:
          return new Error(data.message || "Có lỗi xảy ra. Vui lòng thử lại");
      }
    } else if (error.request) {
      return new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng"
      );
    } else {
      return new Error(error.message || "Có lỗi không xác định xảy ra");
    }
  }
}

const paymentService = new PaymentService();
export default paymentService; 