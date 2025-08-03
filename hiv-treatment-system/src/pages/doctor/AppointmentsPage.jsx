import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import AppointmentDetailModal from "../../components/doctor/AppointmentDetailModal";
import { Link, useNavigate } from "react-router-dom";
import doctorAppointmentService from "../../services/doctorAppointmentService";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  DocumentTextIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  XMarkIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showCancellationPopup, setShowCancellationPopup] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const navigate = useNavigate();

  // Get all appointments for doctor
  useEffect(() => {
    fetchAppointments();
  }, []);

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await doctorAppointmentService.getAllAppointments();
        if (response.success) {
          setAppointments(response.data);
          setFilteredAppointments(response.data);
          setError(null);
        } else {
        setError(response.message || "Failed to fetch appointments");
        }
      } catch (error) {
      setError(
        "Error fetching appointments: " + (error.message || "Unknown error")
      );
      console.error("Error fetching appointments:", error);
      } finally {
      setIsLoading(false);
      }
    };

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
        apt.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((apt) => {
            const date = new Date(apt.scheduledAt);
            return date.toDateString() === today.toDateString();
          });
          break;
        case "week":
          const weekFromNow = new Date(
            today.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          filtered = filtered.filter((apt) => {
            const date = new Date(apt.scheduledAt);
            return date >= today && date <= weekFromNow;
          });
          break;
        case "month":
          const monthFromNow = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
          );
          filtered = filtered.filter((apt) => {
            const date = new Date(apt.scheduledAt);
            return date >= today && date <= monthFromNow;
          });
          break;
      }
    }

    // Sort by scheduledAt
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledAt);
      const dateB = new Date(b.scheduledAt);
      return dateA - dateB;
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleComplete = (appointmentId, notes) => {
      // Get the appointment details
    const appointment = appointments.find((apt) => apt.id === appointmentId);
      
    // Modified to not handle UNDER_REVIEW differently since we're removing test results
    try {
      setIsLoading(true);
      doctorAppointmentService
        .completeAppointment(appointmentId, notes)
        .then((response) => {
      if (response.success) {
        // Update the appointments list with the completed appointment
            setAppointments((prevAppointments) =>
              prevAppointments.map((apt) =>
            apt.id === appointmentId ? response.data : apt
          )
        );
        setShowDetailModal(false);
      } else {
            setError(response.message || "Failed to complete appointment");
      }
        })
        .catch((error) => {
          setError(
            "Error completing appointment: " +
              (error.message || "Unknown error")
          );
          console.error("Error completing appointment:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      setError(
        "Error completing appointment: " + (error.message || "Unknown error")
      );
      console.error("Error completing appointment:", error);
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId, reason) => {
    try {
      // Get the appointment details
      const appointment = appointments.find((apt) => apt.id === appointmentId);
      
      // Check if appointment is checked-in
      if (appointment && appointment.status === "CHECKED_IN") {
        setError("Không thể hủy lịch hẹn sau khi bệnh nhân đã check-in.");
        return;
      }
      
      // Check if appointment is less than 1 day away
      if (appointment) {
        const appointmentDate = new Date(appointment.scheduledAt);
        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (appointmentDate - now <= oneDayInMs) {
          setError("Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ hẹn.");
          return;
        }
      }
      
      // Show cancellation popup instead of window.confirm
      if (reason) {
        // If reason is provided, proceed with cancellation
        setIsLoading(true);
        const response = await doctorAppointmentService.cancelAppointment(
          appointmentId,
          reason
        );
        
        if (response.success) {
          // Update the appointments list with the cancelled appointment
          setAppointments((prevAppointments) =>
            prevAppointments.map((apt) =>
              apt.id === appointmentId ? response.data : apt
            )
          );
      setShowDetailModal(false);
          setAppointmentToCancel(null);
          setCancellationReason("");
          setShowCancellationPopup(false);
        } else {
          setError(response.message || "Failed to cancel appointment");
        }
      } else {
        // If no reason provided, show the popup
        setAppointmentToCancel(appointment);
        setShowCancellationPopup(true);
      }
    } catch (error) {
      setError(
        "Error cancelling appointment: " + (error.message || "Unknown error")
      );
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!appointmentToCancel) return;
    await handleCancelAppointment(
      appointmentToCancel.id,
      cancellationReason || "Cancelled by doctor"
    );
  };

  const handleNoShowAppointment = async (appointmentId, notes) => {
    try {
      setIsLoading(true);
      const response = await doctorAppointmentService.markNoShow(
        appointmentId,
        notes
      );
      if (response.success) {
        // Update the appointments list with the no-show appointment
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt.id === appointmentId ? response.data : apt
          )
        );
        // Hide modal and reset selection
    setShowDetailModal(false);
        setSelectedAppointment(null);
      } else {
        setError(response.message || "Failed to mark appointment as no-show");
      }
    } catch (error) {
      setError(
        "Error marking appointment as no-show: " +
          (error.message || "Unknown error")
      );
      console.error("Error marking appointment as no-show:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInPatient = async (appointmentId) => {
    setError(
      "Bác sĩ không có quyền check-in bệnh nhân. Bệnh nhân cần tự check-in khi đến phòng khám."
    );
    // Display error for 5 seconds then clear
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const handlePutUnderReview = async (appointmentId, notes) => {
    try {
      // Get the appointment details
      const appointment = appointments.find((apt) => apt.id === appointmentId);
      
      // Check if appointment is checked-in or is an online appointment
      if (
        appointment &&
        appointment.status !== "CHECKED_IN" &&
        !appointment.isOnline
      ) {
        setError(
          "Bệnh nhân chưa check-in. Vui lòng đảm bảo bệnh nhân đã check-in trước khi tiếp nhận hồ sơ."
        );
        return;
      }
      
      setIsLoading(true);

      // Prepare notes based on appointment type
      let reviewNotes = notes || "Tiếp nhận hồ sơ bệnh nhân";
      if (appointment && appointment.isOnline) {
        reviewNotes =
          "Tiếp nhận hồ sơ bệnh nhân. Cuộc hẹn trực tuyến - không cần gửi mẫu xét nghiệm.";
      }

      const response = await doctorAppointmentService.putUnderReview(
        appointmentId,
        reviewNotes,
        appointment?.isOnline ? "N/A - Online" : null, // For online appointments, set a placeholder for blood pressure
        !appointment?.isOnline, // Only request blood sample for in-person appointments
        appointment?.symptoms
      );
      
      if (response.success) {
        // Update the appointments list with the under review appointment
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt.id === appointmentId ? response.data : apt
          )
        );
        setShowDetailModal(false);

        // If it's an online appointment, show a message about joining
        if (appointment?.isOnline) {
          setSuccess(
            "Đã tiếp nhận hồ sơ bệnh nhân. Bạn có thể tham gia cuộc tư vấn trực tuyến ngay bây giờ."
          );
        }
      } else {
        setError(response.message || "Không thể tiếp nhận hồ sơ");
      }
    } catch (error) {
      setError(
        "Lỗi khi tiếp nhận hồ sơ: " + (error.message || "Lỗi không xác định")
      );
      console.error("Error putting appointment under review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800";
      case "CHECKED_IN":
        return "bg-indigo-100 text-indigo-800";
      case "UNDER_REVIEW":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <CalendarIcon className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "CANCELLED":
        return <TrashIcon className="h-4 w-4" />;
      case "NO_SHOW":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "CHECKED_IN":
        return <UserCircleIcon className="h-4 w-4" />;
      case "UNDER_REVIEW":
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã lên lịch";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "NO_SHOW":
        return "Không đến";
      case "CHECKED_IN":
        return "Đã check-in";
      case "UNDER_REVIEW":
        return "Đang tiếp nhận hồ sơ";
      default:
        return status;
    }
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count appointments by status
  const countByStatus = (status) => {
    return appointments.filter((apt) => apt.status === status).length;
  };

  // Count today's appointments
  const countTodayAppointments = () => {
                      const today = new Date().toDateString();
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledAt).toDateString();
      return aptDate === today && apt.status === "CONFIRMED";
    }).length;
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    if (!appointment) return false;
    
    // Cannot cancel if checked in
    if (appointment.status === "CHECKED_IN") {
      return false;
    }
    
    // Cannot cancel if less than 1 day away
    const appointmentDate = new Date(appointment.scheduledAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return appointmentDate - now > oneDayInMs;
  };

  // Group appointments by date
  const groupAppointmentsByDate = () => {
    const groups = {};
    
    filteredAppointments.forEach((appointment) => {
      const date = new Date(appointment.scheduledAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
    });
    
    return groups;
  };

  // Render appointments in calendar view
  const renderCalendarView = () => {
    const groupedAppointments = groupAppointmentsByDate();
    
    if (Object.keys(groupedAppointments).length === 0) {
  return (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center animate-fade-in">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có lịch hẹn
          </h3>
          <p className="text-gray-500">
            Không tìm thấy lịch hẹn phù hợp với tiêu chí tìm kiếm
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8 animate-fade-in">
        {Object.entries(groupedAppointments).map(
          ([date, dayAppointments], index) => (
          <div 
            key={date} 
            className={`bg-white rounded-lg shadow-sm overflow-hidden animate-slideUp`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-100">
              <h3 className="text-lg font-medium text-gray-900">
                  {new Date(date).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </h3>
                <p className="text-sm text-gray-500">
                  {dayAppointments.length} cuộc hẹn
                </p>
          </div>
                          
            <div className="divide-y divide-gray-100">
              {dayAppointments.map((appointment, i) => (
                <div 
                  key={appointment.id} 
                  className="p-4 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                  onClick={() => handleViewAppointment(appointment)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                          </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                          {appointment.userName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                          {appointment.serviceName || "General appointment"}
                            </p>
                          </div>

              <div className="flex items-center">
                      <div className="text-sm text-gray-500 mr-4">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {formatTime(appointment.scheduledAt)}
                          </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                        {getStatusIcon(appointment.status)}
                        <span>{getStatusText(appointment.status)}</span>
                      </span>
                          </div>
                        </div>

                  <Button
                    variant="text"
                    size="sm"
                    icon={<EyeIcon className="h-4 w-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAppointment(appointment);
                    }}
                  >
                    Chi tiết
                  </Button>
                        </div>
              ))}
                              </div>
                              </div>
          )
        )}
                              </div>
    );
  };
  
  // Render appointments in list view
  const renderListView = () => {
    if (filteredAppointments.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center animate-fade-in">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có lịch hẹn
          </h3>
          <p className="text-gray-500">
            Không tìm thấy lịch hẹn phù hợp với tiêu chí tìm kiếm
          </p>
                            </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                      Bệnh nhân
                    </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                      Thời gian
                    </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                      Trạng thái
                    </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment, index) => (
                <tr 
                  key={appointment.id} 
                  className="hover:bg-gray-50 transition-colors duration-200 animate-fadeIn cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleViewAppointment(appointment)}
                >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                        <UserIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                          {appointment.isAnonymous
                            ? "Bệnh nhân ẩn danh"
                            : appointment.userName || "N/A"}
                      </div>
                            <div className="text-sm text-gray-500">
                          {appointment.isAnonymous
                            ? "email-ẩn-danh@example.com"
                            : appointment.userEmail || "N/A"}
                      </div>
                    </div>
                  </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                          {formatDate(appointment.scheduledAt)}
              </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                          {formatTime(appointment.scheduledAt)}
          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusIcon(appointment.status)}
                      <span>{getStatusText(appointment.status)}</span>
                        </span>
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                    <div className="text-sm text-gray-900 truncate">
                      {appointment.symptoms || "Không có triệu chứng"}
                              </div>
                    <div className="text-sm text-gray-500 truncate">
                      {appointment.notes || "Không có ghi chú"}
                              </div>
                    {appointment.isOnline && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <VideoCameraIcon className="h-3 w-3 mr-1" />
                          Trực tuyến
                        </span>
      </div>
                    )}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
        </div>
      </div>
    );
  };

  return (
    <Layout currentRole={UserRole.DOCTOR} pageTitle="Quản lý lịch hẹn">
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in"
            role="alert"
          >
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            icon={<CalendarIcon className="h-5 w-5" />}
            title="Hôm nay"
            className="stats-card animate-fade-in"
          >
            <div className="p-4">
              <p className="text-2xl font-semibold text-gray-900">
                {countTodayAppointments()}
              </p>
              <div className="h-1 w-full bg-blue-100 rounded-full mt-2">
                <div
                  className="h-1 rounded-full bg-blue-500 animate-progress"
                  style={{
                    width: `${
                      (countTodayAppointments() /
                        Math.max(1, appointments.length)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </Card>

          <Card 
            icon={<CheckCircleIcon className="h-5 w-5" />}
            title="Đã hoàn thành"
            className="stats-card animate-fade-in stagger-1"
          >
            <div className="p-4">
              <p className="text-2xl font-semibold text-gray-900">
                {countByStatus("COMPLETED")}
              </p>
              <div className="h-1 w-full bg-green-100 rounded-full mt-2">
                <div
                  className="h-1 rounded-full bg-green-500 animate-progress"
                  style={{
                    width: `${
                      (countByStatus("COMPLETED") /
                        Math.max(1, appointments.length)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </Card>

          <Card 
            icon={<UserCircleIcon className="h-5 w-5" />}
            title="Đã check-in"
            className="stats-card animate-fade-in stagger-2"
          >
            <div className="p-4">
              <p className="text-2xl font-semibold text-gray-900">
                {countByStatus("CHECKED_IN")}
              </p>
              <div className="h-1 w-full bg-indigo-100 rounded-full mt-2">
                <div
                  className="h-1 rounded-full bg-indigo-500 animate-progress"
                  style={{
                    width: `${
                      (countByStatus("CHECKED_IN") /
                        Math.max(1, appointments.length)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </Card>

          <Card 
            icon={<ExclamationTriangleIcon className="h-5 w-5" />}
            title="Đã hủy"
            className="stats-card animate-fade-in stagger-3"
          >
            <div className="p-4">
              <p className="text-2xl font-semibold text-gray-900">
                {countByStatus("CANCELLED")}
              </p>
              <div className="h-1 w-full bg-red-100 rounded-full mt-2">
                <div
                  className="h-1 rounded-full bg-red-500 animate-progress"
                  style={{
                    width: `${
                      (countByStatus("CANCELLED") /
                        Math.max(1, appointments.length)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </Card>
                  </div>

        {/* View toggle and search bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in stagger-1">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            {/* View toggle buttons */}
            <div className="flex space-x-2">
              <button
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setViewMode("list")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Danh sách
              </button>
              <button
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  viewMode === "calendar"
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="h-5 w-5 mr-1" />
                Lịch
              </button>
                </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowPathIcon className="h-4 w-4" />}
                onClick={fetchAppointments}
                className="whitespace-nowrap"
              >
                Làm mới
              </Button>

              <div className="relative flex-1 md:max-w-[300px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                  <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 text-sm"
                  placeholder="Tìm kiếm bệnh nhân..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

              <Button
                variant="outline"
                size="sm"
                icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="whitespace-nowrap"
              >
                Bộ lọc
              </Button>
            </div>
                  </div>

          {/* Expandable filter section */}
          {isFilterExpanded && (
            <div className="mt-4 pt-4 border-t animate-slideUp">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="CONFIRMED">Đã lên lịch</option>
                    <option value="CHECKED_IN">Đã check-in</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="NO_SHOW">Không đến</option>
                  </select>
                </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian
                  </label>
                    <select
                    className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 text-sm"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">Trong tuần</option>
                    <option value="month">Trong tháng</option>
                    </select>
                  </div>
              </div>
              </div>
            )}
              </div>

        {/* Appointments List or Calendar View */}
        {isLoading ? (
          <div className="animate-fadeIn flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-10">
            <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Đang tải lịch hẹn...</p>
          </div>
        ) : viewMode === "list" ? (
          renderListView()
        ) : (
          renderCalendarView()
        )}
                  </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
          />
        )}

      {/* Cancellation Confirmation Popup */}
      {showCancellationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Nhập lý do hủy lịch hẹn
            </h2>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Nhập lý do hủy lịch hẹn..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancellationPopup(false)}
              >
                Hủy
                  </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancellation}
              >
                Xác nhận
                  </Button>
                </div>
            </div>
          </div>
      )}
    </Layout>
  );
};

export default AppointmentsPage; 
