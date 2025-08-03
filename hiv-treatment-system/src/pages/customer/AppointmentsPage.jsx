import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import AppointmentBooking from "../../components/customer/AppointmentBooking";
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  HeartIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ArrowPathIcon, // Add this import for the refresh icon
} from "@heroicons/react/24/outline";

const AppointmentsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(5);

  /**
   * Kiểm tra xác thực và tải danh sách lịch hẹn
   * - Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
   * - Hiển thị form đặt lịch nếu URL là /customer/appointments/new
   * - Tải danh sách lịch hẹn từ API
   */
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Bạn cần đăng nhập để xem lịch hẹn",
        },
      });
      return;
    }

    // Kiểm tra xem có hiển thị form đặt lịch dựa trên URL không
    if (location.pathname === "/customer/appointments/new") {
      setShowBookingForm(true);
    }

    // Tải danh sách lịch hẹn
    loadAppointments();

    // Check for payment status from URL parameters (after redirect from payment)
    const urlParams = new URLSearchParams(window.location.search);
    const resultCode = urlParams.get("resultCode");
    const orderId = urlParams.get("orderId");
    
    if (resultCode === "0" && orderId) {
      // If we have a successful payment result in the URL, reload appointments after a short delay
      setTimeout(() => {
        loadAppointments();
      }, 1000);
    }
  }, [location.pathname, navigate, location.search]);

  /**
   * Set up automatic refresh interval for appointments
   */
  useEffect(() => {
    // Refresh appointments every 30 seconds
    const refreshInterval = setInterval(() => {
      if (!showBookingForm) { // Don't refresh while booking form is open
        loadAppointments();
      }
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [showBookingForm]);

  /**
   * Tải danh sách lịch hẹn từ API
   * Chuyển đổi dữ liệu từ API thành định dạng phù hợp cho giao diện
   */
  const loadAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.getUserAppointments();

      if (response.success) {
        // Debug: Log the raw data from API to see what fields are available
        console.log("Raw appointment data from API:", response.data);
        
        // Chuyển đổi dữ liệu API để phù hợp với yêu cầu của component
        const transformedAppointments = response.data.map((appointment) => {
          // Debug: Log each appointment's payment status
          console.log(`Appointment #${appointment.id} - paid status:`, appointment.paid);
          
          return {
            id: appointment.id,
            service: {
              id: appointment.serviceId,
              name: appointment.serviceName,
              icon: getServiceIcon(appointment.serviceName),
            },
            doctorName: appointment.doctorName,
            // doctorSpecialty: appointment.doctorSpecialty || "Bác sĩ",
            date: new Date(appointment.scheduledAt),
            timeSlot: {
              startTime: new Date(appointment.scheduledAt).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }
              ),
              endTime: new Date(
                new Date(appointment.scheduledAt).getTime() +
                  (appointment.serviceDuration || 30) * 60000
              ).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
            },
            status: appointment.status.toLowerCase(),
            patientInfo: {
              fullName: authService.getCurrentUser()?.name || "Bệnh nhân",
              phone: authService.getCurrentUser()?.phone || "",
            },
            notes: appointment.notes || "",
            bookingId: `APT-${appointment.id}`,
            symptoms: appointment.symptoms || "",
            medicalHistory: appointment.medicalHistory || "",
            isOnline: appointment.isOnline, // Thêm thông tin cuộc hẹn trực tuyến
            price: appointment.servicePrice || 0, // Thêm giá dịch vụ
            paymentMethod: appointment.paymentMethod || "CASH", // Thêm phương thức thanh toán
            isPaid: appointment.paid || false, // Trạng thái thanh toán - Fix: use 'paid' instead of 'isPaid'
            paidAt: appointment.paidAt ? new Date(appointment.paidAt) : null, // Thời gian thanh toán
            checkedIn: appointment.checkedIn || false, // Thêm trạng thái check-in
            needsConfirmation: appointment.needsConfirmation || false, // Thêm trạng thái cần xác nhận
          };
        });
        
        // Debug: Log the transformed appointments
        console.log("Transformed appointments:", transformedAppointments);
        
        setAppointments(transformedAppointments);
      } else {
        setError(response.message || "Không thể tải danh sách lịch hẹn");
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xác định biểu tượng dựa trên tên dịch vụ
   * @param {string} serviceName - Tên dịch vụ khám
   * @returns {Component} Icon component tương ứng với dịch vụ
   */
  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes("tư vấn")) return ChatBubbleLeftRightIcon;
    if (name.includes("khám")) return HeartIcon;
    if (name.includes("xét nghiệm")) return BeakerIcon;
    if (name.includes("thuốc")) return DocumentTextIcon;
    return HeartIcon;
  };

  /**
   * Xử lý sau khi hoàn thành đặt lịch
   * @param {Object} bookingData - Dữ liệu đặt lịch
   */
  const handleBookingComplete = (bookingData) => {
    // Tải lại danh sách lịch hẹn để cập nhật dữ liệu mới nhất
    loadAppointments();
    setShowBookingForm(false);
    setActiveTab("upcoming");
  };

  /**
   * Xử lý hủy lịch hẹn
   * @param {string} appointmentId - ID của lịch hẹn cần hủy
   * @param {string} reason - Lý do hủy lịch hẹn
   */
  const handleCancelAppointment = async (appointmentId, reason) => {
    // Tìm lịch hẹn
    const appointment = appointments.find((apt) => apt.id === appointmentId);

    // Kiểm tra xem lịch hẹn có thể hủy không
    if (appointment) {
      // Kiểm tra xem lịch hẹn đã check-in chưa
      if (appointment.status === "checked_in") {
        setError("Không thể hủy lịch hẹn sau khi đã check-in.");
        return;
      }

      // Kiểm tra xem lịch hẹn có còn cách đây hơn 24 giờ không
      const appointmentDate = new Date(appointment.date);
      const now = new Date();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (appointmentDate - now <= oneDayInMs) {
        const formattedTime = appointmentDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedDate = appointmentDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        setError(
          `Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ hẹn (${formattedDate} ${formattedTime}).`
        );
        return;
      }
    }

    // Nếu có lý do được cung cấp, tiến hành hủy
    if (reason) {
      try {
        setIsSubmitting(true);
        const response = await appointmentService.cancelAppointment(
          appointmentId,
          reason
        );

        if (response.success) {
          // Cập nhật trạng thái lịch hẹn trực tiếp thay vì tải lại
          setAppointments((prevAppointments) =>
            prevAppointments.map((apt) =>
              apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
            )
          );

          // Ẩn popup nhập lý do hủy lịch
          setShowCancelPopup(false);

          // Hiển thị thông báo thành công
          setShowCancelSuccess(true);
          setCancelCountdown(5);

          // Bắt đầu đếm ngược và tự động đóng thông báo sau 5 giây
          const timer = setInterval(() => {
            setCancelCountdown((prevCount) => {
              if (prevCount <= 1) {
                clearInterval(timer);
                setShowCancelSuccess(false);
                return 0;
              }
              return prevCount - 1;
            });
          }, 1000);

          // Reset các state liên quan
          setAppointmentToCancel(null);
          setCancelReason("");
        } else {
          setError(response.message || "Không thể hủy lịch hẹn");
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        setError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Hiển thị popup hủy lịch hẹn để nhập lý do
      setAppointmentToCancel(appointment);
      setShowCancelPopup(true);
    }
  };

  /**
   * Xác nhận hủy lịch hẹn sau khi nhập lý do
   */
  const handleConfirmCancellation = () => {
    if (appointmentToCancel) {
      handleCancelAppointment(
        appointmentToCancel.id,
        cancelReason || "Hủy bởi bệnh nhân"
      );
    }
  };

  /**
   * Kiểm tra xem lịch hẹn có thể hủy không
   * @param {Object} appointment - Thông tin lịch hẹn
   * @returns {boolean} true nếu có thể hủy, false nếu không
   */
  const canCancelAppointment = (appointment) => {
    // Không thể hủy nếu bệnh nhân đã check-in
    if (appointment.status === "checked_in") {
      return false;
    }

    // Không thể hủy nếu còn ít hơn 24 giờ
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return appointmentDate - now > oneDayInMs;
  };

  /**
   * Kiểm tra xem lịch hẹn có thể check-in không
   * @param {Object} appointment - Thông tin lịch hẹn
   * @returns {boolean} true nếu có thể check-in, false nếu không
   */
  const canCheckInAppointment = (appointment) => {
    // Chỉ có thể check-in nếu trạng thái là confirmed hoặc scheduled
    if (
      appointment.status !== "confirmed" &&
      appointment.status !== "scheduled"
    ) {
      return false;
    }

    // Kiểm tra xem có trong vòng 2 giờ trước giờ hẹn không
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    // Chỉ có thể check-in trong vòng 2 giờ trước giờ hẹn
    return appointmentDate - now <= twoHoursInMs && appointmentDate > now;
  };

  /**
   * Xử lý check-in cho lịch hẹn
   * @param {string} appointmentId - ID của lịch hẹn cần check-in
   */
  const handleCheckInAppointment = async (appointmentId) => {
    // Tìm lịch hẹn
    const appointment = appointments.find((apt) => apt.id === appointmentId);

    // Kiểm tra xem có thể check-in không (chỉ trong vòng 2 giờ trước giờ hẹn)
    if (appointment) {
      const appointmentTime = new Date(appointment.date);
      const now = new Date();
      const twoHoursInMs = 2 * 60 * 60 * 1000;

      // Nếu thời gian hiện tại cách giờ hẹn quá 2 giờ
      if (appointmentTime - now > twoHoursInMs) {
        const formattedTime = appointmentTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedDate = appointmentTime.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        setError(
          `Bạn chỉ có thể check-in trong vòng 2 giờ trước giờ hẹn (${formattedDate} ${formattedTime}). Vui lòng quay lại sau.`
        );
        return;
      }
    }

    try {
      const response = await appointmentService.checkInAppointment(
        appointmentId
      );

      if (response.success) {
        // Cập nhật trạng thái lịch hẹn trực tiếp trong state
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: "checked_in" } : apt
          )
        );
        setError(null);
      } else {
        setError(response.message || "Không thể check-in cho lịch hẹn");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      setError(error.message || "Đã xảy ra lỗi khi check-in");
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20";
      case "scheduled":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
      case "confirmed":
        return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20";
      case "checked_in":
        return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";
      case "completed":
        return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";
      case "no_show":
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/10";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "scheduled":
        return "Đã lên lịch";
      case "confirmed":
        return "Đã xác nhận";
      case "checked_in":
        return "Đã check-in";
      case "under_review":
        return "Đang tiếp nhận hồ sơ";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "no_show":
        return "Không đến khám";
      default:
        return "Không xác định";
    }
  };

  const filterAppointments = (status) => {
    const now = new Date();
    return appointments.filter((appointment) => {
      switch (status) {
        case "upcoming":
          return (
            (appointment.status === "pending" ||
              appointment.status === "confirmed" ||
              appointment.status === "scheduled" ||
              appointment.status === "under_review" ||
              appointment.status === "checked_in") &&
            appointment.date >= now
          );
        case "past":
          return appointment.status === "completed" || appointment.date < now;
        case "cancelled":
          return (
            appointment.status === "cancelled" ||
            appointment.status === "no_show"
          );
        case "online":
          return (
            appointment.isOnline &&
            (appointment.status === "pending" ||
              appointment.status === "confirmed" ||
              appointment.status === "scheduled" ||
              appointment.status === "under_review" ||
              appointment.status === "checked_in") &&
            appointment.date >= now
          );
        default:
          return true;
      }
    });
  };

  const filteredAppointments = filterAppointments(activeTab);

  // Show booking form
  if (showBookingForm) {
    return (
      <Layout currentRole={UserRole.CUSTOMER} pageTitle="Đặt lịch hẹn mới">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBookingForm(false);
                navigate("/customer/appointments");
              }}
              className="hover:bg-gray-50 transition-all duration-300 flex items-center"
            >
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: -2 }}
                className="inline-flex items-center"
              >
                <span className="mr-1"></span> Danh sách lịch hẹn
              </motion.span>
            </Button>
          </div>
          <AppointmentBooking onBookingComplete={handleBookingComplete} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      currentRole={UserRole.CUSTOMER}
      pageTitle="Lịch hẹn"
      headerText="Quản lý lịch hẹn"
    >
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Booking form or Tabs */}
            {showBookingForm ? (
              <AppointmentBooking onBookingComplete={handleBookingComplete} />
            ) : (
              <>
                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setShowBookingForm(true)}
                      className="flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-1" />
                      Đặt lịch xét nghiệm
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center"
                      onClick={() =>
                        navigate("/customer/online-consultation/new")
                      }
                    >
                      <VideoCameraIcon className="h-5 w-5 mr-1" />
                      Tư vấn trực tuyến
                    </Button>
                  </div>
                  
                  {/* Add refresh button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoading(true);
                      loadAppointments();
                    }}
                    className="flex items-center"
                    disabled={loading}
                  >
                    <ArrowPathIcon className={`h-5 w-5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                  </Button>
                </div>

                {/* Status Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      {
                        key: "upcoming",
                        label: "Sắp tới",
                        count: filterAppointments("upcoming").length,
                      },
                      {
                        key: "online",
                        label: "Tư vấn trực tuyến",
                        count: filterAppointments("online").length,
                        icon: <VideoCameraIcon className="h-4 w-4 mr-1" />,
                      },
                      {
                        key: "past",
                        label: "Đã qua",
                        count: filterAppointments("past").length,
                      },
                      {
                        key: "cancelled",
                        label: "Đã hủy",
                        count: filterAppointments("cancelled").length,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="relative py-2 px-1 font-medium text-sm focus:outline-none"
                      >
                        <div className="flex items-center">
                          {tab.icon && tab.icon}
                          <span
                            className={`${
                              activeTab === tab.key
                                ? "text-primary-600"
                                : "text-gray-500 hover:text-gray-700"
                            } transition-colors duration-200`}
                          >
                            {tab.label}
                          </span>
                          <span
                            className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                              activeTab === tab.key
                                ? "bg-primary-100 text-primary-600 font-semibold"
                                : "bg-gray-100 text-gray-900"
                            } transition-colors duration-200`}
                          >
                            {tab.count}
                          </span>
                        </div>
                        {/* Pill shape background for active tab */}
                        {activeTab === tab.key && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Appointments List */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {filteredAppointments.length === 0 ? (
                      <Card>
                        <div className="p-8 text-center">
                          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activeTab === "upcoming" &&
                              "Không có cuộc hẹn sắp tới"}
                            {activeTab === "online" &&
                              "Không có cuộc tư vấn trực tuyến"}
                            {activeTab === "past" && "Không có cuộc hẹn đã qua"}
                            {activeTab === "cancelled" &&
                              "Không có cuộc hẹn đã hủy"}
                            {activeTab === "all" && "Không có cuộc hẹn nào"}
                          </h3>
                          <p className="text-gray-500 mb-6">
                            {activeTab === "upcoming" ||
                            activeTab === "all" ||
                            activeTab === "online"
                              ? "Đặt lịch hẹn ngay để được tư vấn và khám bệnh."
                              : "Lịch sử cuộc hẹn của bạn sẽ hiển thị ở đây."}
                          </p>
                          {(activeTab === "upcoming" ||
                            activeTab === "all") && (
                            <Button
                              variant="primary"
                              onClick={() => setShowBookingForm(true)}
                            >
                              <PlusIcon className="h-5 w-5 mr-2" />
                              Đặt lịch hẹn
                            </Button>
                          )}
                          {activeTab === "online" && (
                            <Button
                              variant="primary"
                              onClick={() =>
                                navigate("/customer/online-consultation/new")
                              }
                            >
                              <VideoCameraIcon className="h-5 w-5 mr-2" />
                              Đặt lịch tư vấn trực tuyến
                            </Button>
                          )}
                        </div>
                      </Card>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <Card
                          key={appointment.id}
                          className="mb-4 overflow-hidden"
                        >
                          <div
                            className={`p-6 ${
                              appointment.isOnline && activeTab === "online"
                                ? "bg-gradient-to-r from-green-50 to-emerald-50"
                                : ""
                            }`}
                          >
                            {/* Appointment Header with Status */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-md ${
                                    appointment.isOnline
                                      ? "bg-green-100"
                                      : "bg-blue-100"
                                  }`}
                                >
                                  {appointment.isOnline ? (
                                    <VideoCameraIcon className="h-6 w-6 text-green-600" />
                                  ) : appointment.service.icon ? (
                                    <appointment.service.icon className="h-6 w-6 text-blue-600" />
                                  ) : (
                                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                                  )}
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {appointment.isOnline
                                      ? "Tư vấn trực tuyến"
                                      : appointment.service.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Mã cuộc hẹn: {appointment.bookingId}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {getStatusText(appointment.status)}
                              </span>
                            </div>

                            {/* Appointment Details */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-start">
                                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                      Bác sĩ
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      {appointment.doctorName}
                                    </p>
                                    {appointment.doctorSpecialty && (
                                      <p className="text-xs text-gray-500">
                                        {appointment.doctorSpecialty}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-start">
                                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                      Ngày hẹn
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      {formatDate(appointment.date)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start">
                                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                      Giờ hẹn
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      {appointment.timeSlot.startTime} -{" "}
                                      {appointment.timeSlot.endTime}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Thông tin giá dịch vụ */}
                                <div className="flex items-start">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400 mt-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                  </svg>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                      Giá dịch vụ
                                    </p>
                                    <p className="text-sm font-medium text-green-600">
                                      {appointment.price ? new Intl.NumberFormat('vi-VN').format(appointment.price) + " VNĐ" : "Liên hệ"}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Thông tin thanh toán */}
                                <div className="flex items-start">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400 mt-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                  </svg>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                      Thanh toán
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-gray-900">
                                        {appointment.paymentMethod === "CASH" ? "Tiền mặt" : "QR Code"}
                                      </p>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        appointment.isPaid 
                                          ? "bg-green-100 text-green-800" 
                                          : appointment.needsConfirmation
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-yellow-100 text-yellow-800"
                                      }`}>
                                        {appointment.isPaid 
                                          ? "Đã thanh toán" 
                                          : appointment.needsConfirmation
                                            ? "Chờ xác nhận từ nhân viên"
                                            : "Chưa thanh toán"}
                                      </span>
                                    </div>
                                    {appointment.paidAt && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Thanh toán lúc: {new Date(appointment.paidAt).toLocaleString('vi-VN')}
                                      </p>
                                    )}
                                    {!appointment.isPaid && !appointment.checkedIn && (
                                      <p className="text-xs text-blue-600 mt-1 italic">
                                        * Vui lòng check-in khi đến bệnh viện để thanh toán
                                      </p>
                                    )}
                                    {!appointment.isPaid && appointment.checkedIn && (
                                      <p className="text-xs text-blue-600 mt-1 italic">
                                        * Thanh toán sẽ được xác nhận bởi nhân viên
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {appointment.symptoms && (
                                  <div className="flex items-start">
                                    <HeartIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-700">
                                        Triệu chứng
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {appointment.symptoms}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {appointment.medicalHistory && (
                                  <div className="flex items-start">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-700">
                                        Tiền sử bệnh
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {appointment.medicalHistory}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {appointment.notes && (
                                  <div className="flex items-start">
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-700">
                                        Ghi chú
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {appointment.notes}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Appointment Actions */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                              {/* Online consultation button */}
                              {appointment.isOnline &&
                                (appointment.status === "confirmed" ||
                                  appointment.status === "checked_in" ||
                                  appointment.status === "under_review") &&
                                appointment.date >= new Date() && (
                                  <Button
                                    variant="primary"
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    onClick={() =>
                                      navigate(
                                        `/customer/appointments/online/${appointment.id}`
                                      )
                                    }
                                  >
                                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                                    Tham gia tư vấn
                                  </Button>
                                )}

                              {/* Check-in button */}
                              {!appointment.isOnline &&
                                canCheckInAppointment(appointment) && (
                                  <Button
                                    variant="primary"
                                    onClick={() =>
                                      handleCheckInAppointment(appointment.id)
                                    }
                                  >
                                    Check-in
                                  </Button>
                                )}

                              {/* Cancel button */}
                              {(appointment.status === "confirmed" ||
                                appointment.status === "scheduled" ||
                                appointment.status === "pending" ||
                                appointment.status === "under_review") &&
                                canCancelAppointment(appointment) && (
                                  <Button
                                    variant="danger"
                                    onClick={() =>
                                      handleCancelAppointment(appointment.id)
                                    }
                                  >
                                    Hủy lịch hẹn
                                  </Button>
                                )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </>
        )}

        {/* Cancellation Popup */}
        {showCancelPopup && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Huỷ lịch hẹn
                </h3>
                <button
                  onClick={() => setShowCancelPopup(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-gray-700">
                  Vui lòng cho chúng tôi biết lý do bạn muốn huỷ lịch hẹn này:
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do huỷ lịch hẹn..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                ></textarea>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelPopup(false)}
                >
                  Huỷ bỏ
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmCancellation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận huỷ lịch"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Success Modal */}
        {showCancelSuccess && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-lg w-full border-t-4 border-t-red-500"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-8 text-center">
                <div className="mb-6 relative mx-auto w-20 h-20">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-100"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-100"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeOut",
                      delay: 0.3,
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-100 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2,
                      }}
                    >
                      <CheckCircleIcon className="h-12 w-12 text-red-600" />
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold text-red-600 mb-4">
                    Huỷ lịch hẹn thành công!
                  </h3>
                  <p className="text-gray-600 mb-3 max-w-md mx-auto">
                    Lịch hẹn của bạn đã được{" "}
                    <span className="text-red-600 font-medium">
                      huỷ thành công
                    </span>
                    . Thông tin đã được cập nhật trong hệ thống.
                  </p>
                  <p className="text-gray-500 text-sm mb-3 max-w-md mx-auto">
                    Bạn có thể đặt lịch hẹn mới bất cứ lúc nào.
                  </p>
                  <p className="text-primary-600 font-medium mb-8">
                    Tự động đóng sau {cancelCountdown} giây...
                  </p>
                  <div className="flex justify-center">
                    <Button
                      variant="primary"
                      onClick={() => setShowCancelSuccess(false)}
                    >
                      Đóng
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
