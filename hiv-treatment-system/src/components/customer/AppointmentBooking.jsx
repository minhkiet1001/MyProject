import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  HeartIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Calendar from "../common/Calendar";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";

/**
 * Component AppointmentBooking - Đặt lịch hẹn khám bệnh

 * @param {Function} onBookingComplete - Callback function khi đặt lịch thành công
 */
const AppointmentBooking = ({ onBookingComplete = null }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Bước hiện tại trong quy trình đặt lịch
  const [selectedService, setSelectedService] = useState(null); // Dịch vụ khám đã chọn
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Bác sĩ đã chọn
  const [selectedDate, setSelectedDate] = useState(null); // Ngày đã chọn
  const [selectedSlot, setSelectedSlot] = useState(null); // Khung giờ đã chọn
  const [availableDoctors, setAvailableDoctors] = useState([]); // Danh sách bác sĩ có thể chọn
  const [availableSlots, setAvailableSlots] = useState([]); // Danh sách khung giờ có thể chọn
  const [services, setServices] = useState([]); // Danh sách dịch vụ từ API
  const [doctors, setDoctors] = useState([]); // Danh sách bác sĩ từ API
  const [patientInfo, setPatientInfo] = useState({
    symptoms: "", // Triệu chứng bệnh
    medicalHistory: "", // Tiền sử bệnh
    notes: "", // Ghi chú thêm
    isUrgent: false, // Đánh dấu khẩn cấp
    paymentMethod: "CASH", // Default payment method
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Đang gửi yêu cầu đặt lịch
  const [loading, setLoading] = useState(false); // Đang tải dữ liệu
  const [error, setError] = useState(null); // Thông báo lỗi
  const [success, setSuccess] = useState(false); // Đặt lịch thành công
  const [countdown, setCountdown] = useState(5); // Đếm ngược để chuyển trang
  const [bookingResponseData, setBookingResponseData] = useState(null); // Response data from booking

  /**
   * Effect hook to initialize data when component mounts
   */
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
      navigate("/login", {
        state: {
          from: "/customer/appointments/new",
          message: "Bạn cần đăng nhập để đặt lịch hẹn",
        },
      });
      return;
    }

    // Tải dữ liệu ban đầu
    loadInitialData();
  }, [navigate]);

  /**
   * Tải danh sách dịch vụ và bác sĩ từ API
   */
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Tải danh sách dịch vụ và bác sĩ
      const [servicesResponse, doctorsResponse] = await Promise.all([
        appointmentService.getServices(),
        appointmentService.getDoctors(),
      ]);

      if (servicesResponse.success) {
        // Filter out service any services containing "online" or "trực tuyến"
        const filteredServices = servicesResponse.data.filter((service) => {
          const name = service.name.toLowerCase();
          const desc = service.description
            ? service.description.toLowerCase()
            : "";
          return (
            service.id !== 6 &&
            !name.includes("online") &&
            !name.includes("trực tuyến") &&
            !desc.includes("online") &&
            !desc.includes("trực tuyến")
          );
        });
        setServices(filteredServices);
      }

      if (doctorsResponse.success) {
        setDoctors(doctorsResponse.data);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật danh sách bác sĩ có sẵn khi chọn dịch vụ
   */
  useEffect(() => {
    if (selectedService && doctors.length > 0) {
      // Tất cả bác sĩ đều có thể cung cấp mọi dịch vụ
      setAvailableDoctors(doctors);

      // Reset lựa chọn khi dịch vụ thay đổi
      if (selectedDoctor) {
        setSelectedDate(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
      }
    }
  }, [selectedService, doctors]);

  /**
   * Tải danh sách khung giờ có sẵn khi đã chọn bác sĩ và ngày
   */
  useEffect(() => {
    if (selectedDoctor && selectedDate && selectedService) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate, selectedService]);

  /**
   * Tải danh sách khung giờ có sẵn từ API
   */
  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate || !selectedService) return;

    setLoading(true);
    setError(null);

    try {
      const response = await appointmentService.getAvailableSlots(
        selectedDoctor.id,
        appointmentService.formatDateForAPI(selectedDate),
        selectedService.id
      );

      if (response.success) {
        // Check if any time slots are in the past and mark them accordingly
        const now = new Date();
        const isToday =
          new Date(selectedDate).setHours(0, 0, 0, 0) ===
          new Date().setHours(0, 0, 0, 0);

        const slotsWithPastTimeMarked = response.data.map((slot) => {
          if (isToday) {
            // Parse the slot start time
            const [hours, minutes] = slot.startTime.split(":").map(Number);
            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);

            // If the slot time is in the past, mark it as unavailable with a special reason
            if (slotTime < now) {
              return {
                ...slot,
                isAvailable: false,
                isPastTime: true,
              };
            }
          }
          return slot;
        });

        setAvailableSlots(slotsWithPastTimeMarked);
      } else {
        setError(response.message || "Không thể tải thông tin slot thời gian");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error loading available slots:", error);
      setError(error.message);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý khi chọn dịch vụ - Chuyển đến bước 2
   * @param {Object} service - Thông tin dịch vụ được chọn
   */
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setStep(2);
  };

  /**
   * Xử lý khi chọn bác sĩ
   * @param {Object} doctor - Thông tin bác sĩ được chọn
   */
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  /**
   * Xử lý khi chọn ngày
   * @param {Date} date - Ngày được chọn
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  /**
   * Xử lý khi chọn khung giờ - Chuyển đến bước 3
   * @param {Object} slot - Thông tin khung giờ được chọn
   */
  const handleSlotSelect = (slot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setStep(3);
    }
  };

  /**
   * Xử lý thay đổi thông tin bệnh lý của bệnh nhân
   * @param {Event} e - Sự kiện thay đổi input
   */
  const handlePatientInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(
      `Patient info change: ${name} = ${value}, type: ${type}, checked: ${checked}`
    );
    setPatientInfo({
      ...patientInfo,
      [name]: type === "checkbox" ? checked : value,
    });

    // Log the updated state after change
    setTimeout(() => {
      console.log("Updated patientInfo:", patientInfo);
    }, 0);
  };

  /**
   * Xử lý gửi form đặt lịch
   * @param {Event} e - Sự kiện submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService || !selectedDoctor || !selectedDate || !selectedSlot) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Debug logging
      console.log("Selected date:", selectedDate);
      console.log("Selected slot startTime:", selectedSlot.startTime);

      // Định dạng thời gian cho API
      const scheduledAt = appointmentService.formatDateTimeForAPI(
        selectedDate,
        selectedSlot.startTime
      );
      console.log("Formatted scheduledAt:", scheduledAt);

      // Chuẩn bị dữ liệu đặt lịch
      const appointmentData = {
        doctorId: selectedDoctor.id,
        serviceId: selectedService.id,
        scheduledAt: scheduledAt,
        scheduleId: selectedSlot.scheduleId,
        symptoms: patientInfo.symptoms,
        medicalHistory: patientInfo.medicalHistory,
        notes: patientInfo.notes,
        autoConfirm: true, // Tự động xác nhận lịch hẹn
        paymentMethod: patientInfo.paymentMethod, // Add payment method
      };

      console.log("Appointment data being sent:", appointmentData);
      console.log("Payment method:", patientInfo.paymentMethod);
      // Gọi API đặt lịch
      const response = await appointmentService.bookAppointment(
        appointmentData
      );

      if (response.success) {
        setSuccess(true);
        setStep(4); // Bước thành công
        setCountdown(5); // Đặt thời gian đếm ngược là 5 giây
        // Store response data for later use with onBookingComplete
        setBookingResponseData(response.data);
      } else {
        setError(response.message || "Không thể đặt lịch hẹn");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect for handling countdown after successful booking
  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      // Chuyển hướng đến trang lịch hẹn
      if (onBookingComplete && bookingResponseData) {
        onBookingComplete(bookingResponseData);
      } else {
        navigate("/customer/appointments");
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [success, countdown, navigate, onBookingComplete, bookingResponseData]);

  /**
   * Reset toàn bộ quy trình đặt lịch để bắt đầu lại
   */
  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setPatientInfo({
      symptoms: "",
      medicalHistory: "",
      notes: "",
      isUrgent: false,
      paymentMethod: "CASH",
    });
    setError(null);
    setSuccess(false);
    setBookingResponseData(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    // Start from 0 to include today's date
    for (let i = 0; i <= 14; i++) {
      // Today and next 2 weeks
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Loading state
  if (loading && step === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="relative flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= stepNumber
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > stepNumber ? (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 3 && (
              <div className="relative w-16 mx-2">
                <div
                  className={`absolute top-1/2 -translate-y-1/2 h-1 w-full ${
                    step > stepNumber ? "bg-primary-600" : "bg-gray-200"
                  }`}
                />
                {step > stepNumber && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 h-1 bg-primary-600"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center space-x-8 mb-6">
        <div className="text-center">
          <p
            className={`text-sm font-medium transition-colors duration-300 ${
              step >= 1 ? "text-primary-600" : "text-gray-500"
            }`}
          >
            Chọn dịch vụ
          </p>
        </div>
        <div className="text-center">
          <p
            className={`text-sm font-medium transition-colors duration-300 ${
              step >= 2 ? "text-primary-600" : "text-gray-500"
            }`}
          >
            Chọn bác sĩ & thời gian
          </p>
        </div>
        <div className="text-center">
          <p
            className={`text-sm font-medium transition-colors duration-300 ${
              step >= 3 ? "text-primary-600" : "text-gray-500"
            }`}
          >
            Xác nhận thông tin
          </p>
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <Card title="Chọn dịch vụ khám">
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => {
                // Default icon mapping
                const getServiceIcon = (serviceName) => {
                  const name = serviceName.toLowerCase();
                  // Only include regular examination services, not online consultation
                  if (name.includes("khám")) return HeartIcon;
                  if (name.includes("xét nghiệm")) return BeakerIcon;
                  if (name.includes("thuốc")) return DocumentTextIcon;
                  return HeartIcon;
                };

                const IconComponent = getServiceIcon(service.name);

                return (
                  <motion.div
                    key={service.id}
                    className={`relative overflow-hidden border rounded-lg p-6 cursor-pointer transition-all duration-300
                      ${
                        selectedService?.id === service.id
                          ? "border-primary-500 bg-primary-50/60 shadow-md"
                          : "border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-md"
                      }
                    `}
                    onClick={() => handleServiceSelect(service)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary-50 opacity-50 z-0"></div>

                    {/* Selected indicator */}
                    {selectedService?.id === service.id && (
                      <motion.div
                        className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}

                    <div className="flex items-start space-x-4 relative z-10">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm"
                        whileHover={{ scale: 1.1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <IconComponent className="h-6 w-6 text-primary-600" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                            ⏱️ {service.durationMinutes} phút
                          </span>
                          <span className="text-primary-600 font-medium">
                            {service.basePrice
                              ? `${service.basePrice.toLocaleString(
                                  "vi-VN"
                                )} VNĐ`
                              : "Liên hệ"}
                          </span>
                        </div>
                      </div>
                      <div className="text-primary-600 transition-transform duration-300 group-hover:translate-x-1">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Select Doctor & Time */}
      {step === 2 && selectedService && (
        <div className="space-y-6">
          <Card title={`Chọn bác sĩ cho dịch vụ: ${selectedService.name}`}>
            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Doctors List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Chọn bác sĩ
                  </h3>
                  {availableDoctors.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Đang tải danh sách bác sĩ...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableDoctors.map((doctor) => (
                        <motion.div
                          key={doctor.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                            selectedDoctor?.id === doctor.id
                              ? "border-primary-500 bg-primary-50/70 shadow-md"
                              : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleDoctorSelect(doctor)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Selected indicator */}
                          {selectedDoctor?.id === doctor.id && (
                            <motion.div
                              className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-1 shadow-sm"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </motion.div>
                          )}

                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {doctor.avatarUrl ? (
                                <img
                                  src={doctor.avatarUrl}
                                  alt={doctor.name}
                                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border border-blue-200 shadow-sm">
                                  <UserIcon className="h-8 w-8 text-blue-600" />
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex-1">
                              <h4 className="text-base font-medium text-gray-900">
                                {doctor.name}
                              </h4>

                              <div className="mt-1 flex flex-wrap gap-1">
                                <div className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2 py-0.5 rounded-full">
                                  {doctor.specialty}
                                </div>
                                {doctor.degree && (
                                  <div className="bg-purple-100 text-purple-800 text-xs font-medium inline-flex items-center px-2 py-0.5 rounded-full">
                                    {doctor.degree}
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 grid grid-cols-1 gap-y-1 text-sm text-gray-600">
                                {doctor.experienceYears && (
                                  <div className="flex items-center">
                                    <svg
                                      className="h-4 w-4 mr-1 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      Kinh nghiệm: {doctor.experienceYears} năm
                                    </span>
                                  </div>
                                )}

                                {doctor.email && (
                                  <div className="flex items-center">
                                    <svg
                                      className="h-4 w-4 mr-1 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>{doctor.email}</span>
                                  </div>
                                )}

                                {doctor.phone && (
                                  <div className="flex items-center">
                                    <svg
                                      className="h-4 w-4 mr-1 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      />
                                    </svg>
                                    <span>{doctor.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-primary-600 self-center ml-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Doctor Bio (if available) */}
                          {doctor.bio && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {doctor.bio}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedDoctor
                      ? `Lịch làm việc - ${selectedDoctor.name}`
                      : "Chọn bác sĩ để xem lịch"}
                  </h3>

                  {selectedDoctor ? (
                    <div className="space-y-4">
                      {/* Date Selection */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Chọn ngày khám
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {getNextWeekDates()
                            .slice(0, 8)
                            .map((date) => {
                              const dateObj = new Date(date);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0); // Set to beginning of today

                              const isSelected = selectedDate === date;
                              const isPastDate = dateObj < today;
                              const hasAvailability = !isPastDate; // Disable dates in the past

                              return (
                                <motion.button
                                  key={date}
                                  className={`p-3 text-left rounded-lg border transition-all duration-200 ${
                                    isSelected
                                      ? "border-primary-500 bg-primary-500 text-white shadow-md"
                                      : isPastDate
                                      ? "border-gray-100 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                                      : hasAvailability
                                      ? "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                                      : "border-gray-100 bg-gray-50 text-gray-400 opacity-60"
                                  }`}
                                  onClick={() =>
                                    !isPastDate && handleDateSelect(date)
                                  }
                                  whileHover={
                                    hasAvailability && !isPastDate
                                      ? { y: -2, scale: 1.02 }
                                      : {}
                                  }
                                  whileTap={
                                    hasAvailability && !isPastDate
                                      ? { scale: 0.98 }
                                      : {}
                                  }
                                  disabled={!hasAvailability || isPastDate}
                                >
                                  <div className="text-sm font-medium">
                                    {dateObj.toLocaleDateString("vi-VN", {
                                      weekday: "short",
                                    })}
                                  </div>
                                  <div
                                    className={`text-center font-bold ${
                                      isSelected
                                        ? "text-white"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {dateObj.getDate()}
                                  </div>
                                  <div
                                    className={`text-xs text-center ${
                                      isSelected
                                        ? "text-white"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {dateObj.toLocaleDateString("vi-VN", {
                                      month: "short",
                                    })}
                                  </div>
                                  {hasAvailability && !isSelected && (
                                    <div className="flex justify-center mt-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                    </div>
                                  )}
                                </motion.button>
                              );
                            })}
                        </div>
                      </div>

                      {/* Time Slots */}
                      {selectedDate && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Chọn giờ khám - {formatDate(selectedDate)}
                          </h4>

                          {loading ? (
                            <div className="grid grid-cols-2 gap-3">
                              {[...Array(6)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-10 bg-gray-200 rounded-lg animate-pulse"
                                ></div>
                              ))}
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                              <CalendarIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                              <p className="text-gray-500">
                                Không có khung giờ nào khả dụng trong ngày này
                              </p>
                              <p className="text-sm text-gray-400 mt-2">
                                Vui lòng chọn ngày khác hoặc liên hệ với chúng
                                tôi
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              {availableSlots.map((slot) => (
                                <motion.button
                                  key={`${slot.startTime}-${slot.endTime}`}
                                  className={`p-3 text-center rounded-lg border text-sm transition-all duration-200 relative ${
                                    selectedSlot?.startTime === slot.startTime
                                      ? "border-primary-500 bg-primary-500 text-white shadow-md"
                                      : slot.isAvailable
                                      ? "border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700"
                                      : slot.isPastTime
                                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed relative overflow-hidden"
                                      : "border-red-100 bg-red-50 text-red-400 cursor-not-allowed relative overflow-hidden"
                                  }`}
                                  onClick={() => handleSlotSelect(slot)}
                                  disabled={!slot.isAvailable}
                                  whileHover={
                                    slot.isAvailable
                                      ? { y: -2, scale: 1.03 }
                                      : {}
                                  }
                                  whileTap={
                                    slot.isAvailable ? { scale: 0.98 } : {}
                                  }
                                  title={
                                    !slot.isAvailable
                                      ? slot.isPastTime
                                        ? "Đã qua giờ đặt lịch"
                                        : "Khung giờ này đã được đặt"
                                      : ""
                                  }
                                >
                                  {slot.displayTime ||
                                    `${slot.startTime} - ${slot.endTime}`}

                                  {/* Selected indicator */}
                                  {selectedSlot?.startTime ===
                                    slot.startTime && (
                                    <motion.div
                                      className="absolute -top-1 -right-1 bg-white text-primary-500 rounded-full p-0.5 shadow-sm border border-primary-500"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                      }}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </motion.div>
                                  )}

                                  {/* Unavailable indicator */}
                                  {!slot.isAvailable && (
                                    <>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div
                                          className={`absolute inset-0 ${
                                            slot.isPastTime
                                              ? "bg-gray-100/80"
                                              : "bg-red-50/80"
                                          } backdrop-blur-[1px]`}
                                        ></div>
                                        <div
                                          className={`relative z-10 text-xs ${
                                            slot.isPastTime
                                              ? "text-gray-500"
                                              : "text-red-500"
                                          } font-medium px-1 py-0.5 bg-white/50 rounded-sm`}
                                        >
                                          {slot.isPastTime
                                            ? "Đã qua giờ"
                                            : "Đã đặt"}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        Vui lòng chọn bác sĩ để xem lịch làm việc
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Chọn một bác sĩ từ danh sách bên trái để xem lịch làm
                        việc và đặt lịch hẹn
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    ← Quay lại
                  </Button>
                </motion.div>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="primary"
                    onClick={() => setStep(3)}
                    disabled={!selectedDoctor || !selectedDate || !selectedSlot}
                    className={
                      !selectedDoctor || !selectedDate || !selectedSlot
                        ? "opacity-50"
                        : "shadow-md hover:shadow-lg"
                    }
                  >
                    Tiếp tục →
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Confirm Information */}
      {step === 3 && (
        <Card title="Xác nhận thông tin đặt lịch">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-primary-500 mr-2" />
                  Thông tin lịch hẹn
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <BeakerIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dịch vụ</p>
                      <p className="font-medium text-gray-900">
                        {selectedService?.name}
                      </p>
                      {selectedService?.basePrice && (
                        <p className="text-sm text-primary-600 font-medium mt-1">
                          Giá:{" "}
                          {selectedService.basePrice.toLocaleString("vi-VN")}{" "}
                          VNĐ
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      <div className="p-2 bg-indigo-100 rounded-full">
                        <UserIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bác sĩ</p>
                      <p className="font-medium text-gray-900">
                        {selectedDoctor?.name}
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDoctor?.specialty && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              {selectedDoctor.specialty}
                            </span>
                          )}
                          {selectedDoctor?.degree && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                              {selectedDoctor.degree}
                            </span>
                          )}
                        </div>
                        {selectedDoctor?.experienceYears && (
                          <p className="mt-1">
                            Kinh nghiệm: {selectedDoctor.experienceYears} năm
                          </p>
                        )}
                        {selectedDoctor?.phone && (
                          <p className="mt-1">SĐT: {selectedDoctor.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CalendarIcon className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày khám</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      <div className="p-2 bg-amber-100 rounded-full">
                        <ClockIcon className="h-4 w-4 text-amber-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giờ khám</p>
                      <p className="font-medium text-gray-900">
                        {selectedSlot?.displayTime ||
                          `${selectedSlot?.startTime} - ${selectedSlot?.endTime}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-primary-500 mr-2" />
                  Thông tin bệnh nhân
                </h3>

                <div className="relative">
                  <label
                    htmlFor="symptoms"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Triệu chứng hiện tại
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                    placeholder="Mô tả các triệu chứng bạn đang gặp phải..."
                    value={patientInfo.symptoms}
                    onChange={handlePatientInfoChange}
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="medicalHistory"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tiền sử bệnh
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                    placeholder="Tiền sử bệnh án, các bệnh đã mắc, thuốc đang sử dụng..."
                    value={patientInfo.medicalHistory}
                    onChange={handlePatientInfoChange}
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ghi chú thêm
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                    placeholder="Ghi chú thêm cho bác sĩ..."
                    value={patientInfo.notes}
                    onChange={handlePatientInfoChange}
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="relative mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH"
                        checked={patientInfo.paymentMethod === "CASH"}
                        onChange={handlePatientInfoChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-800">
                        Tiền mặt (tại bệnh viện)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="QR"
                        checked={patientInfo.paymentMethod === "QR"}
                        onChange={handlePatientInfoChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-800">QR/Online</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    *Thanh toán sẽ được thực hiện sau khi check-in tại bệnh viện
                  </p>
                </div>

                <div className="flex items-center"></div>
              </div>

              <div className="mt-8 flex justify-between">
                <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => setStep(2)}>
                    ← Quay lại
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 shadow-md hover:shadow-lg text-base font-medium relative"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      "Xác nhận đặt lịch"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Card className="border-t-4 border-t-green-500 shadow-lg">
            <div className="p-8 text-center">
              <div className="mb-6 relative mx-auto w-20 h-20">
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.6,
                  }}
                />
                <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
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
                    <CheckCircleIcon className="h-12 w-12 text-green-600" />
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Đặt lịch thành công!
                </h3>
                <p className="text-gray-600 mb-3 max-w-md mx-auto">
                  Lịch hẹn của bạn đã được{" "}
                  <span className="text-green-600 font-medium">
                    tự động xác nhận và lưu vào hệ thống
                  </span>
                  . Bạn không cần thực hiện thêm bất kỳ thao tác nào.
                </p>

                <p className="text-primary-600 font-medium mb-8">
                  Tự động chuyển hướng sau {countdown} giây...
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => {
                        // Make sure to navigate to the correct path
                        console.log("Navigating to appointments page");
                        navigate("/customer/appointments");
                      }}
                      className="shadow-md hover:shadow-lg px-6"
                    >
                      Lịch hẹn của bạn
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="outline"
                      onClick={resetBooking}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Đặt lịch hẹn khác
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AppointmentBooking;
