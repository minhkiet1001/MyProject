
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types";
import Button from "../../components/common/Button";
import PatientRecordModal from "../../components/doctor/PatientRecordModal";
import doctorAppointmentService from "../../services/doctorAppointmentService";
import doctorLabResultService from "../../services/doctorLabResultService";

import {
  UserCircleIcon,
  CalendarIcon,
  ClockIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import PendingLabResults from "../../components/doctor/PendingLabResults";
import { toast } from "react-toastify";

const DoctorDashboardPage = () => {
  // State quản lý danh sách bệnh nhân theo từng loại
  const [checkedInPatients, setCheckedInPatients] = useState([]); // Bệnh nhân đã check-in và chờ khám
  const [onlineAppointments, setOnlineAppointments] = useState([]); // Cuộc hẹn tư vấn trực tuyến
  const [approvedLabResultAppointments, setApprovedLabResultAppointments] =
    useState([]); // Bệnh nhân có kết quả xét nghiệm được duyệt, chờ lập kế hoạch điều trị
  
  // State quản lý modal chi tiết hồ sơ bệnh nhân
  const [showPatientRecordModal, setShowPatientRecordModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // State quản lý UI và thông báo
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [showNotification, setShowNotification] = useState(false); // Hiển thị thông báo bệnh nhân mới
  const [newCheckedInPatient, setNewCheckedInPatient] = useState(null); // Thông tin bệnh nhân mới check-in
  
  // Hook điều hướng
  const navigate = useNavigate();

  /**
   * Effect hook để tải dữ liệu dashboard và thiết lập cơ chế tự động cập nhật
   * - Tải dữ liệu ban đầu khi component mount
   * - Thiết lập polling mỗi 60 giây để cập nhật dữ liệu mới
   * - Dọn dẹp interval khi component unmount
   */
  useEffect(() => {
    // Tải dữ liệu ban đầu
    fetchDashboardData();

    // Thiết lập polling để cập nhật dữ liệu mỗi phút
    const pollingInterval = setInterval(() => {
      fetchDashboardData(true); // polling=true: không hiển thị loading state
    }, 60000); // Cập nhật mỗi phút

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(pollingInterval);
  }, []);

  /**
   * Hàm tải dữ liệu chính cho dashboard
   * - Tải danh sách bệnh nhân đã check-in
   * - Tải danh sách cuộc hẹn tư vấn trực tuyến (CONFIRMED và UNDER_REVIEW)
   * - Tải danh sách bệnh nhân có kết quả xét nghiệm được duyệt
   * - Hiển thị thông báo nếu phát hiện bệnh nhân mới check-in
   * 
   * @param {boolean} polling - Đánh dấu đang trong quá trình polling tự động hay không
   */
  const fetchDashboardData = async (polling = false) => {
    try {
      // Chỉ hiện loading indicator khi không phải đang polling
      setIsLoading(!polling);

      // 1. Tải danh sách bệnh nhân đã check-in
      const checkedInResponse =
        await doctorAppointmentService.getAppointmentsByStatus("CHECKED_IN");

      if (checkedInResponse.success) {
        // Phát hiện bệnh nhân mới check-in khi đang polling
        if (
          polling &&
          checkedInResponse.data.length > 0 &&
          checkedInPatients.length < checkedInResponse.data.length
        ) {
          // Tìm bệnh nhân mới (không tồn tại trong danh sách hiện có)
          const existingIds = checkedInPatients.map((p) => p.id);
          const newPatients = checkedInResponse.data.filter(
            (p) => !existingIds.includes(p.id)
          );

          // Hiển thị thông báo với thông tin bệnh nhân mới đầu tiên
          if (newPatients.length > 0) {
            setNewCheckedInPatient(newPatients[0]);
            setShowNotification(true);
          }
        }

        // Lọc ra các cuộc hẹn trực tiếp (không phải trực tuyến)
        const inPersonAppointments = checkedInResponse.data.filter(
          (appointment) => !appointment.isOnline
        );
        setCheckedInPatients(inPersonAppointments);

        // 2. Tải danh sách cuộc hẹn trực tuyến đã xác nhận (CONFIRMED)
        const onlineResponse =
          await doctorAppointmentService.getAppointmentsByStatus("CONFIRMED");
        if (onlineResponse.success) {
          // Lọc chỉ lấy các cuộc hẹn trực tuyến
          const onlineAppts = onlineResponse.data.filter(
            (appointment) => appointment.isOnline
          );

          // 3. Tải thêm cuộc hẹn trực tuyến đang được tiếp nhận (UNDER_REVIEW)
          const underReviewResponse =
            await doctorAppointmentService.getAppointmentsByStatus(
              "UNDER_REVIEW"
            );
          if (underReviewResponse.success) {
            // Lọc chỉ lấy các cuộc hẹn trực tuyến
            const underReviewOnlineAppts = underReviewResponse.data.filter(
              (appointment) => appointment.isOnline
            );
            // Kết hợp cả hai danh sách cuộc hẹn trực tuyến
            setOnlineAppointments([...onlineAppts, ...underReviewOnlineAppts]);
          } else {
            setOnlineAppointments(onlineAppts);
          }
        }
      }

      // 4. Tải danh sách bệnh nhân có kết quả xét nghiệm đã được duyệt
      const approvedLabResultsResponse =
        await doctorLabResultService.getAppointmentsWithApprovedLabResults();
      if (approvedLabResultsResponse.success) {
        setApprovedLabResultAppointments(approvedLabResultsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mở modal chi tiết hồ sơ bệnh nhân (chuyển hướng đến hàm xử lý chính)
   * @param {Object} appointment - Thông tin cuộc hẹn
   */
  const handleOpenPatientRecordModal = (appointment) => {
    handleViewAppointmentDetails(appointment);
  };

  /**
   * Xử lý sau khi hoàn thành thao tác với hồ sơ bệnh nhân
   * - Cập nhật lại dữ liệu dashboard
   */
  const handlePatientRecordSuccess = () => {
    fetchDashboardData();
  };

  /**
   * Xử lý tham gia cuộc hẹn tư vấn trực tuyến
   * - Nếu cuộc hẹn có trạng thái CONFIRMED, tự động chuyển sang UNDER_REVIEW
   * - Điều hướng đến trang video call
   * 
   * @param {number} appointmentId - ID của cuộc hẹn trực tuyến
   */
  const handleJoinOnlineAppointment = async (appointmentId) => {
    try {
      // Lấy thông tin chi tiết cuộc hẹn
      const appointment = onlineAppointments.find(
        (apt) => apt.id === appointmentId
      );

      // Nếu cuộc hẹn có trạng thái CONFIRMED, tự động chuyển sang UNDER_REVIEW
      if (appointment && appointment.status === "CONFIRMED") {
        // Chuẩn bị ghi chú cho cuộc hẹn trực tuyến
        const notes =
          "Tiếp nhận hồ sơ bệnh nhân. Cuộc hẹn trực tuyến - không cần gửi mẫu xét nghiệm.";

        // Gọi API để chuyển trạng thái cuộc hẹn sang UNDER_REVIEW
        const response = await doctorAppointmentService.putUnderReview(
          appointmentId,
          notes,
          "N/A - Online",         // Không có huyết áp cho cuộc hẹn online
          false,                  // Không yêu cầu lấy mẫu máu cho cuộc hẹn online
          appointment.symptoms     // Giữ nguyên triệu chứng đã nhập
        );

        if (response.success) {
          console.log(
            "Online appointment automatically put under review before joining"
          );
        } else {
          console.error(
            "Failed to put online appointment under review:",
            response.message
          );
        }
      }
    } catch (error) {
      console.error("Error putting online appointment under review:", error);
    }

    // Điều hướng đến trang tư vấn trực tuyến với ID cuộc hẹn
    navigate(`/doctor/appointments/online/${appointmentId}`);
  };

  /**
   * Xử lý xem chi tiết hồ sơ bệnh nhân và các tương tác liên quan
   * - Kiểm tra trạng thái cuộc hẹn trước khi mở modal
   * - Kiểm tra kết quả xét nghiệm cho các cuộc hẹn UNDER_REVIEW
   * - Hiển thị cảnh báo nếu chưa có kết quả xét nghiệm được duyệt
   * 
   * @param {Object} appointment - Thông tin cuộc hẹn cần xem
   */
  const handleViewAppointmentDetails = async (appointment) => {
    // Đối với cuộc hẹn trực tiếp (không phải online) và đang trong trạng thái UNDER_REVIEW
    if (appointment.status === "UNDER_REVIEW" && !appointment.isOnline) {
      try {
        // Kiểm tra xem cuộc hẹn này đã có kết quả xét nghiệm và đã được duyệt chưa
        const response =
          await doctorLabResultService.checkLabResultsForAppointment(
            appointment.id
          );

        // Nếu chưa có kết quả xét nghiệm được duyệt, hiển thị thông báo cảnh báo
        if (!response.success || !response.data) {
          toast.warning(
            "Cuộc hẹn này đang chờ kết quả xét nghiệm. Bạn chỉ có thể tạo kế hoạch điều trị sau khi có kết quả xét nghiệm được duyệt.",
            {
              position: "top-center",
              autoClose: 5000,
            }
          );
          return;
        }

        // Nếu đã có kết quả xét nghiệm được duyệt, cho phép mở modal chi tiết
        setSelectedAppointment(appointment);
        setShowPatientRecordModal(true);
      } catch (error) {
        console.error("Error checking lab results:", error);
        toast.error(
          "Không thể kiểm tra kết quả xét nghiệm. Vui lòng thử lại sau."
        );
      }
    } else {
      // Các trường hợp khác: 
      // - Cuộc hẹn đã hoàn thành (COMPLETED) 
      // - Cuộc hẹn trực tuyến (isOnline=true)
      // - Cuộc hẹn vừa check-in (CHECKED_IN)
      setSelectedAppointment(appointment);
      setShowPatientRecordModal(true);
    }
  };

  /**
   * Render giao diện của trang Dashboard
   * - Hiển thị thông báo khi có bệnh nhân mới check-in
   * - Phân chia thành các phần: bệnh nhân đang chờ, cuộc hẹn online, kết quả xét nghiệm
   */
  return (
    <Layout currentRole={UserRole.DOCTOR}>
      <div className="container mx-auto px-4 py-8">
        {/* Thông báo khi phát hiện bệnh nhân mới check-in */}
        {showNotification && newCheckedInPatient && (
          <div className="fixed top-4 right-4 z-50 glass-effect text-primary-800 p-4 rounded-lg shadow-lg flex items-center space-x-3 new-patient-notification">
            <BellAlertIcon className="h-6 w-6 text-primary-600 animate-pulse" />
            <div>
              <p className="font-medium">Bệnh nhân mới check-in!</p>
              <p className="text-sm">
                {newCheckedInPatient.userName} đã đến và đang chờ khám
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-gray-600 hover:text-gray-800 ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Bố cục trang Dashboard */}
        <div className="grid grid-cols-1 gap-6">
          {/* Nội dung chính (full width) */}
          <div className="space-y-6">
            {/* PHẦN 1: Danh sách bệnh nhân đã check-in và đang chờ khám */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg shadow-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-indigo-900">
                    <UserCircleIcon className="h-6 w-6 inline mr-2 text-indigo-600" />
                    Bệnh nhân đang đợi
                  </h2>
                  <p className="text-indigo-700">
                    Các bệnh nhân đã check-in và đang chờ khám
                  </p>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-all duration-200"
                >
                  Xem tất cả
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {isLoading ? (
                <div className="bg-white rounded-lg border border-indigo-100 p-6 text-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : checkedInPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {checkedInPatients.map((patient, index) => (
                    <div
                      key={patient.id}
                      className={`bg-white rounded-lg border border-indigo-100 p-4 shadow-sm hover:shadow-md transition-all duration-300 patient-card animate-slideUp`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">
                                {patient.userName || "N/A"}
                              </h3>
                              <div className="text-gray-600 text-sm flex space-x-3">
                                <span>{patient.userAge || "??"} tuổi</span>
                                <span>•</span>
                                <span>{patient.userGender || "Không rõ"}</span>
                              </div>
                              <p className="text-gray-500 text-sm mt-1">
                                {patient.serviceName || "Dịch vụ khám"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center text-indigo-600 text-sm">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(patient.scheduledAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}{" "}
                            {new Date(patient.scheduledAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                              Đã check-in
                            </span>
                          </div>
                        </div>
                        <div className="bg-blue-100 text-blue-700 rounded-md px-3 py-1.5 text-sm font-medium flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Đang chờ khám
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() =>
                              handleViewAppointmentDetails(patient)
                            }
                          >
                            Tiếp nhận hồ sơ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-indigo-100 p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCircleIcon className="h-8 w-8 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Không có bệnh nhân đang chờ
                  </h3>
                  <p className="text-gray-500">
                    Hiện tại không có bệnh nhân nào đã check-in và đang chờ khám
                  </p>
                </div>
              )}
            </div>

            {/* PHẦN 2: Danh sách cuộc hẹn tư vấn trực tuyến */}
            {onlineAppointments.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-md p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-green-900">
                      <VideoCameraIcon className="h-6 w-6 inline mr-2 text-green-600" />
                      Cuộc hẹn trực tuyến
                    </h2>
                    <p className="text-green-700">
                      Các cuộc hẹn trực tuyến đã xác nhận hoặc đang tiếp nhận
                    </p>
                  </div>
                  <Link
                    to="/doctor/appointments"
                    className="flex items-center text-green-600 hover:text-green-800 transition-all duration-200"
                  >
                    Xem tất cả
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlineAppointments.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className={`bg-white rounded-lg border border-green-100 p-4 shadow-sm hover:shadow-md transition-all duration-300 patient-card animate-slideUp`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <VideoCameraIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">
                                {appointment.isAnonymous
                                  ? "Bệnh nhân ẩn danh"
                                  : appointment.userName || "N/A"}
                              </h3>
                              <div className="text-gray-600 text-sm flex space-x-3">
                                <span>
                                  {appointment.isAnonymous
                                    ? "?"
                                    : appointment.userAge || "??"}{" "}
                                  tuổi
                                </span>
                                <span>•</span>
                                <span>
                                  {appointment.isAnonymous
                                    ? "Không xác định"
                                    : appointment.userGender || "Không rõ"}
                                </span>
                              </div>
                              <p className="text-gray-500 text-sm mt-1">
                                {appointment.serviceName || "Tư vấn trực tuyến"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center text-green-600 text-sm">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(
                              appointment.scheduledAt
                            ).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}{" "}
                            {new Date(
                              appointment.scheduledAt
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            <span className="mx-2 text-gray-400">•</span>
                            <span
                              className={`${
                                appointment.status === "UNDER_REVIEW"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              } px-2 py-0.5 rounded-full text-xs`}
                            >
                              {appointment.status === "UNDER_REVIEW"
                                ? "Đang tiếp nhận"
                                : "Trực tuyến"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="xs"
                            className="bg-green-600 hover:bg-green-700 transform transition-all duration-300 hover:scale-105"
                            onClick={() =>
                              handleJoinOnlineAppointment(appointment.id)
                            }
                          >
                            <VideoCameraIcon className="h-4 w-4 mr-1" />
                            {appointment.status === "UNDER_REVIEW"
                              ? "Tiếp tục tư vấn"
                              : "Tham gia trực tuyến"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHẦN 3: Kết quả xét nghiệm chờ duyệt */}
            <PendingLabResults />

            {/* PHẦN 4: Bệnh nhân đã có kết quả xét nghiệm và chờ lập kế hoạch điều trị */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg shadow-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-purple-900">
                    <ClipboardDocumentListIcon className="h-6 w-6 inline mr-2 text-purple-600" />
                    Bệnh nhân chờ lập kế hoạch điều trị
                  </h2>
                  <p className="text-purple-700">
                    Bệnh nhân đã có kết quả xét nghiệm được duyệt và sẵn sàng
                    lập kế hoạch điều trị
                  </p>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="flex items-center text-purple-600 hover:text-purple-800 transition-all duration-200"
                >
                  Xem tất cả
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {isLoading ? (
                <div className="bg-white rounded-lg border border-purple-100 p-6 text-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : approvedLabResultAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedLabResultAppointments.map((patient, index) => (
                    <div
                      key={patient.id}
                      className={`bg-white rounded-lg border border-purple-100 p-4 shadow-sm hover:shadow-md transition-all duration-300 patient-card animate-slideUp`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <UserCircleIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">
                                {patient.userName || "N/A"}
                              </h3>
                              <div className="text-gray-600 text-sm flex space-x-3">
                                <span>{patient.userAge || "??"} tuổi</span>
                                <span>•</span>
                                <span>{patient.userGender || "Không rõ"}</span>
                              </div>
                              <p className="text-gray-500 text-sm mt-1">
                                {patient.serviceName || "Dịch vụ khám"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-purple-600 text-sm">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(patient.scheduledAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}{" "}
                            {new Date(patient.scheduledAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                              Đã có kết quả xét nghiệm được duyệt
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="xs"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() =>
                              handleViewAppointmentDetails(patient)
                            }
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Lập kế hoạch điều trị
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-purple-100 p-6 text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Không có bệnh nhân chờ lập kế hoạch điều trị
                  </h3>
                  <p className="text-gray-500">
                    Hiện tại không có bệnh nhân nào đã có kết quả xét nghiệm
                    được duyệt để lập kế hoạch điều trị
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal xử lý hồ sơ bệnh nhân: tiếp nhận bệnh nhân và lập kế hoạch điều trị */}
      <PatientRecordModal
        isOpen={showPatientRecordModal}
        onClose={() => setShowPatientRecordModal(false)}
        appointment={selectedAppointment}
        onSuccess={handlePatientRecordSuccess}
      />
    </Layout>
  );
};

export default DoctorDashboardPage;
