import React from "react";
import Button from "../common/Button";
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserCircleIcon,
  VideoCameraIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const AppointmentDetailModal = ({ appointment, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !appointment) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CHECKED_IN":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "UNDER_REVIEW":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã lên lịch";
      case "CHECKED_IN":
        return "Đã check-in";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "NO_SHOW":
        return "Không đến";
      case "PENDING":
        return "Chờ xác nhận";
      case "UNDER_REVIEW":
        return "Đang tiếp nhận";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <CalendarIcon className="h-4 w-4" />;
      case "CHECKED_IN":
        return <UserCircleIcon className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "CANCELLED":
        return <XMarkIcon className="h-4 w-4" />;
      case "NO_SHOW":
        return <XMarkIcon className="h-4 w-4" />;
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />;
      case "UNDER_REVIEW":
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const handleJoinOnlineAppointment = async () => {
    try {
      navigate(`/doctor/appointments/online/${appointment.id}`);
    } catch (error) {
      console.error("Error navigating to online consultation:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Chi tiết lịch hẹn
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Đóng</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 pt-5 pb-6 bg-white">
              <div className="flex flex-col space-y-5">
                {/* Patient info header */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-sm border border-blue-100 animate-fade-in">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                      <UserIcon className="h-8 w-8" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div>
                          <h4 className="text-xl font-medium text-gray-900">
                            {appointment.isAnonymous
                              ? "Bệnh nhân ẩn danh"
                              : appointment.userName || "N/A"}
                          </h4>
                          <p className="text-gray-500">
                            {appointment.isAnonymous
                              ? "email-ẩn-danh@example.com"
                              : appointment.userEmail || "N/A"}
                          </p>
                        </div>

                        <div className="mt-2 md:mt-0 flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 border rounded-full text-sm font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(appointment.scheduledAt)}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span>{formatTime(appointment.scheduledAt)}</span>
                        </div>

                        {appointment.serviceName && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                            <span>{appointment.serviceName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical info section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in stagger-1">
                  {appointment.symptoms && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-amber-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Triệu chứng
                      </h5>
                      <p className="text-gray-700 bg-amber-50 p-3 rounded-lg text-sm">
                        {appointment.symptoms}
                      </p>
                    </div>
                  )}

                  {appointment.medicalHistory && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Tiền sử bệnh
                      </h5>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">
                        {appointment.medicalHistory}
                      </p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Ghi chú
                      </h5>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Location info for in-person appointments */}
                  {!appointment.isOnline && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1 text-red-500" />
                        Địa điểm
                      </h5>
                      <p className="text-gray-700 bg-red-50 p-3 rounded-lg text-sm">
                        Phòng khám HIV, Tầng 2, Khu A, Bệnh viện Đa khoa Trung
                        ương
                      </p>
                    </div>
                  )}

                  {/* Online appointment info */}
                  {appointment.isOnline && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                        <VideoCameraIcon className="h-4 w-4 mr-1 text-green-500" />
                        Thông tin tư vấn trực tuyến
                      </h5>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-700">
                          Đây là cuộc tư vấn trực tuyến. Bạn có thể tham gia vào
                          thời gian đã hẹn.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Appointment status specific content */}
                {appointment.status === "COMPLETED" && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 animate-fade-in stagger-2">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                      Thông tin hoàn thành
                    </h4>
                    <p className="text-green-700 bg-white/50 p-3 rounded-lg">
                      {appointment.notes || "Không có ghi chú về kết quả khám"}
                    </p>
                  </div>
                )}

                {appointment.status === "CANCELLED" && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 animate-fade-in stagger-2">
                    <h4 className="font-medium text-red-800 mb-3 flex items-center">
                      <XMarkIcon className="h-5 w-5 mr-2 text-red-600" />
                      Thông tin hủy lịch
                    </h4>
                    <p className="text-red-700 bg-white/50 p-3 rounded-lg">
                      Lý do:{" "}
                      {appointment.cancellationReason || "Không có lý do"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              {appointment.isOnline &&
                (appointment.status === "CONFIRMED" ||
                  appointment.status === "UNDER_REVIEW") && (
                  <Button
                    onClick={handleJoinOnlineAppointment}
                    variant="primary"
                    className="mr-2 bg-green-600 hover:bg-green-700 transition-all duration-300"
                    icon={<VideoCameraIcon className="h-5 w-5 mr-1" />}
                  >
                    Tham gia tư vấn trực tuyến
                  </Button>
                )}
              <Button
                onClick={onClose}
                variant="outline"
                className="hover:bg-blue-50 transition-all duration-300"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
