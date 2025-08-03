import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api";

class AppointmentService {
  constructor() {
    // Thiết lập axios interceptor cho xác thực
    this.setupInterceptors();
    this.syncInProgress = false;
  }

  /**
   * Thiết lập interceptors cho axios
   * - Request interceptor: Tự động thêm token xác thực vào header
   * - Response interceptor: Xử lý lỗi xác thực (401)
   */
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

    // Interceptor phản hồi để xử lý lỗi xác thực
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token hết hạn hoặc không hợp lệ, chuyển hướng đến trang đăng nhập
          authService.logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Lấy các khung giờ trống của bác sĩ cho một ngày cụ thể
   *
   * @param {number} doctorId - ID của bác sĩ
   * @param {string} date - Ngày theo định dạng YYYY-MM-DD
   * @param {number} serviceId - ID của dịch vụ
   * @returns {Promise} Dữ liệu về các khung giờ trống
   */
  async getAvailableSlots(doctorId, date, serviceId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/available-slots`,
        {
          params: {
            doctorId,
            date,
            serviceId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Đặt lịch hẹn mới
   *
   * @param {Object} appointmentData - Dữ liệu đặt lịch hẹn
   * @param {number} appointmentData.doctorId - ID của bác sĩ
   * @param {number} appointmentData.serviceId - ID của dịch vụ
   * @param {string} appointmentData.scheduledAt - Ngày và giờ của cuộc hẹn
   * @param {number} appointmentData.scheduleId - ID lịch (tùy chọn)
   * @param {string} appointmentData.symptoms - Triệu chứng của bệnh nhân (tùy chọn)
   * @param {string} appointmentData.medicalHistory - Tiền sử bệnh của bệnh nhân (tùy chọn)
   * @param {string} appointmentData.notes - Ghi chú bổ sung (tùy chọn)
   * @param {boolean} appointmentData.isOnline - Đánh dấu là cuộc hẹn trực tuyến (mặc định: false)
   * @param {boolean} appointmentData.isAnonymous - Đánh dấu là tư vấn ẩn danh (mặc định: false)
   * @param {boolean} appointmentData.autoConfirm - Tự động xác nhận cuộc hẹn không cần nhân viên duyệt (mặc định: false)
   * @returns {Promise} Kết quả đặt lịch
   */
  async bookAppointment(appointmentData) {
    try {
      // Đảm bảo người dùng đã đăng nhập
      if (!authService.isAuthenticated()) {
        throw new Error("Bạn cần đăng nhập để đặt lịch hẹn");
      }

      const response = await axios.post(`${API_BASE_URL}/appointments/book`, {
        doctorId: appointmentData.doctorId,
        serviceId: appointmentData.serviceId,
        scheduledAt: appointmentData.scheduledAt,
        scheduleId: appointmentData.scheduleId,
        symptoms: appointmentData.symptoms || "",
        medicalHistory: appointmentData.medicalHistory || "",
        notes: appointmentData.notes || "",
        isOnline: appointmentData.isOnline || false, // Tham số mới: đánh dấu là cuộc hẹn online
        isAnonymous: appointmentData.isAnonymous || false, // Tham số mới: đánh dấu là tư vấn ẩn danh
        autoConfirm: appointmentData.autoConfirm || false, // Khi true, lịch hẹn sẽ tự động được xác nhận thay vì ở trạng thái chờ xác nhận
        paymentMethod: appointmentData.paymentMethod || "CASH", // Thêm phương thức thanh toán
      });
      return response.data;
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy các ngày có lịch trống của bác sĩ
   *
   * @param {number} doctorId - ID của bác sĩ
   * @param {string} startDate - Ngày bắt đầu theo định dạng YYYY-MM-DD
   * @param {string} endDate - Ngày kết thúc theo định dạng YYYY-MM-DD
   * @returns {Promise} Các ngày có lịch trống
   */
  async getAvailableDates(doctorId, startDate, endDate) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/schedules/available-dates`,
        {
          params: {
            doctorId,
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available dates:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Kiểm tra xem một khung giờ có trống không
   *
   * @param {number} doctorId - ID của bác sĩ
   * @param {string} date - Ngày theo định dạng YYYY-MM-DD
   * @param {string} time - Thời gian theo định dạng HH:mm:ss
   * @param {number} serviceId - ID của dịch vụ
   * @returns {Promise} Kết quả kiểm tra tính khả dụng
   */
  async checkAvailability(doctorId, date, time, serviceId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/schedules/check-availability`,
        {
          params: {
            doctorId,
            date,
            time,
            serviceId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy danh sách cuộc hẹn của người dùng hiện tại
   *
   * @param {string} status - Bộ lọc trạng thái (tùy chọn)
   * @returns {Promise} Danh sách cuộc hẹn của người dùng
   */
  async getUserAppointments(status = null) {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }

      const response = await axios.get(
        `${API_BASE_URL}/appointments/my-appointments`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy danh sách cuộc hẹn sắp tới của người dùng hiện tại
   *
   * @returns {Promise} Danh sách cuộc hẹn sắp tới
   */
  async getUpcomingAppointments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/upcoming`);
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy danh sách cuộc hẹn đã qua của người dùng hiện tại
   *
   * @returns {Promise} Danh sách cuộc hẹn đã qua
   */
  async getPastAppointments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/past`);
      return response.data;
    } catch (error) {
      console.error("Error fetching past appointments:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Hủy cuộc hẹn
   * @param {number} appointmentId - ID của cuộc hẹn
   * @param {string} reason - Lý do hủy
   * @returns {Promise} Kết quả hủy cuộc hẹn
   */
  async cancelAppointment(appointmentId, reason = "") {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        {
          reason,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy danh sách tất cả bác sĩ
   * @returns {Promise} Danh sách bác sĩ
   */
  async getDoctors() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy danh sách tất cả dịch vụ
   * @returns {Promise} Danh sách dịch vụ
   */
  async getServices() {
    try {
      const response = await axios.get(`${API_BASE_URL}/services`);
      return response.data;
    } catch (error) {
      console.error("Error fetching services:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Xử lý lỗi API và trả về thông báo người dùng
   * @param {Error} error - Đối tượng lỗi Axios
   * @returns {Error} Thông báo lỗi đã được định dạng
   */
  handleApiError(error) {
    if (error.response) {
      // Server trả về lỗi trạng thái
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
          return new Error(data.message || "Slot thời gian đã được đặt");
        case 500:
          return new Error("Lỗi server. Vui lòng thử lại sau");
        default:
          return new Error(data.message || "Có lỗi xảy ra. Vui lòng thử lại");
      }
    } else if (error.request) {
      // Lỗi mạng
      return new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng"
      );
    } else {
      // Lỗi khác
      return new Error(error.message || "Có lỗi không xác định xảy ra");
    }
  }

  /**
   * Định dạng ngày thành định dạng API (YYYY-MM-DD)
   * @param {Date|string} date - Ngày cần định dạng
   * @returns {string} Ngày đã định dạng
   */
  formatDateForAPI(date) {
    if (typeof date === "string") {
      date = new Date(date);
    }
    return date.toISOString().split("T")[0];
  }

  /**
   * Định dạng ngày giờ thành định dạng API (YYYY-MM-DDTHH:mm:ss)
   * @param {Date|string} date - Ngày cần định dạng
   * @param {string} time - Thời gian theo định dạng HH:mm hoặc HH:mm:ss
   * @returns {string} Ngày giờ đã định dạng
   */
  formatDateTimeForAPI(date, time) {
    const dateStr = this.formatDateForAPI(date);

    // Làm sạch định dạng thời gian - loại bỏ các phần không cần thiết
    let cleanTime = time.trim();
    const timeParts = cleanTime.split(":");

    if (timeParts.length >= 2) {
      // Đảm bảo định dạng HH:mm:ss
      const hours = timeParts[0].padStart(2, "0");
      const minutes = timeParts[1].padStart(2, "0");
      const seconds =
        timeParts.length >= 3 ? timeParts[2].padStart(2, "0") : "00";

      return `${dateStr}T${hours}:${minutes}:${seconds}`;
    }

    // Fallback nếu định dạng thời gian không mong muốn
    return `${dateStr}T${cleanTime}:00`;
  }

  /**
   * Người dân tự động kiểm tra vào cuộc hẹn
   * @param {number} appointmentId - ID của cuộc hẹn
   * @returns {Promise} Cuộc hẹn đã cập nhật
   */
  async checkInAppointment(appointmentId) {
    try {
      // Gọi API để cập nhật trạng thái trong database - sử dụng PUT thay vì POST
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/checkin`
      );

      // Nếu API call thành công, lưu trạng thái vào localStorage để duy trì sau khi reload
      if (response.data.success) {
        try {
          const checkedInAppointments = JSON.parse(
            localStorage.getItem("checkedInAppointments") || "[]"
          );
          if (!checkedInAppointments.includes(appointmentId)) {
            checkedInAppointments.push(appointmentId);
            localStorage.setItem(
              "checkedInAppointments",
              JSON.stringify(checkedInAppointments)
            );
          }
        } catch (err) {
          console.error("Error saving check-in state to localStorage", err);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error checking in:", error);

      // Fallback mode nếu API gặp lỗi - chỉ lưu vào localStorage
      console.log(`[FALLBACK MODE] Check-in for appointment ${appointmentId}`);

      try {
        const checkedInAppointments = JSON.parse(
          localStorage.getItem("checkedInAppointments") || "[]"
        );
        if (!checkedInAppointments.includes(appointmentId)) {
          checkedInAppointments.push(appointmentId);
          localStorage.setItem(
            "checkedInAppointments",
            JSON.stringify(checkedInAppointments)
          );
        }
      } catch (err) {
        console.error("Error saving check-in to localStorage", err);
      }

      // Trả về lỗi để UI xử lý
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy thông tin chi tiết của cuộc hẹn theo ID
   * @param {number} appointmentId - ID của cuộc hẹn
   * @returns {Promise} Thông tin chi tiết của cuộc hẹn
   */
  async getAppointmentById(appointmentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${appointmentId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Làm mới token của người dân cho cuộc hẹn trực tuyến
   * @param {number} appointmentId - ID của cuộc hẹn
   * @returns {Promise} Thông tin token
   */
  async refreshPatientToken(appointmentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/online/${appointmentId}/refresh-token`
      );
      // Log token data received from API
      console.log("Patient token API response:", {
        success: response.data.success,
        hasAppId: !!response.data.data?.appId,
        hasToken: !!response.data.data?.token,
        hasChannelName: !!response.data.data?.channelName,
        appIdSample: response.data.data?.appId
          ? response.data.data.appId
          : "missing",
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error refreshing token for appointment ${appointmentId}:`,
        error
      );
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy token của bác sĩ cho cuộc hẹn trực tuyến
   * @param {number} appointmentId - ID của cuộc hẹn
   * @returns {Promise} Thông tin token
   */
  async getDoctorToken(appointmentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/online/${appointmentId}/doctor-token`
      );
      // Log token data received from API
      console.log("Doctor token API response:", {
        success: response.data.success,
        hasAppId: !!response.data.data?.appId,
        hasToken: !!response.data.data?.token,
        hasChannelName: !!response.data.data?.channelName,
        appIdSample: response.data.data?.appId
          ? response.data.data.appId
          : "missing",
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error getting doctor token for appointment ${appointmentId}:`,
        error
      );
      throw this.handleApiError(error);
    }
  }

  /**
   * Đồng bộ hóa cuộc hẹn từ backend
   * @returns {Promise} Kết quả đồng bộ hóa
   */
  async syncAppointments() {
    if (this.syncInProgress) {
      return { success: false, message: "Đồng bộ hóa đang diễn ra" };
    }

    try {
      this.syncInProgress = true;

      // Gọi API để đồng bộ hóa cuộc hẹn
      const response = await axios.get(`${API_BASE_URL}/appointments/sync`);

      return (
        response.data || {
          success: true,
          message: "Đồng bộ hóa cuộc hẹn thành công",
        }
      );
    } catch (error) {
      console.error("Error syncing appointments:", error);
      return {
        success: false,
        message: error.message || "Lỗi đồng bộ hóa cuộc hẹn",
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Kiểm tra xem đồng bộ hóa có đang diễn ra không
   * @returns {boolean} Trạng thái đồng bộ hóa
   */
  isSyncInProgress() {
    return this.syncInProgress;
  }

  /**
   * Buộc đồng bộ hóa (cho làm mới thủ công)
   * @returns {Promise} Kết quả đồng bộ hóa
   */
  async forceSync() {
    this.syncInProgress = false;
    return await this.syncAppointments();
  }
}

const appointmentService = new AppointmentService();
export default appointmentService;
