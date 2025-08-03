import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/manager/schedules';

/**
 * ManagerScheduleService - Dịch vụ quản lý lịch làm việc của bác sĩ
 * 
 * Lớp này cung cấp các phương thức để quản lý viên tương tác với API lịch làm việc của bác sĩ, bao gồm:
 * - Lấy danh sách bác sĩ
 * - Lấy lịch làm việc của bác sĩ
 * - Thêm lịch làm việc mới
 * - Thêm nhiều lịch làm việc cùng lúc (batch)
 * - Cập nhật lịch làm việc
 * - Xóa lịch làm việc
 */
class ManagerScheduleService {
  constructor() {
    // Thiết lập axios interceptor cho xác thực
    this.setupInterceptors();
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
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Lấy danh sách tất cả bác sĩ đang hoạt động
   * 
   * @returns {Promise} Danh sách bác sĩ
   */
  async getAllDoctors() {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy lịch làm việc của bác sĩ trong khoảng thời gian
   * 
   * @param {number} doctorId - ID của bác sĩ
   * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
   * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
   * @returns {Promise} Danh sách lịch làm việc
   */
  async getDoctorSchedules(doctorId, startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/${doctorId}`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor ${doctorId} schedules:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Thêm lịch làm việc mới cho bác sĩ
   * 
   * @param {number} doctorId - ID của bác sĩ
   * @param {Object} scheduleData - Dữ liệu lịch làm việc
   * @param {string} scheduleData.date - Ngày làm việc (YYYY-MM-DD)
   * @param {string} scheduleData.startTime - Thời gian bắt đầu (HH:MM)
   * @param {string} scheduleData.endTime - Thời gian kết thúc (HH:MM)
   * @param {number} scheduleData.slotDurationMinutes - Thời lượng mỗi slot (phút)
   * @param {boolean} scheduleData.isAvailable - Trạng thái khả dụng
   * @returns {Promise} Lịch làm việc đã được tạo
   */
  async addDoctorSchedule(doctorId, scheduleData) {
    try {
      // Đảm bảo format đúng cho date và time
      const formattedData = {
        ...scheduleData,
        date: scheduleData.date ? this.formatDateForAPI(scheduleData.date) : undefined,
        startTime: scheduleData.startTime ? this.ensureTimeFormat(scheduleData.startTime) : undefined,
        endTime: scheduleData.endTime ? this.ensureTimeFormat(scheduleData.endTime) : undefined
      };
      
      console.log("Sending schedule data:", formattedData);
      
      const response = await axios.post(`${API_BASE_URL}/doctor/${doctorId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error adding schedule for doctor ${doctorId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Thêm nhiều lịch làm việc cùng lúc cho bác sĩ
   * 
   * @param {number} doctorId - ID của bác sĩ
   * @param {Object} batchData - Dữ liệu lịch làm việc hàng loạt
   * @param {Array<string>} batchData.dates - Danh sách các ngày làm việc (YYYY-MM-DD)
   * @param {string} batchData.startTime - Thời gian bắt đầu (HH:MM)
   * @param {string} batchData.endTime - Thời gian kết thúc (HH:MM)
   * @param {number} batchData.slotDurationMinutes - Thời lượng mỗi slot (phút)
   * @param {boolean} batchData.isAvailable - Trạng thái khả dụng
   * @returns {Promise} Danh sách lịch làm việc đã được tạo
   */
  async addBatchDoctorSchedules(doctorId, batchData) {
    try {
      // Đảm bảo format đúng cho dates và time
      const formattedData = {
        ...batchData,
        dates: batchData.dates ? batchData.dates.map(date => this.formatDateForAPI(date)) : [],
        startTime: batchData.startTime ? this.ensureTimeFormat(batchData.startTime) : undefined,
        endTime: batchData.endTime ? this.ensureTimeFormat(batchData.endTime) : undefined
      };
      
      console.log("Sending batch schedule data:", formattedData);
      
      const response = await axios.post(`${API_BASE_URL}/doctor/${doctorId}/batch`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error adding batch schedules for doctor ${doctorId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Cập nhật lịch làm việc của bác sĩ
   * 
   * @param {number} scheduleId - ID của lịch làm việc
   * @param {Object} scheduleData - Dữ liệu lịch làm việc cập nhật
   * @param {string} scheduleData.date - Ngày làm việc (YYYY-MM-DD)
   * @param {string} scheduleData.startTime - Thời gian bắt đầu (HH:MM)
   * @param {string} scheduleData.endTime - Thời gian kết thúc (HH:MM)
   * @param {number} scheduleData.slotDurationMinutes - Thời lượng mỗi slot (phút)
   * @param {boolean} scheduleData.isAvailable - Trạng thái khả dụng
   * @returns {Promise} Lịch làm việc đã được cập nhật
   */
  async updateSchedule(scheduleId, scheduleData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${scheduleId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Xóa lịch làm việc
   * 
   * @param {number} scheduleId - ID của lịch làm việc
   * @returns {Promise} Kết quả xóa
   */
  async deleteSchedule(scheduleId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting schedule ${scheduleId}:`, error);
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
          return new Error(data.message || 'Dữ liệu không hợp lệ');
        case 401:
          return new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        case 403:
          return new Error('Bạn không có quyền thực hiện thao tác này');
        case 404:
          return new Error('Không tìm thấy dữ liệu yêu cầu');
        case 409:
          return new Error(data.message || 'Lịch làm việc bị trùng lặp');
        case 500:
          return new Error('Lỗi server. Vui lòng thử lại sau');
        default:
          return new Error(data.message || 'Có lỗi xảy ra. Vui lòng thử lại');
      }
    } else if (error.request) {
      // Lỗi mạng
      return new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
    } else {
      // Lỗi khác
      return new Error(error.message || 'Có lỗi không xác định xảy ra');
    }
  }

  /**
   * Định dạng ngày thành định dạng API (YYYY-MM-DD)
   * @param {Date|string} date - Ngày cần định dạng
   * @returns {string} Ngày đã định dạng
   */
  formatDateForAPI(date) {
    if (!date) return '';
    if (typeof date === 'string') {
      // Nếu đã đúng định dạng YYYY-MM-DD thì trả về luôn
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Đảm bảo thời gian đúng định dạng HH:MM
   * @param {string} time - Thời gian cần định dạng
   * @returns {string} Thời gian đã định dạng
   */
  ensureTimeFormat(time) {
    if (!time) return '';
    
    // Nếu đã đúng định dạng HH:MM hoặc HH:MM:SS thì trả về
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      // Đảm bảo chỉ lấy HH:MM nếu có thêm giây
      if (time.length > 5) {
        return time.substring(0, 5);
      }
      return time;
    }
    
    // Xử lý các trường hợp khác
    try {
      const parts = time.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = (parts[1] || '00').padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return time; // Trả về nguyên bản nếu không xử lý được
    }
  }
}

const managerScheduleService = new ManagerScheduleService();
export default managerScheduleService; 