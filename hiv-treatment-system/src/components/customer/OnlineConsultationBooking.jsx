
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  UserCircleIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Calendar from "../common/Calendar";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import Checkbox from "../common/Checkbox";
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";

const OnlineConsultationBooking = ({ onBookingComplete = null }) => {
  // Hook điều hướng
  const navigate = useNavigate();

  // State quản lý bước hiện tại trong quy trình đặt lịch (1-3)
  const [step, setStep] = useState(1);

  // State quản lý lựa chọn bác sĩ, ngày và khung giờ
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // State danh sách bác sĩ và khung giờ khả dụng
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // State thông tin bệnh nhân cần thu thập
  const [patientInfo, setPatientInfo] = useState({
    symptoms: "", 
    medicalHistory: "", 
    notes: "", 
    isUrgent: false, 
    isAnonymous: false, 
  });

  // State quản lý trạng thái form và UI
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [success, setSuccess] = useState(false); 
  const [countdown, setCountdown] = useState(3); 

  
  const ONLINE_CONSULTATION_SERVICE_ID = 6;

  /**
   * Kiểm tra trạng thái đăng nhập và tải dữ liệu ban đầu
   * - Chuyển hướng đến trang đăng nhập nếu chưa xác thực
   * - Tải danh sách bác sĩ khi component được mount
   */
  useEffect(() => {
    // Kiểm tra xác thực người dùng
    if (!authService.isAuthenticated()) {
      // Chuyển hướng đến trang đăng nhập và lưu đường dẫn hiện tại để quay lại sau
      navigate("/login", {
        state: {
          from: "/customer/online-consultation/new",
          message: "Bạn cần đăng nhập để đặt lịch tư vấn online",
        },
      });
      return;
    }

    // Tải dữ liệu ban đầu (danh sách bác sĩ)
    loadInitialData();
  }, [navigate]);

  /**
   * Tải danh sách bác sĩ từ API

   */
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Gọi API lấy danh sách bác sĩ
      const doctorsResponse = await appointmentService.getDoctors();

      if (doctorsResponse.success) {
        // Cập nhật state với danh sách bác sĩ từ API
        setDoctors(doctorsResponse.data);
        setAvailableDoctors(doctorsResponse.data);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải khung giờ khả dụng khi người dùng đã chọn bác sĩ và ngày
   * Sử dụng useEffect để tự động gọi loadAvailableSlots khi các dependency thay đổi
   */
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  /**
   * Tải danh sách các khung giờ khả dụng cho bác sĩ và ngày đã chọn
   * - Gửi request đến API với ID bác sĩ, ngày và ID dịch vụ tư vấn online (6)
   * - Đánh dấu các khung giờ đã qua để vô hiệu hóa
   */
  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      // Gọi API lấy danh sách khung giờ khả dụng
      const response = await appointmentService.getAvailableSlots(
        selectedDoctor.id,
        appointmentService.formatDateForAPI(selectedDate),
        ONLINE_CONSULTATION_SERVICE_ID 
      );

      if (response.success) {
        // Kiểm tra và đánh dấu các khung giờ đã qua (không thể đặt)
        const now = new Date();
        const isToday =
          new Date(selectedDate).setHours(0, 0, 0, 0) ===
          new Date().setHours(0, 0, 0, 0);

        // Xử lý từng khung giờ và đánh dấu nếu đã qua
        const slotsWithPastTimeMarked = response.data.map((slot) => {
          if (isToday) {
            // Phân tích giờ bắt đầu từ chuỗi "HH:MM"
            const [hours, minutes] = slot.startTime.split(":").map(Number);
            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);

            // Nếu khung giờ đã qua, đánh dấu là không khả dụng và lý do là "đã qua giờ"
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

        // Cập nhật state với danh sách khung giờ đã được xử lý
        setAvailableSlots(slotsWithPastTimeMarked);
      } else {
        setError(response.message || "Không thể tải thông tin khung giờ trống");
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
   * Xử lý sự kiện khi người dùng chọn bác sĩ
   * - Lưu bác sĩ được chọn vào state
   * - Reset các lựa chọn về ngày và khung giờ
   * @param {Object} doctor - Đối tượng bác sĩ được chọn
   */
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  /**
   * Xử lý sự kiện khi người dùng chọn ngày tư vấn
   * - Lưu ngày được chọn vào state
   * - Reset khung giờ đã chọn
   * @param {string} date - Ngày được chọn dạng ISO string (YYYY-MM-DD)
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  /**
   * Xử lý sự kiện khi người dùng chọn khung giờ tư vấn
   * - Lưu khung giờ được chọn vào state
   * - Chuyển đến bước tiếp theo (bước 2)
   * @param {Object} slot - Đối tượng khung giờ chứa thông tin startTime, endTime
   */
  const handleSlotSelect = (slot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setStep(2); // Chuyển đến bước nhập thông tin bệnh nhân
    }
  };

  /**
   * Xử lý thay đổi thông tin trong form
   * - Cập nhật state patientInfo với giá trị mới
   * - Xử lý các loại input khác nhau (text, checkbox)
   * @param {Event} e - Sự kiện change từ form input
   */
  const handlePatientInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientInfo({
      ...patientInfo,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /**
   * Xử lý gửi form đặt lịch tư vấn trực tuyến
   * - Kiểm tra dữ liệu trước khi gửi
   * - Chuẩn bị dữ liệu và gọi API đặt lịch
   * - Xử lý kết quả trả về (thành công/thất bại)
   * - Thiết lập đếm ngược tự động chuyển trang sau khi đặt lịch thành công
   * @param {Event} e - Sự kiện submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra thông tin bắt buộc
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Định dạng thời gian theo yêu cầu API (YYYY-MM-DD HH:mm:ss)
      const scheduledAt = appointmentService.formatDateTimeForAPI(
        selectedDate,
        selectedSlot.startTime
      );
      console.log("Formatted scheduledAt:", scheduledAt);

      // Chuẩn bị dữ liệu đặt lịch
      const appointmentData = {
        doctorId: selectedDoctor.id,
        serviceId: ONLINE_CONSULTATION_SERVICE_ID,
        scheduledAt: scheduledAt,
        scheduleId: selectedSlot.scheduleId,
        symptoms: patientInfo.symptoms,
        medicalHistory: patientInfo.medicalHistory,
        notes: patientInfo.notes,
        isOnline: true, 
        isAnonymous: patientInfo.isAnonymous, 
        autoConfirm: true,
      };

      // Gửi yêu cầu đặt lịch đến API
      console.log("Online consultation data being sent:", appointmentData);
      const response = await appointmentService.bookAppointment(
        appointmentData
      );

      if (response.success) {
        // Cập nhật state khi đặt lịch thành công
        setSuccess(true);
        setStep(3); // Chuyển đến bước thành công
        setCountdown(3);

        // Bắt đầu đếm ngược và tự động chuyển hướng đến trang lịch hẹn sau  giây
        const timer = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(timer);
              // Chuyển hướng đến trang lịch hẹn hoặc gọi callback
              if (onBookingComplete) {
                onBookingComplete(response.data);
              } else {
                navigate("/customer/appointments");
              }
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
      } else {
        // Xử lý lỗi từ API
        setError(response.message || "Không thể đặt lịch tư vấn online");
      }
    } catch (error) {
      // Xử lý lỗi mạng hoặc lỗi hệ thống
      console.error("Error booking online consultation:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset tất cả các state về giá trị mặc định để đặt lịch mới
   * - Quay về bước 1 của quy trình
   * - Xóa tất cả các lựa chọn và thông tin đã nhập
   */
  const resetBooking = () => {
    // Reset bước và lựa chọn
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);

    // Reset thông tin bệnh nhân
    setPatientInfo({
      symptoms: "",
      medicalHistory: "",
      notes: "",
      isUrgent: false,
      isAnonymous: false,
    });

    // Reset thông báo
    setError(null);
    setSuccess(false);
  };

  /**
   * Định dạng ngày hiển thị cho người dùng theo định dạng Việt Nam
   * @param {string} dateString - Chuỗi ngày ISO (YYYY-MM-DD)
   * @returns {string} Ngày đã định dạng
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Tạo mảng ngày cho 2 tuần tới (bao gồm hôm nay)
   * Sử dụng để hiển thị lịch chọn ngày cho người dùng
   * @returns {Array} Mảng chứa các ngày ở định dạng ISO (YYYY-MM-DD)
   */
  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt về đầu ngày hôm nay

    // Bắt đầu từ 0 để bao gồm ngày hôm nay
    for (let i = 0; i <= 14; i++) {
      // Tạo mảng ngày cho 2 tuần tới
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]); // Chuyển về định dạng ISO YYYY-MM-DD
    }
    return dates;
  };

  /**
   * Hiển thị trạng thái loading khi đang tải dữ liệu ban đầu
   * Chỉ hiển thị ở bước 1 khi đang tải danh sách bác sĩ
   */
  if (loading && step === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          {/* Hiệu ứng loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  /**
   * Render chính của component
   * Hiển thị quy trình đặt lịch theo từng bước (step)
   */
  return (
    <div className="space-y-6">
      {/* Hiển thị thông báo lỗi nếu có */}
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

      {/* Thanh tiến trình hiển thị các bước */}
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
            Chọn bác sĩ
          </p>
        </div>
        <div className="text-center">
          <p
            className={`text-sm font-medium transition-colors duration-300 ${
              step >= 2 ? "text-primary-600" : "text-gray-500"
            }`}
          >
            Chọn thời gian
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

      {/* BƯỚC 1: Chọn bác sĩ và thời gian tư vấn */}
      {step === 1 && (
        <div className="space-y-6">
          <Card title="Chọn bác sĩ tư vấn trực tuyến">
            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Danh sách bác sĩ bên trái */}
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

                {/* Phần chọn thời gian bên phải */}
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
                          Chọn ngày tư vấn
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
                              const hasAvailability = !isPastDate; // Dates in the past are not available

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
                                    hasAvailability
                                      ? { y: -2, scale: 1.02 }
                                      : {}
                                  }
                                  whileTap={
                                    hasAvailability ? { scale: 0.98 } : {}
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
                            Chọn giờ tư vấn - {formatDate(selectedDate)}
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
                        việc và đặt lịch tư vấn trực tuyến
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Confirm Information */}
      {step === 2 && (
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
                        <VideoCameraIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dịch vụ</p>
                      <p className="font-medium text-gray-900">
                        Tư vấn trực tuyến
                      </p>
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

              {/* Form nhập thông tin bệnh nhân */}
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
                    value={patientInfo.medicalHistory || ""}
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

                {/* Tùy chọn tư vấn ẩn danh - tính năng đặc biệt */}
                <div className="flex items-center mt-4">
                  <div className="flex items-center h-12">
                    <input
                      id="isAnonymous"
                      name="isAnonymous"
                      type="checkbox"
                      checked={patientInfo.isAnonymous}
                      onChange={handlePatientInfoChange}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="isAnonymous"
                      className="ml-2 block text-sm text-gray-700 font-medium"
                    >
                      Tư vấn ẩn danh (tên và thông tin cá nhân sẽ được giữ kín
                      với bác sĩ)
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => setStep(1)}>
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

      {/* BƯỚC 3: Hiển thị thông báo thành công và các bước tiếp theo */}
      {step === 3 && success && (
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
                  Đặt lịch tư vấn trực tuyến thành công!
                </h3>
                <p className="text-gray-600 mb-3 max-w-md mx-auto">
                  Lịch hẹn tư vấn trực tuyến của bạn đã được{" "}
                  <span className="text-green-600 font-medium">
                    tự động xác nhận và lưu vào hệ thống
                  </span>
                  .
                </p>

                {/* Thông báo lưu ý cho người dùng về việc tham gia cuộc gọi */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 max-w-md mx-auto">
                  <p className="text-blue-700 text-sm">
                    <strong>Lưu ý:</strong> Vui lòng đăng nhập trước giờ tư vấn
                    để bắt đầu buổi tư vấn trực tuyến với bác sĩ.
                  </p>
                </div>

                <p className="text-primary-600 font-medium mb-8">
                  Tự động chuyển hướng sau {countdown} giây...
                </p>

                {/* Các lựa chọn để người dùng tiếp tục sau khi đặt lịch thành công */}
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Nút xem danh sách lịch hẹn */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="primary"
                      onClick={() => {
                        // Chuyển đến trang danh sách lịch hẹn
                        console.log("Navigating to appointments page");
                        navigate("/customer/appointments");
                      }}
                      className="shadow-md hover:shadow-lg px-6"
                    >
                      Lịch hẹn của bạn
                    </Button>
                  </motion.div>
                  
                  {/* Nút đặt lịch mới */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      variant="outline"
                      onClick={resetBooking}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Đặt lịch tư vấn khác
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

export default OnlineConsultationBooking;
