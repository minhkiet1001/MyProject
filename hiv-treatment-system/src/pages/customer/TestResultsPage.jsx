import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import medicalRecordsService from "../../services/medicalRecordsService";
import {
  BeakerIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * TestResultsPage - Trang hiển thị kết quả xét nghiệm cho bệnh nhân
 *
 * Chức năng chính:
 * 1. Hiển thị danh sách các kết quả xét nghiệm đã thực hiện
 * 2. Phân loại kết quả xét nghiệm theo danh mục (CD4, Viral Load, v.v.)
 * 3. Hiển thị chi tiết kết quả xét nghiệm
 * 4. Hiển thị thông tin phác đồ điều trị liên quan
 * 5. Xem lịch sử xét nghiệm theo thời gian
 */
const TestResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all"); // Danh mục xét nghiệm đang chọn
  const [selectedTestId, setSelectedTestId] = useState(null); // ID xét nghiệm đang xem chi tiết
  const [selectedRegimen, setSelectedRegimen] = useState(null); // Phác đồ đang xem chi tiết
  const [showRegimenModal, setShowRegimenModal] = useState(false); // Hiển thị modal phác đồ
  const [showTestHistoryModal, setShowTestHistoryModal] = useState(false); // Hiển thị modal lịch sử xét nghiệm

  // States lưu trữ dữ liệu từ API
  const [testResults, setTestResults] = useState([]); // Danh sách kết quả xét nghiệm
  const [treatmentPlans, setTreatmentPlans] = useState([]); // Tất cả phác đồ điều trị
  const [activeTreatmentPlans, setActiveTreatmentPlans] = useState([]); // Phác đồ điều trị đang áp dụng
  const [loading, setLoading] = useState(true); // Đang tải kết quả xét nghiệm
  const [treatmentLoading, setTreatmentLoading] = useState(true); // Đang tải phác đồ điều trị
  const [error, setError] = useState(null); // Lỗi khi tải kết quả xét nghiệm
  const [treatmentError, setTreatmentError] = useState(null); // Lỗi khi tải phác đồ điều trị

  /**
   * Xử lý tham số URL để chuyển hướng trực tiếp
   * - Ví dụ: /test-results?category=cd4 sẽ hiển thị danh mục CD4
   */
  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  /**
   * Tải dữ liệu kết quả xét nghiệm và phác đồ điều trị khi component được mount
   */
  useEffect(() => {
    loadTestResults();
    loadTreatmentPlans();
  }, []);

  /**
   * Tải danh sách kết quả xét nghiệm từ API
   * - Chuyển đổi dữ liệu trả về để phù hợp với cấu trúc hiển thị
   * - Gán các thông tin bổ sung như tên hiển thị, danh mục, trạng thái, v.v.
   */
  const loadTestResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await medicalRecordsService.getLabResults();

      if (response.success) {
        // Chuyển đổi dữ liệu API để phù hợp với cấu trúc component
        const transformedResults = (response.data || [])
          .filter(
            (result) =>
              result.testType === "CD4" ||
              result.testType === "VIRAL_LOAD" ||
              result.testType === "HIV_TEST"
          )
          .map((result) => ({
            id: result.id,
            testName: getTestDisplayName(result.testType),
            date: new Date(result.testDate),
            category: mapTestTypeToCategory(result.testType),
            result: result.result,
            unit: result.unit || "",
            referenceRange: result.referenceRange || "",
            status:
              result.status || mapInterpretationToStatus(result.interpretation),
            doctorName: result.doctorName || "N/A",
            notes: result.notes || "",
            approvalStatus: result.approvalStatus,
            interpretation:
              result.notes ||
              getDefaultInterpretation(result.testType, result.result),
          }));

        setTestResults(transformedResults);
      } else {
        setError(response.message || "Không thể tải kết quả xét nghiệm");
      }
    } catch (err) {
      console.error("Error loading test results:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải danh sách phác đồ điều trị từ API
   * - Lấy cả phác đồ đang hoạt động và tất cả phác đồ
   */
  const loadTreatmentPlans = async () => {
    try {
      setTreatmentLoading(true);
      setTreatmentError(null);

      // Tải song song cả phác đồ đang hoạt động và tất cả phác đồ
      const [activeResponse, allResponse] = await Promise.all([
        medicalRecordsService.getActiveTreatmentPlans(),
        medicalRecordsService.getTreatmentPlans(),
      ]);

      if (activeResponse.success) {
        setActiveTreatmentPlans(activeResponse.data || []);
      }

      if (allResponse.success) {
        setTreatmentPlans(allResponse.data || []);
      }

      if (!activeResponse.success && !allResponse.success) {
        setTreatmentError("Không thể tải phác đồ điều trị");
      }
    } catch (err) {
      console.error("Error loading treatment plans:", err);
      setTreatmentError(
        err.message || "Đã xảy ra lỗi khi tải phác đồ điều trị"
      );
    } finally {
      setTreatmentLoading(false);
    }
  };

  /**
   * Lấy tên hiển thị cho loại xét nghiệm
   * @param {string} testType - Mã loại xét nghiệm
   * @returns {string} Tên hiển thị của xét nghiệm
   */
  const getTestDisplayName = (testType) => {
    const testNames = {
      CD4: "Số lượng CD4+ T-cells",
      VIRAL_LOAD: "Tải lượng virus HIV",
      HIV_TEST: "Xét nghiệm HIV",
      BLOOD_COUNT: "Công thức máu",
      LIVER_FUNCTION: "Xét nghiệm khác",
      KIDNEY_FUNCTION: "Xét nghiệm khác",
      OTHER: "Xét nghiệm khác",
    };
    return testNames[testType] || testType;
  };

  /**
   * Ánh xạ loại xét nghiệm sang danh mục
   * @param {string} testType - Mã loại xét nghiệm
   * @returns {string} Tên danh mục xét nghiệm
   */
  const mapTestTypeToCategory = (testType) => {
    const categoryMap = {
      CD4: "CD4 Count",
      VIRAL_LOAD: "Viral Load",
      HIV_TEST: "Viral Load",
      BLOOD_COUNT: "Blood Work",
      LIVER_FUNCTION: "Other",
      KIDNEY_FUNCTION: "Other",
      OTHER: "Other",
    };
    return categoryMap[testType] || "Other";
  };

  /**
   * Ánh xạ kết quả diễn giải sang trạng thái hiển thị
   * @param {string} interpretation - Kết quả diễn giải xét nghiệm
   * @returns {string} Trạng thái hiển thị (normal/abnormal/approved)
   */
  const mapInterpretationToStatus = (interpretation) => {
    if (!interpretation) return "normal";

    const statusMap = {
      EXCELLENT: "approved",
      NORMAL: "approved",
      GOOD: "approved",
      "bình thường": "approved",
      LOW: "abnormal",
      HIGH: "abnormal",
      CRITICAL: "abnormal",
      ABNORMAL: "abnormal",
    };
    return statusMap[interpretation] || "normal";
  };

  /**
   * Tạo diễn giải mặc định cho kết quả xét nghiệm
   * @param {string} testType - Mã loại xét nghiệm
   * @param {string} result - Kết quả xét nghiệm
   * @returns {string} Diễn giải mặc định
   */
  const getDefaultInterpretation = (testType, result) => {
    // Cung cấp diễn giải mặc định dựa trên loại xét nghiệm và kết quả
    switch (testType) {
      case "CD4":
        const cd4Value = parseInt(result);
        if (cd4Value > 500)
          return "Số lượng CD4 tốt, hệ miễn dịch đang hoạt động hiệu quả.";
        if (cd4Value > 200)
          return "Số lượng CD4 ở mức trung bình, cần theo dõi.";
        return "Số lượng CD4 thấp, cần tăng cường điều trị.";
      case "VIRAL_LOAD":
        if (
          result.includes("<") ||
          result.toLowerCase().includes("undetectable")
        ) {
          return "Tải lượng virus không phát hiện được - điều này rất tốt và cho thấy thuốc ARV đang hoạt động hiệu quả.";
        }
        return "Cần theo dõi tải lượng virus và có thể điều chỉnh phác đồ điều trị.";
      default:
        return "Kết quả xét nghiệm đã được ghi nhận.";
    }
  };

  /**
   * Lấy thông tin ý nghĩa lâm sàng mặc định cho loại xét nghiệm
   * @param {string} testType - Mã loại xét nghiệm
   * @returns {string} Ý nghĩa lâm sàng
   */
  const getDefaultClinicalSignificance = (testType) => {
    switch (testType) {
      case "CD4":
        return "CD4 > 500 cho thấy hệ miễn dịch mạnh, nguy cơ nhiễm trùng cơ hội thấp.";
      case "VIRAL_LOAD":
        return "Tải lượng virus không phát hiện được có nghĩa là nguy cơ lây truyền HIV cho người khác gần như bằng 0 (U=U: Undetectable = Untransmittable).";
      default:
        return "Kết quả này giúp theo dõi tình trạng sức khỏe và hiệu quả điều trị.";
    }
  };

  /**
   * Định dạng ngày hiển thị
   * @param {string|Date} dateString - Ngày cần định dạng
   * @returns {string} Chuỗi ngày đã định dạng
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return "N/A";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} ngày`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0
        ? `${years} năm ${remainingMonths} tháng`
        : `${years} năm`;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

    const statusLower = typeof status === "string" ? status.toLowerCase() : "";

    switch (statusLower) {
      case "normal":
      case "bình thường":
      case "approved":
      case "stable":
        return "bg-green-100 text-green-800 border-green-200";
      case "abnormal":
      case "critical":
      case "attention":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "unknown":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    if (!status) return "Không xác định";

    const statusLower = typeof status === "string" ? status.toLowerCase() : "";

    switch (statusLower) {
      case "normal":
      case "bình thường":
        return "Nguy hiểm";
      case "abnormal":
        return "Bất thường";
      case "critical":
        return "Nguy hiểm";
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Bình thường";
      case "rejected":
        return "Đã từ chối";
      case "unknown":
        return "Không xác định";
      default:
        // Try to interpret numeric values (for CD4 and viral load)
        if (!isNaN(status)) {
          const numValue = parseFloat(status);
          if (numValue > 0) {
            return status; // Return the actual value
          }
        }
        return status || "Không xác định";
    }
  };

  // Get status indicator color
  const getStatusIndicator = (status) => {
    if (!status) return "bg-gray-500";

    const statusLower = typeof status === "string" ? status.toLowerCase() : "";

    switch (statusLower) {
      case "normal":
      case "approved":
      case "stable":
        return "bg-green-500";
      case "attention":
      case "pending":
      case "waiting":
        return "bg-yellow-500";
      case "critical":
      case "abnormal":
      case "rejected":
      case "bình thường":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Use only real data from API
  const displayResults = testResults;

  // Filter results based on selected category
  const filteredResults =
    selectedCategory === "all"
      ? displayResults
      : displayResults.filter((test) => test.category === selectedCategory);

  // Sort by date (newest first)
  const sortedResults = [...filteredResults].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // Group results by date
  const resultsByDate = sortedResults.reduce((groups, test) => {
    const dateStr = test.date.toISOString().split("T")[0];
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(test);
    return groups;
  }, {});

  // Find the selected test
  const selectedTest = selectedTestId
    ? displayResults.find((test) => test.id === selectedTestId)
    : null;

  // Get comprehensive HIV indicators summary - SIMPLIFY THIS FUNCTION
  const getHIVIndicatorsSummary = () => {
    const latestViralLoad = displayResults
      .filter((test) => test.category === "Viral Load")
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    const latestCD4 = displayResults
      .filter((test) => test.category === "CD4 Count")
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    return {
      viralLoad: latestViralLoad,
      cd4Count: latestCD4,
    };
  };

  const hivSummary = getHIVIndicatorsSummary();

  // Modal Component for Treatment Plan Details
  const RegimenModal = ({ regimen, isOpen, onClose }) => {
    if (!isOpen || !regimen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <CpuChipIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Chi tiết phác đồ điều trị #{regimen.id}
                  </h2>
                  <p className="text-gray-600">
                    Bác sĩ: {regimen.doctorName || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin phác đồ điều trị
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Ngày bắt đầu:</span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                      {formatDate(regimen.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Ngày kết thúc:</span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                      {regimen.endDate
                        ? formatDate(regimen.endDate)
                        : "Đang thực hiện"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Thời gian điều trị:</span>
                    <span className="font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded">
                      {calculateDuration(regimen.startDate, regimen.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-semibold px-3 py-1 rounded ${
                        regimen.status === "COMPLETED"
                          ? "text-gray-700 bg-gray-100"
                          : regimen.status === "ACTIVE"
                          ? "text-green-700 bg-green-100"
                          : regimen.status === "PAUSED"
                          ? "text-yellow-700 bg-yellow-100"
                          : regimen.status === "DISCONTINUED"
                          ? "text-red-700 bg-red-100"
                          : "text-blue-700 bg-blue-100"
                      }`}
                    >
                      {regimen.status === "COMPLETED"
                        ? "Đã hoàn thành"
                        : regimen.status === "ACTIVE"
                        ? "Đang thực hiện"
                        : regimen.status === "PAUSED"
                        ? "Tạm dừng"
                        : regimen.status === "DISCONTINUED"
                        ? "Đã ngừng"
                        : "Không xác định"}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Mô tả phác đồ điều trị
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {regimen.description ||
                        "Phác đồ điều trị ARV được chỉ định phù hợp với tình trạng sức khỏe hiện tại của bệnh nhân."}
                    </p>
                  </div>
                  {regimen.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        Ghi chú từ bác sĩ:
                      </p>
                      <p className="text-sm text-blue-700">{regimen.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Treatment Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BeakerIcon className="h-5 w-5 mr-2 text-purple-600" />
                Chi tiết điều trị
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-300 pl-4 bg-purple-50 p-4 rounded-r-lg">
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Thông tin điều trị
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="ml-2 font-medium">
                        {formatDateTime(regimen.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cập nhật lần cuối:</span>
                      <span className="ml-2 font-medium">
                        {formatDateTime(regimen.updatedAt)}
                      </span>
                    </div>
                  </div>
                  {regimen.medications && regimen.medications.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Thuốc được kê đơn:
                      </h5>
                      <div className="space-y-2">
                        {regimen.medications.map((med, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded border"
                          >
                            <span className="font-medium">{med.name}</span>
                            {med.dosage && (
                              <span className="text-gray-600 ml-2">
                                - {med.dosage}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Treatment Guidelines */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Hướng dẫn điều trị
              </h3>
              <div className="space-y-3">
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-green-500 mr-3 mt-0.5 font-bold text-lg">
                    ✓
                  </span>
                  <span className="text-sm text-green-700 leading-relaxed">
                    Tuân thủ đúng lịch uống thuốc theo chỉ định của bác sĩ
                  </span>
                </div>
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-green-500 mr-3 mt-0.5 font-bold text-lg">
                    ✓
                  </span>
                  <span className="text-sm text-green-700 leading-relaxed">
                    Theo dõi định kỳ các chỉ số sức khỏe và xét nghiệm
                  </span>
                </div>
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-green-500 mr-3 mt-0.5 font-bold text-lg">
                    ✓
                  </span>
                  <span className="text-sm text-green-700 leading-relaxed">
                    Duy trì lối sống lành mạnh và chế độ dinh dưỡng phù hợp
                  </span>
                </div>
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-green-500 mr-3 mt-0.5 font-bold text-lg">
                    ✓
                  </span>
                  <span className="text-sm text-green-700 leading-relaxed">
                    Liên hệ bác sĩ ngay khi có bất kỳ triệu chứng bất thường nào
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Thông tin bổ sung
              </h3>
              <div className="space-y-3">
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-blue-500 mr-3 mt-0.5">📋</span>
                  <span className="text-sm text-blue-700">
                    Phác đồ điều trị này được thiết kế riêng cho tình trạng sức
                    khỏe hiện tại của bạn
                  </span>
                </div>
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-blue-500 mr-3 mt-0.5">⏰</span>
                  <span className="text-sm text-blue-700">
                    Thời gian điều trị có thể được điều chỉnh dựa trên kết quả
                    xét nghiệm định kỳ
                  </span>
                </div>
                <div className="flex items-start bg-white p-3 rounded-lg">
                  <span className="text-blue-500 mr-3 mt-0.5">🏥</span>
                  <span className="text-sm text-blue-700">
                    Vui lòng đặt lịch tái khám theo lịch hẹn để theo dõi tiến
                    triển điều trị
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Component for Test History
  const TestHistoryModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Lịch sử xét nghiệm
                  </h2>
                  <p className="text-gray-600">
                    Theo dõi tiến triển qua các lần xét nghiệm
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">🔍 Tất cả xét nghiệm</option>
                  <option value="Viral Load">🦠 Tải lượng virus HIV</option>
                  <option value="CD4 Count">🛡️ Số lượng CD4</option>
                </select>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {selectedTest ? (
              /* Detailed Test View */
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <BeakerIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {selectedTest.testName}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(selectedTest.date)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTestId(null)}
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Quay lại danh sách
                  </Button>
                </div>

                {/* Test Result Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <ChartBarIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        Kết quả
                      </h5>
                    </div>
                    <div className="mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {selectedTest.result} {selectedTest.unit}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Phạm vi tham chiếu:</strong>
                        <br />
                        {selectedTest.referenceRange || "Không có thông tin"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <InformationCircleIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        Thông tin xét nghiệm
                      </h5>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Ngày xét nghiệm:</strong>
                        <br />
                        {formatDate(selectedTest.date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Information Sections */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <BookOpenIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        Ghi chú
                      </h5>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedTest.interpretation || "Không có ghi chú"}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                        <svg
                          className="h-5 w-5 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900">
                        Thông tin bác sĩ
                      </h5>
                    </div>
                    <p className="text-gray-700">
                      Được xét nghiệm bởi:{" "}
                      <strong>{selectedTest.doctorName}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Test Results List */
              <div>
                {Object.keys(resultsByDate).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(resultsByDate).map(([dateStr, tests]) => (
                      <div
                        key={dateStr}
                        className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {formatDate(new Date(dateStr))}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tests.map((test) => (
                            <div
                              key={test.id}
                              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                              onClick={() => setSelectedTestId(test.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {test.testName}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {test.category}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-right">
                                    <span className="text-sm font-bold text-gray-900 block">
                                      {test.result} {test.unit}
                                    </span>
                                  </div>
                                  <EyeIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                    <div className="p-4 bg-white rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                      <BeakerIcon className="h-12 w-12 text-gray-300 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Không có kết quả xét nghiệm
                    </h3>
                    <p className="text-gray-500">
                      Không tìm thấy kết quả xét nghiệm nào cho danh mục đã
                      chọn.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.CUSTOMER} userName="Nguyễn Văn An">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tra cứu thông tin xét nghiệm
              </h1>
              <p className="text-gray-600 mt-1">
                Lịch sử xét nghiệm cá nhân và thông tin chi tiết về các phác đồ
                điều trị hiện tại
              </p>
            </div>
            <div className="flex space-x-3">
              {/* <Button variant="primary" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Đặt lịch xét nghiệm
              </Button> */}
            </div>
          </div>
        </div>

        {/* Main Content - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - HIV Indicators Summary */}
          <div className="space-y-6">
            {/* HIV Indicators Summary */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Tổng hợp chỉ số HIV
                </h2>
                <p className="text-gray-600 mt-2">
                  Tổng quan về tình trạng sức khỏe và hiệu quả điều trị HIV
                </p>
              </div>
              <div className="p-6">
                {/* Overall Status */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full mr-4">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">
                          Tình trạng tổng thể: Xuất sắc
                        </h3>
                        <p className="text-green-700">
                          Điều trị HIV hiệu quả, hệ miễn dịch mạnh
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {hivSummary.viralLoad?.result?.includes("<") ||
                        hivSummary.viralLoad?.result
                          ?.toLowerCase()
                          .includes("undetectable")
                          ? "100%"
                          : "—"}
                      </div>
                      <div className="text-sm text-green-700">
                        Hiệu quả điều trị
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Indicators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Viral Load Indicator */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <BeakerIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          Tải lượng virus
                        </h4>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {hivSummary.viralLoad?.result}{" "}
                        {hivSummary.viralLoad?.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">
                        Không phát hiện
                      </span>
                      <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      U=U: Không lây truyền
                    </p>
                  </div>

                  {/* CD4 Count Indicator */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          CD4 Count
                        </h4>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {hivSummary.cd4Count?.result}{" "}
                        {hivSummary.cd4Count?.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">
                        Hệ miễn dịch mạnh
                      </span>
                      <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Tình trạng miễn dịch tốt
                    </p>
                  </div>
                </div>

                {/* Treatment Progress */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Tiến triển điều trị
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {activeTreatmentPlans.length > 0
                          ? calculateDuration(activeTreatmentPlans[0].startDate)
                          : "—"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Thời gian điều trị
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {hivSummary.viralLoad?.result?.includes("<") ||
                        hivSummary.viralLoad?.result
                          ?.toLowerCase()
                          .includes("undetectable")
                          ? "100%"
                          : "—"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Tuân thủ điều trị
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {testResults.filter(
                          (test) =>
                            (test.status === "approved" ||
                              test.status === "normal") &&
                            (test.category === "CD4 Count" ||
                              test.category === "Viral Load")
                        ).length || "0"}
                        /
                        {testResults.filter(
                          (test) =>
                            test.category === "CD4 Count" ||
                            test.category === "Viral Load"
                        ).length || "0"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Lần xét nghiệm tốt
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    className="flex-1 flex items-center justify-center"
                    onClick={() => setShowTestHistoryModal(true)}
                  >
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Xem lịch sử xét nghiệm
                  </Button>
                  {/* <Button variant="outline" className="flex items-center">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Báo cáo chi tiết
                  </Button> */}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Treatment Plans */}
          <div className="space-y-6">
            {/* Active Treatment Plans */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <CpuChipIcon className="h-6 w-6 mr-2 text-primary-600" />
                      Phác đồ điều trị hiện tại
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Các phác đồ điều trị đang được thực hiện theo chỉ định của
                      bác sĩ
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadTreatmentPlans}
                    className="flex items-center"
                    disabled={treatmentLoading}
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 mr-2 ${
                        treatmentLoading ? "animate-spin" : ""
                      }`}
                    />
                    Làm mới
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {treatmentLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">
                      Đang tải phác đồ điều trị...
                    </p>
                  </div>
                ) : treatmentError ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không thể tải dữ liệu
                    </h3>
                    <p className="text-gray-600 mb-4">{treatmentError}</p>
                    <Button onClick={loadTreatmentPlans} variant="primary">
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Thử lại
                    </Button>
                  </div>
                ) : activeTreatmentPlans.length > 0 ? (
                  <div className="space-y-3">
                    {activeTreatmentPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                      >
                        <div
                          className="w-full text-left p-4 rounded-lg transition-all hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedRegimen(plan);
                            setShowRegimenModal(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CpuChipIcon className="h-5 w-5 text-primary-600 mr-3" />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  Phác đồ điều trị #{plan.id}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Bác sĩ: {plan.doctorName || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {plan.description || "Phác đồ điều trị ARV"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Bắt đầu: {formatDate(plan.startDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Đang thực hiện
                              </span>
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có phác đồ điều trị
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Bạn hiện tại chưa có phác đồ điều trị nào đang được thực
                      hiện.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() =>
                        (window.location.href = "/customer/appointments")
                      }
                      className="flex items-center"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Đặt lịch khám
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* All Treatment Plans History */}
            {treatmentPlans.length > 0 && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Lịch sử phác đồ điều trị
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Tất cả các phác đồ điều trị đã và đang thực hiện
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {treatmentPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className="w-full text-left p-3 rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedRegimen(plan);
                            setShowRegimenModal(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 text-gray-500 mr-3" />
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  Phác đồ điều trị #{plan.id}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {formatDate(plan.startDate)} -{" "}
                                  {plan.endDate
                                    ? formatDate(plan.endDate)
                                    : "Đang thực hiện"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  plan.endDate
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {plan.endDate
                                  ? "Đã hoàn thành"
                                  : "Đang thực hiện"}
                              </span>
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <RegimenModal
          regimen={selectedRegimen}
          isOpen={showRegimenModal}
          onClose={() => {
            setShowRegimenModal(false);
            setSelectedRegimen(null);
          }}
        />

        <TestHistoryModal
          isOpen={showTestHistoryModal}
          onClose={() => {
            setShowTestHistoryModal(false);
            setSelectedTestId(null);
          }}
        />
      </div>
    </Layout>
  );
};

export default TestResultsPage;
