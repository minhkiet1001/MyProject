import axios from "axios";
import authService from "./authService";

const API_BASE_URL = "http://localhost:8080/api/medical-records";

/**
 * MedicalRecordsService - Dịch vụ quản lý hồ sơ y tế
 *
 * Lớp này cung cấp các phương thức để tương tác với API hồ sơ y tế, bao gồm:
 * - Lấy kết quả xét nghiệm
 * - Lấy thông tin phác đồ điều trị
 * - Quản lý dữ liệu liên quan đến điều trị HIV
 * - Định dạng và xử lý dữ liệu y tế
 */
class MedicalRecordsService {
  constructor() {
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
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Xử lý lỗi API
   * @param {Error} error - Lỗi từ axios
   * @returns {Object} Đối tượng lỗi được định dạng
   */
  handleApiError(error) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi kết nối với server",
    };
  }

  /**
   * Lấy tất cả kết quả xét nghiệm của người dùng hiện tại
   * @returns {Promise} Danh sách kết quả xét nghiệm
   */
  async getLabResults() {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-results`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lab results:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy kết quả xét nghiệm liên quan đến HIV (CD4, Viral Load, HIV Test)
   * @returns {Promise} Danh sách kết quả xét nghiệm HIV
   */
  async getHivTests() {
    try {
      const response = await axios.get(`${API_BASE_URL}/lab-results/hiv-tests`);
      return response.data;
    } catch (error) {
      console.error("Error fetching HIV tests:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy kết quả xét nghiệm CD4 mới nhất
   * @returns {Promise} Kết quả CD4 mới nhất
   */
  async getLatestCD4() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/latest-cd4`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching latest CD4:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy kết quả tải lượng virus mới nhất
   * @returns {Promise} Kết quả tải lượng virus mới nhất
   */
  async getLatestViralLoad() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/latest-viral-load`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching latest viral load:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy kết quả xét nghiệm theo loại
   * @param {string} testType - Loại xét nghiệm (ví dụ: CD4, VIRAL_LOAD)
   * @returns {Promise} Danh sách kết quả xét nghiệm theo loại
   */
  async getLabResultsByType(testType) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/type/${testType}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching lab results for type ${testType}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy kết quả xét nghiệm theo ID
   * @param {number} resultId - ID kết quả xét nghiệm
   * @returns {Promise} Chi tiết kết quả xét nghiệm
   */
  async getLabResultById(resultId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/${resultId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching lab result ${resultId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy tất cả phác đồ điều trị của người dùng hiện tại
   * @returns {Promise} Danh sách phác đồ điều trị
   */
  async getTreatmentPlans() {
    try {
      const response = await axios.get(`${API_BASE_URL}/treatment-plans`);
      return response.data;
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy phác đồ điều trị đang hoạt động (phác đồ ARV hiện tại)
   * @returns {Promise} Danh sách phác đồ điều trị đang hoạt động
   */
  async getActiveTreatmentPlans() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/treatment-plans/active`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active treatment plans:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lấy kết quả xét nghiệm trong khoảng thời gian
   * @param {string} startDate - Ngày bắt đầu (định dạng YYYY-MM-DD)
   * @param {string} endDate - Ngày kết thúc (định dạng YYYY-MM-DD)
   * @returns {Promise} Danh sách kết quả xét nghiệm trong khoảng thời gian
   */
  async getLabResultsInDateRange(startDate, endDate) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/date-range`,
        {
          params: { startDate, endDate },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lab results in date range:", error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Đếm số lượng kết quả xét nghiệm theo loại
   * @param {string} testType - Loại xét nghiệm
   * @returns {Promise} Số lượng kết quả xét nghiệm
   */
  async countLabResultsByType(testType) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lab-results/count/${testType}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error counting lab results for type ${testType}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Định dạng ngày cho các API call
   * @param {Date|string} date - Ngày cần định dạng
   * @returns {string} Ngày đã định dạng (YYYY-MM-DD)
   */
  formatDateForApi(date) {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }
    return date;
  }

  /**
   * Phân tích ngày từ API response
   * @param {string} dateString - Chuỗi ngày từ API
   * @returns {Date} Đối tượng Date
   */
  parseDateFromApi(dateString) {
    return new Date(dateString);
  }

  /**
   * Lấy màu cho trạng thái kết quả xét nghiệm
   * @param {string} status - Trạng thái kết quả
   * @returns {string} Màu CSS cho trạng thái
   */
  getTestResultStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "normal":
      case "excellent":
        return "text-green-600 bg-green-100";
      case "low":
      case "high":
      case "attention":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
      case "abnormal":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  /**
   * Lấy văn bản trạng thái kết quả xét nghiệm theo tiếng Việt
   * @param {string} status - Trạng thái kết quả
   * @returns {string} Văn bản trạng thái theo tiếng Việt
   */
  getTestResultStatusText(status) {
    switch (status?.toLowerCase()) {
      case "normal":
        return "Bình thường";
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "low":
        return "Thấp";
      case "high":
        return "Cao";
      case "critical":
        return "Nguy hiểm";
      case "abnormal":
        return "Bất thường";
      case "pending":
        return "Chờ kết quả";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status || "Không xác định";
    }
  }

  /**
   * Lấy văn bản trạng thái phác đồ theo tiếng Việt
   * @param {string} status - Trạng thái phác đồ
   * @returns {string} Văn bản trạng thái theo tiếng Việt
   */
  getTreatmentPlanStatusText(status) {
    switch (status?.toLowerCase()) {
      case "active":
        return "Đang điều trị";
      case "completed":
        return "Hoàn thành";
      case "discontinued":
        return "Ngừng điều trị";
      case "paused":
        return "Tạm dừng";
      default:
        return status || "Không xác định";
    }
  }

  /**
   * Lấy màu cho trạng thái phác đồ
   * @param {string} status - Trạng thái phác đồ
   * @returns {string} Màu CSS cho trạng thái
   */
  getTreatmentPlanStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "discontinued":
        return "text-red-600 bg-red-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }
}

const medicalRecordsService = new MedicalRecordsService();
export default medicalRecordsService;
