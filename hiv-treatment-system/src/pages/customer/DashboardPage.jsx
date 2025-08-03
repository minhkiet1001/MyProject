import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Button from "../../components/common/Button";
import appointmentService from "../../services/appointmentService";
import medicalRecordsService from "../../services/medicalRecordsService";
import MedicationReminder from "../../components/customer/MedicationReminder";
import ProfileModal from "../../components/common/ProfileModal";
import ActionBanner from "../../components/common/ActionBanner";
import {
  CalendarIcon,
  PhoneIcon,
  BeakerIcon,
  UserIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  HeartIcon,
  VideoCameraIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  // Khai báo các state để lưu trữ dữ liệu
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentTestResults, setRecentTestResults] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(5);

  // Dữ liệu banner cho slideshow
  const bannerSlides = [
    {
      id: 1,
      image: "/images/healthcare-banner-1.jpg",
      title: "Chăm sóc bằng tài năng, y đức và sự thấu cảm",
      description:
        "Đội ngũ y bác sĩ luôn sẵn sàng hỗ trợ quá trình điều trị của bạn",
    },
    {
      id: 2,
      image: "/images/healthcare-banner-2.jpg",
      title: "Kiểm soát sức khỏe, kiểm soát cuộc sống",
      description:
        "Theo dõi các chỉ số sức khỏe quan trọng trong quá trình điều trị",
    },
    {
      id: 3,
      image: "/images/healthcare-banner-3.jpg",
      title: "Đồng hành cùng bạn trên hành trình điều trị",
      description: "Hỗ trợ toàn diện từ tư vấn đến theo dõi quá trình điều trị",
    },
  ];

  /**
   * Thiết lập slideshow tự động chuyển sau 5 giây
   * Sử dụng useEffect để quản lý vòng đời của interval
   */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Chuyển đến slide cụ thể và reset interval để tránh chuyển slide ngay sau khi người dùng chọn
   * @param {number} index - Chỉ số của slide cần hiển thị
   */
  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
  };

  /**
   * Lấy tên người dùng từ localStorage để hiển thị lời chào
   * @returns {string} Tên người dùng hoặc 'bệnh nhân' nếu không tìm thấy
   */
  const getUserName = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.name;
    } catch (err) {
      console.error("Error getting user name:", err);
      return "bệnh nhân";
    }
  };

  /**
   * Tải dữ liệu ban đầu khi component được mount
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Tải dữ liệu từ các API cho trang dashboard
   * Bao gồm: cuộc hẹn sắp tới
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tải danh sách cuộc hẹn sắp tới
      const appointmentsResponse =
        await appointmentService.getUpcomingAppointments();
      if (appointmentsResponse.success) {
        const transformedAppointments = (appointmentsResponse.data || []).map(
          (appointment) => ({
            id: appointment.id,
            doctorName: appointment.doctorName || "Bác sĩ",
            date: new Date(appointment.scheduledAt),
            type: appointment.serviceName || "Khám bệnh",
            location: appointment.location || "Phòng khám",
            status: appointment.status || "SCHEDULED",
            // Đánh dấu đã check-in nếu trạng thái là CHECKED_IN
            checkedIn: appointment.status === "CHECKED_IN" || false,
            isCompleted:
              appointment.status === "COMPLETED" ||
              appointment.status === "FINISHED" ||
              appointment.status === "DONE" ||
              false,
            isConfirmed:
              appointment.status === "CONFIRMED" ||
              appointment.status === "CHECKED_IN" ||
              appointment.status === "UNDER_REVIEW" ||
              false,
            isOnline: appointment.isOnline || false, // Thuộc tính để xác định cuộc hẹn trực tuyến
          })
        );

        // Đồng bộ với trạng thái check-in từ localStorage
        try {
          const checkedInAppointments = JSON.parse(
            localStorage.getItem("checkedInAppointments") || "[]"
          );
          if (checkedInAppointments.length > 0) {
            transformedAppointments.forEach((apt) => {
              if (checkedInAppointments.includes(apt.id)) {
                apt.checkedIn = true;
                apt.status = "CHECKED_IN"; // Cập nhật status thành CHECKED_IN
              }
            });
          }
        } catch (err) {
          console.error("Error syncing check-in states from localStorage", err);
        }

        // Lấy ngày hiện tại (đầu ngày) để so sánh
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Lọc ra các cuộc hẹn đã hoàn thành và đã qua
        const validAppointments = transformedAppointments.filter((apt) => {
          // Loại bỏ cuộc hẹn đã hoàn thành
          if (apt.isCompleted) return false;

          // Loại bỏ cuộc hẹn đã qua (trước ngày hôm nay)
          const appointmentDate = new Date(apt.date);
          appointmentDate.setHours(0, 0, 0, 0);
          if (appointmentDate < today) return false;

          return true;
        });

        // Phân loại cuộc hẹn trực tuyến và trực tiếp
        const onlineAppointments = validAppointments.filter(
          (apt) => apt.isOnline
        );
        const inPersonAppointments = validAppointments.filter(
          (apt) => !apt.isOnline
        );

        // Lọc cuộc hẹn đã xác nhận và sắp xếp theo ngày
        const confirmedOnlineAppointments = onlineAppointments
          .filter((apt) => apt.isConfirmed || apt.status === "UNDER_REVIEW")
          .sort((a, b) => a.date - b.date);

        const confirmedInPersonAppointments = inPersonAppointments
          .filter((apt) => apt.isConfirmed)
          .sort((a, b) => a.date - b.date);

        // Nếu có cuộc hẹn đã xác nhận, chỉ hiển thị cuộc hẹn gần nhất
        // Ngược lại, hiển thị tất cả cuộc hẹn sắp tới
        const onlineAppointmentsToShow =
          confirmedOnlineAppointments.length > 0
            ? [confirmedOnlineAppointments[0]]
            : onlineAppointments.sort((a, b) => a.date - b.date);

        const inPersonAppointmentsToShow =
          confirmedInPersonAppointments.length > 0
            ? [confirmedInPersonAppointments[0]]
            : inPersonAppointments.sort((a, b) => a.date - b.date);

        setUpcomingAppointments([
          ...onlineAppointmentsToShow,
          ...inPersonAppointmentsToShow,
        ]);
      }

      // Tải thông tin thuốc hiện tại (từ kế hoạch điều trị)
      const treatmentPlansResponse =
        await medicalRecordsService.getActiveTreatmentPlans();
      if (treatmentPlansResponse.success) {
        const activePlans = treatmentPlansResponse.data || [];
        const currentMedications = activePlans.flatMap(
          (plan) =>
            plan.medications?.map((med) => ({
              id: med.id,
              name: med.medicationName,
              dosage: med.dosage,
              frequency: med.frequency,
              nextRefill: med.nextRefillDate
                ? new Date(med.nextRefillDate)
                : null,
            })) || []
        );
        setMedications(currentMedications);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý chức năng check-in cho cuộc hẹn
   * @param {string} appointmentId - ID của cuộc hẹn cần check-in
   */
  const handleCheckIn = async (appointmentId) => {
    // Tìm cuộc hẹn cần check-in
    const appointment = upcomingAppointments.find(
      (apt) => apt.id === appointmentId
    );

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

        alert(
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
        // Cập nhật trạng thái cuộc hẹn cục bộ
        setUpcomingAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  checkedIn: true,
                  status: "CHECKED_IN", // Cập nhật trạng thái thành CHECKED_IN
                }
              : apt
          )
        );

        // Lưu trạng thái check-in vào localStorage để duy trì sau khi reload
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
      } else {
        // Xử lý lỗi
        console.error("Check-in failed:", response.message);
        alert(`Không thể check-in: ${response.message || "Đã xảy ra lỗi"}`);
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      // Hiển thị thông báo lỗi cho người dùng
      alert(`Không thể check-in: ${error.message || "Đã xảy ra lỗi"}`);
    }
  };

  // /**
  //  * Cập nhật tóm tắt sức khỏe từ kết quả xét nghiệm
  //  * @param {Array} testResults - Danh sách kết quả xét nghiệm
  //  */
  // const updateHealthSummary = (testResults) => {
  //   if (!testResults || testResults.length === 0) return;

  //   // Tìm kết quả xét nghiệm CD4 và tải lượng virus gần nhất
  //   const cd4Test = testResults
  //     .filter((test) => test.testType === "CD4")
  //     .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))[0];

  //   const viralLoadTest = testResults
  //     .filter((test) => test.testType === "VIRAL_LOAD")
  //     .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))[0];

  //   const newSummary = { ...healthSummary };

  //   if (cd4Test) {
  //     newSummary.cd4Count = `${cd4Test.result} ${cd4Test.unit || ""}`.trim();
  //     newSummary.lastTestDate = formatDate(new Date(cd4Test.testDate));
  //   }

  //   if (viralLoadTest) {
  //     newSummary.viralLoad =
  //       viralLoadTest.result === "0" || parseFloat(viralLoadTest.result) < 20
  //         ? "Không phát hiện"
  //         : `${viralLoadTest.result} ${viralLoadTest.unit || ""}`.trim();
  //     if (!cd4Test) {
  //       newSummary.lastTestDate = formatDate(new Date(viralLoadTest.testDate));
  //     }
  //   }

  //   setHealthSummary(newSummary);
  // };

  /**
   * Lấy tên hiển thị cho loại xét nghiệm
   * @param {string} testType - Loại xét nghiệm (mã)
   * @returns {string} Tên hiển thị của xét nghiệm
   */
  const getTestDisplayName = (testType) => {
    const testNames = {
      CD4: "Số lượng CD4",
      VIRAL_LOAD: "Tải lượng virus",
      HIV_TEST: "Xét nghiệm HIV",
      BLOOD_COUNT: "Công thức máu",
      LIVER_FUNCTION: "Chức năng gan",
      KIDNEY_FUNCTION: "Chức năng thận",
      OTHER: "Xét nghiệm khác",
    };
    return testNames[testType] || testType;
  };

  /**
   * Ánh xạ kết quả diễn giải sang trạng thái hiển thị
   * @param {string} interpretation - Kết quả diễn giải xét nghiệm
   * @returns {string} Trạng thái hiển thị (normal/attention/critical)
   */
  const mapInterpretationToStatus = (interpretation) => {
    if (!interpretation) return "normal";

    const statusMap = {
      EXCELLENT: "normal",
      NORMAL: "normal",
      GOOD: "normal",
      LOW: "attention",
      HIGH: "attention",
      CRITICAL: "critical",
      ABNORMAL: "critical",
    };
    return statusMap[interpretation] || "normal";
  };

  /**
   * Định dạng ngày tháng để hiển thị
   * @param {Date} date - Đối tượng ngày cần định dạng
   * @returns {string} Chuỗi ngày đã định dạng (VD: Thứ Hai, 15 thg 7, 2023)
   */
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Định dạng thời gian để hiển thị
   * @param {Date} date - Đối tượng ngày cần định dạng thời gian
   * @returns {string} Chuỗi thời gian đã định dạng (VD: 14:30)
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Kiểm tra xem cuộc hẹn có phải trong ngày hôm nay không
   * @param {Date} date - Ngày của cuộc hẹn
   * @returns {boolean} true nếu là hôm nay, ngược lại là false
   */
  const isAppointmentToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Kiểm tra xem cuộc hẹn có thể check-in không
   * @param {Object} appointment - Thông tin cuộc hẹn
   * @returns {boolean} true nếu có thể check-in, false nếu không
   */
  const canCheckInAppointment = (appointment) => {
    // Chỉ có thể check-in nếu trạng thái là confirmed hoặc scheduled
    if (
      appointment.status !== "CONFIRMED" &&
      appointment.status !== "SCHEDULED" &&
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
   * Kiểm tra xem lịch hẹn có thể hủy không
   * @param {Object} appointment - Thông tin cuộc hẹn
   * @returns {boolean} true nếu có thể hủy, false nếu không
   */
  const canCancelAppointment = (appointment) => {
    // Không thể hủy nếu đã check-in
    if (appointment.checkedIn || appointment.status === "CHECKED_IN") {
      return false;
    }

    // Không thể hủy nếu còn ít hơn 24 giờ
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return appointmentDate - now > oneDayInMs;
  };

  /**
   * Xử lý hủy lịch hẹn
   * @param {string} appointmentId - ID của cuộc hẹn cần hủy
   * @param {string} reason - Lý do hủy lịch hẹn
   */
  const handleCancelAppointment = async (appointmentId, reason) => {
    // Tìm lịch hẹn
    const appointment = upcomingAppointments.find(
      (apt) => apt.id === appointmentId
    );

    // Kiểm tra xem lịch hẹn có thể hủy không
    if (appointment && !canCancelAppointment(appointment)) {
      // Kiểm tra xem lịch hẹn đã check-in chưa
      if (appointment.status === "CHECKED_IN" || appointment.checkedIn) {
        alert("Không thể hủy lịch hẹn sau khi đã check-in.");
        return;
      }

      // Kiểm tra xem lịch hẹn có còn cách đây hơn 24 giờ không
      const appointmentDate = new Date(appointment.date);
      const now = new Date();
      const formattedTime = appointmentDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = appointmentDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      alert(
        `Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ hẹn (${formattedDate} ${formattedTime}).`
      );
      return;
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
          setUpcomingAppointments((prevAppointments) =>
            prevAppointments.filter((apt) => apt.id !== appointmentId)
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
          alert(response.message || "Không thể hủy lịch hẹn");
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert(error.message || "Đã xảy ra lỗi khi hủy lịch hẹn");
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
   * Lấy màu hiển thị cho trạng thái kết quả xét nghiệm
   * @param {string} status - Trạng thái kết quả (normal/attention/critical)
   * @returns {string} Lớp CSS tương ứng với trạng thái
   */
  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "normal":
  //       return "bg-green-100 text-green-800";
  //     case "attention":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "critical":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  /**
   * Lấy văn bản hiển thị cho trạng thái kết quả xét nghiệm
   * @param {string} status - Trạng thái kết quả (normal/attention/critical)
   * @returns {string} Văn bản hiển thị tương ứng với trạng thái
   */
  // const getStatusText = (status) => {
  //   switch (status) {
  //     case "normal":
  //       return "Bình thường";
  //     case "attention":
  //       return "Cần chú ý";
  //     case "critical":
  //       return "Nguy hiểm";
  //     default:
  //       return "Không xác định";
  //   }
  // };

  /**
   * Lấy thông tin về cuộc hẹn sắp tới gần nhất
   * @returns {Object|null} Thông tin cuộc hẹn gần nhất hoặc null nếu không có
   */
  const getNextAppointment = () => {
    if (!upcomingAppointments || upcomingAppointments.length === 0) return null;
    return upcomingAppointments[0];
  };

  /**
   * Render nhãn trạng thái của cuộc hẹn
   * @param {Object} appointment - Thông tin cuộc hẹn
   * @returns {JSX.Element|null} Phần tử JSX hiển thị trạng thái hoặc null
   */
  const renderAppointmentStatusBadge = (appointment) => {
    // Nếu cuộc hẹn đã hoàn thành
    if (appointment.isCompleted) {
      return (
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Hoàn thành
        </span>
      );
    }

    // Nếu đã check-in hoặc có status CHECKED_IN
    if (appointment.checkedIn || appointment.status === "CHECKED_IN") {
      return (
        <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Đã check-in
        </span>
      );
    }

    // Nếu đã xác nhận nhưng chưa check-in
    if (
      appointment.isConfirmed &&
      !appointment.checkedIn &&
      appointment.status !== "CHECKED_IN"
    ) {
      return (
        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Đã xác nhận
        </span>
      );
    }

    return null;
  };

  // Render appointment buttons based on status
  const renderAppointmentButtons = (appointment) => {
    // Nếu cuộc hẹn đã hoàn thành
    if (appointment.isCompleted) {
      return (
        <div className="mt-4">
          <Button
            variant="outline"
            size="md"
            className="w-full justify-center border-green-200 hover:bg-green-50 transition-all duration-300 py-3 rounded-xl"
            onClick={() => navigate("/customer/appointment-selection")}
          >
            Đặt lịch hẹn mới
          </Button>
        </div>
      );
    }

    // Nếu đã check-in
    if (appointment.checkedIn) {
      return (
        <div className="mt-4">
          <Button
            variant="outline"
            size="md"
            className="w-full justify-center border-blue-200 hover:bg-blue-50 transition-all duration-300 py-3 rounded-xl"
            onClick={() => navigate("/customer/appointment-selection")}
          >
            Đặt lịch hẹn khác
          </Button>
        </div>
      );
    }

    // Xử lý cuộc hẹn trực tuyến (online)
    if (appointment.isOnline) {
      return (
        <div className="mt-4">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl shadow-md"
            onClick={() =>
              navigate(`/customer/appointments/online/${appointment.id}`)
            }
          >
            <VideoCameraIcon className="w-5 h-5 mr-2" />
            Tham gia trực tuyến
          </Button>
        </div>
      );
    }

    // Nếu đã xác nhận và chưa check-in
    if (appointment.isConfirmed && !appointment.checkedIn) {
      return (
        <div className="flex space-x-3 mt-4">
          {canCheckInAppointment(appointment) ? (
            <Button
              variant="primary"
              size="md"
              className="flex-1 justify-center bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl shadow-md"
              onClick={() => handleCheckIn(appointment.id)}
            >
              Check-in
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              className="flex-1 justify-center border-blue-200 bg-blue-50/50 text-blue-700 py-3 rounded-xl"
              disabled={true}
              title="Chỉ có thể check-in trong vòng 2 giờ trước giờ hẹn"
            >
              Chưa đến giờ check-in
            </Button>
          )}
          {canCancelAppointment(appointment) ? (
            <Button
              variant="danger"
              size="md"
              className="flex-1 justify-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 py-3 rounded-xl shadow-md"
              onClick={() => handleCancelAppointment(appointment.id)}
            >
              Hủy lịch hẹn
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              className="flex-1 justify-center border-red-200 bg-red-50/50 text-red-700 py-3 rounded-xl"
              disabled={true}
              title="Chỉ có thể hủy lịch hẹn trước 24 giờ"
            >
              Không thể hủy
            </Button>
          )}
        </div>
      );
    }

    // Nếu là ngày hôm nay và chưa check-in (cho các trạng thái khác)
    if (isAppointmentToday(appointment.date)) {
      return (
        <div className="flex space-x-3 mt-4">
          {canCheckInAppointment(appointment) ? (
            <Button
              variant="primary"
              size="md"
              className="flex-1 justify-center bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl shadow-md"
              onClick={() => handleCheckIn(appointment.id)}
            >
              Check-in
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              className="flex-1 justify-center border-blue-200 bg-blue-50/50 text-blue-700 py-3 rounded-xl"
              disabled={true}
              title="Chỉ có thể check-in trong vòng 2 giờ trước giờ hẹn"
            >
              Chưa đến giờ check-in
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center border-indigo-200 hover:bg-indigo-50 transition-all duration-300 py-3 rounded-xl"
            onClick={() => navigate("/customer/appointment-selection")}
          >
            Đặt lịch khác
          </Button>
        </div>
      );
    }

    // Nếu là ngày tương lai
    return (
      <div className="flex space-x-3 mt-4">
        {canCheckInAppointment(appointment) ? (
          <Button
            variant="primary"
            size="md"
            className="flex-1 justify-center bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl shadow-md"
            onClick={() => handleCheckIn(appointment.id)}
          >
            Check-in
          </Button>
        ) : (
          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center border-blue-200 bg-blue-50/50 text-blue-700 py-3 rounded-xl"
            disabled={true}
            title="Chỉ có thể check-in trong vòng 2 giờ trước giờ hẹn"
          >
            Chưa đến giờ check-in
          </Button>
        )}
        {canCancelAppointment(appointment) ? (
          <Button
            variant="danger"
            size="md"
            className="flex-1 justify-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 py-3 rounded-xl shadow-md"
            onClick={() => handleCancelAppointment(appointment.id)}
          >
            Hủy lịch hẹn
          </Button>
        ) : (
          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center border-red-200 bg-red-50/50 text-red-700 py-3 rounded-xl"
            disabled={true}
            title="Chỉ có thể hủy lịch hẹn trước 24 giờ"
          >
            Không thể hủy
          </Button>
        )}
      </div>
    );
  };

  // Loading skeleton animation
  const SimpleLoadingState = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 rounded-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="h-12 bg-gray-200 rounded-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
      </div>
    </div>
  );

  // Wave pattern SVG
  const WavePattern = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-10 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="absolute w-full h-full scale-150"
      >
        <path
          fill="#4f46e5"
          fillOpacity="0.6"
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,149.3C672,149,768,171,864,181.3C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="absolute w-full h-full scale-150 translate-y-40"
      >
        <path
          fill="#06b6d4"
          fillOpacity="0.3"
          d="M0,64L60,80C120,96,240,128,360,144C480,160,600,160,720,154.7C840,149,960,139,1080,144C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        ></path>
      </svg>
    </div>
  );

  return (
    <Layout currentRole={UserRole.CUSTOMER} userName={getUserName()}>
      <div className="min-h-screen bg-gray-50">
        {/* Banner slideshow */}
        <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                  <div className="max-w-lg">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-3 text-lg text-gray-100">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slide indicators */}
          <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center space-x-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-12 rounded-full transition-all ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
          {/* Action Banner Component */}
          <ActionBanner />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area - Left Side */}
            <div className="lg:col-span-8 space-y-6">
              {/* Health Information */}
              {/* <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-800 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Chỉ số sức khỏe</h2>
                </div>
                
                <div className="p-5">
                  <div className="text-right text-xs text-gray-500 mb-4">
                    Cập nhật: {healthSummary.lastTestDate}
                  </div>
                  
                  {loading ? <SimpleLoadingState /> : (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-700" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-700">Số lượng CD4</h3>
                            <p className="text-2xl font-bold text-blue-700">{healthSummary.cd4Count}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                        <div className="flex items-center">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-green-700" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-700">Tải lượng virus</h3>
                            <p className="text-2xl font-bold text-green-700">{healthSummary.viralLoad}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Why Choose Us Section */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-800 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Tại sao nên chọn dịch vụ của chúng tôi
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Hình ảnh bác sĩ bên trái */}
                    <div className="md:w-1/3 flex justify-center">
                      <img
                        src="/images/healthcare-banner-4.jpg"
                        alt="Đội ngũ y tế chuyên nghiệp"
                        className="rounded-lg object-cover h-[350px] w-full md:w-auto"
                      />
                    </div>

                    {/* Nội dung bên phải */}
                    <div className="md:w-2/3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <UserGroupIcon className="h-6 w-6 text-blue-700" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-gray-900">
                              Chuyên gia hàng đầu
                            </h3>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Hệ thống quy tụ đội ngũ chuyên gia, bác sĩ, dược sĩ
                            và điều dưỡng có trình độ chuyên môn cao, tay nghề
                            giỏi, tận tâm và chuyên nghiệp. Luôn đặt người bệnh
                            làm trung tâm, chúng tôi cam kết đem đến dịch vụ
                            chăm sóc sức khỏe tốt cho khách hàng.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center mb-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <BuildingOfficeIcon className="h-6 w-6 text-blue-700" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-gray-900">
                              Chất lượng quốc tế
                            </h3>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Hệ thống Y tế được quản lý và vận hành dưới sự giám
                            sát của những nhà quản lý y tế giàu kinh nghiệm,
                            cùng với sự hỗ trợ của phương tiện kỹ thuật hiện
                            đại, nhằm đảm bảo cung cấp dịch vụ chăm sóc sức khỏe
                            toàn diện và hiệu quả.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center mb-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <HeartIcon className="h-6 w-6 text-blue-700" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-gray-900">
                              Công nghệ tiên tiến
                            </h3>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Chúng tôi cung cấp cơ sở vật chất hạng nhất và dịch
                            vụ 5 sao bằng cách sử dụng các công nghệ tiên tiến
                            được quản lý bởi các bác sĩ lâm sàng lành nghề để
                            đảm bảo dịch vụ chăm sóc sức khỏe toàn diện và hiệu
                            quả cao.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center mb-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <AcademicCapIcon className="h-6 w-6 text-blue-700" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-gray-900">
                              Nghiên cứu & Đổi mới
                            </h3>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Chúng tôi liên tục thúc đẩy y học hàn lâm dựa trên
                            nghiên cứu có phương pháp và sự phát triển y tế được
                            chia sẻ từ quan hệ đối tác toàn cầu với các hệ thống
                            chăm sóc sức khỏe hàng đầu thế giới nhằm cung cấp
                            các phương pháp điều trị mang tính cách mạng.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center md:justify-start">
                        {/* <Button
                          variant="outline"
                          size="md"
                          className="text-blue-700 border-blue-200 hover:bg-blue-50 px-6"
                          onClick={() => navigate('/customer/resources')}
                        >
                          <span className="flex items-center">
                            Tìm hiểu thêm
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                          </span>
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:col-span-4 space-y-6">
              {/* Lịch uống thuốc hôm nay */}
              {/* <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-800 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Thuốc hôm nay
                  </h2>
                </div>
                
                <div className="p-5">
                  {loading ? <SimpleLoadingState /> : (
                    <div>
                      <MedicationReminder limit={3} />
                      {medications.length > 0 ? (
                        <div className="mt-4">
                          <Button 
                            variant="success" 
                            size="lg"
                            className="w-full justify-center font-medium py-3 rounded-md"
                          >
                            <span className="inline-flex items-center">
                              <CheckCircleIcon className="h-6 w-6 mr-2" />
                              Đã uống tất cả
                            </span>
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-blue-50 rounded-md p-4 text-center mt-4 border border-blue-100">
                          <p className="text-blue-700 text-sm">Không có thuốc cần uống hôm nay</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div> */}

              {/* Cuộc hẹn sắp tới */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-800 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Cuộc hẹn sắp tới
                  </h2>
                </div>

                <div className="p-5">
                  {loading ? (
                    <SimpleLoadingState />
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="text-center py-6">
                      <CalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Không có cuộc hẹn nào
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Đặt lịch hẹn ngay để được tư vấn và khám bệnh.
                      </p>
                      <div className="mt-6">
                        <Button
                          variant="primary"
                          onClick={() =>
                            navigate("/customer/appointment-selection")
                          }
                          className="w-full justify-center"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Đặt lịch hẹn
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Online Consultations */}
                      {upcomingAppointments.filter((apt) => apt.isOnline)
                        .length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center mb-3">
                            <VideoCameraIcon className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="font-medium text-green-700">
                              Tư vấn trực tuyến
                            </h3>
                          </div>

                          {upcomingAppointments
                            .filter((apt) => apt.isOnline)
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100 relative mb-4"
                              >
                                {renderAppointmentStatusBadge(appointment)}

                                <div className="flex items-start">
                                  <VideoCameraIcon className="h-10 w-10 text-green-600 p-2 bg-green-100 rounded-full" />
                                  <div className="ml-3 flex-1">
                                    <p className="font-medium text-gray-900">
                                      Tư vấn trực tuyến
                                    </p>
                                    <div className="mt-1 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <UserIcon className="h-4 w-4 mr-1" />
                                        <span>
                                          Bác sĩ: {appointment.doctorName}
                                        </span>
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        <span>
                                          {formatDate(appointment.date)}
                                        </span>
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        <span>
                                          {formatTime(appointment.date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <Button
                                    variant="primary"
                                    size="md"
                                    className="w-full justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl shadow-md"
                                    onClick={() =>
                                      navigate(
                                        `/customer/appointments/online/${appointment.id}`
                                      )
                                    }
                                  >
                                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                                    Tham gia trực tuyến
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* In-person Appointments */}
                      {upcomingAppointments.filter((apt) => !apt.isOnline)
                        .length > 0 && (
                        <div>
                          <div className="flex items-center mb-3">
                            <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="font-medium text-blue-700">
                              Khám trực tiếp
                            </h3>
                          </div>

                          {upcomingAppointments
                            .filter((apt) => !apt.isOnline)
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 relative"
                              >
                                {renderAppointmentStatusBadge(appointment)}

                                <div className="flex items-start">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <p className="font-medium text-gray-900">
                                      {appointment.type}
                                    </p>
                                    <div className="mt-1 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <UserIcon className="h-4 w-4 mr-1" />
                                        <span>
                                          Bác sĩ: {appointment.doctorName}
                                        </span>
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        <span>
                                          {formatDate(appointment.date)}
                                        </span>
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        <span>
                                          {formatTime(appointment.date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {renderAppointmentButtons(appointment)}
                              </div>
                            ))}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="md"
                          className="w-full justify-center"
                          onClick={() => navigate("/customer/appointments")}
                        >
                          Xem tất cả cuộc hẹn
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

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
    </Layout>
  );
};

export default DashboardPage;
