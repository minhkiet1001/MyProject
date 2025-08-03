import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

const AppointmentSyncIndicator = ({
  appointmentId,
  userRole,
  showDetails = false,
  className = "",
}) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking sync status
    const checkSyncStatus = async () => {
      setIsLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        setSyncStatus({
          appointmentId,
          status: "synced",
          lastSyncAt: new Date().toISOString(),
          syncDetails: {
            patientRecords: "synced",
            staffSystem: "synced",
            notifications: "synced",
            followUpCreated: "synced",
            medicationRecords: "synced",
          },
          updates: [
            {
              type: "appointment_completed",
              message: "Kết quả khám bệnh đã được cập nhật",
              timestamp: new Date().toISOString(),
            },
            {
              type: "follow_up_scheduled",
              message: "Lịch tái khám đã được đặt",
              timestamp: new Date().toISOString(),
            },
            {
              type: "medication_prescribed",
              message: "Đơn thuốc mới đã được kê",
              timestamp: new Date().toISOString(),
            },
          ],
        });
        setIsLoading(false);
      }, 1000);
    };

    if (appointmentId) {
      checkSyncStatus();
    }
  }, [appointmentId]);

  const getSyncStatusIcon = (status) => {
    switch (status) {
      case "synced":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "syncing":
        return <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />;
      case "failed":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSyncStatusText = (status) => {
    switch (status) {
      case "synced":
        return "Đã đồng bộ";
      case "syncing":
        return "Đang đồng bộ";
      case "failed":
        return "Lỗi đồng bộ";
      case "pending":
        return "Chờ đồng bộ";
      default:
        return "Không xác định";
    }
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case "synced":
        return "text-green-600 bg-green-50 border-green-200";
      case "syncing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case "appointment_completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case "follow_up_scheduled":
        return <CalendarIcon className="h-4 w-4 text-blue-600" />;
      case "medication_prescribed":
        return <BeakerIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <ArrowPathIcon className="h-4 w-4 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-500">
          Đang kiểm tra trạng thái...
        </span>
      </div>
    );
  }

  if (!syncStatus) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Basic Sync Status */}
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getSyncStatusColor(
          syncStatus.status
        )}`}
      >
        {getSyncStatusIcon(syncStatus.status)}
        <span className="font-medium">
          {getSyncStatusText(syncStatus.status)}
        </span>
        {syncStatus.lastSyncAt && (
          <span className="text-xs opacity-75">
            {new Date(syncStatus.lastSyncAt).toLocaleTimeString("vi-VN")}
          </span>
        )}
      </div>

      {/* Detailed Information for Patients and Staff */}
      {showDetails && syncStatus.status === "synced" && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {userRole === "patient"
              ? "Thông tin đã được cập nhật:"
              : "Chi tiết đồng bộ:"}
          </h4>

          <div className="space-y-2">
            {syncStatus.updates.map((update, index) => (
              <div key={index} className="flex items-start space-x-2">
                {getUpdateIcon(update.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{update.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(update.timestamp).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Role-specific information */}
          {userRole === "patient" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Lưu ý:</strong> Bạn có thể xem chi tiết kết quả khám
                và đơn thuốc trong mục "Lịch sử khám bệnh". Nếu có lịch tái
                khám, hệ thống sẽ gửi nhắc nhở trước ngày hẹn.
              </p>
            </div>
          )}

          {userRole === "staff" && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ <strong>Hoàn thành:</strong> Tất cả dữ liệu đã được đồng bộ
                thành công. Bệnh nhân và các hệ thống liên quan đã được cập
                nhật.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Details */}
      {syncStatus.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            Có lỗi xảy ra khi đồng bộ dữ liệu. Vui lòng liên hệ bộ phận kỹ thuật
            hoặc thử lại sau.
          </p>
          <button className="mt-2 text-xs text-red-600 hover:text-red-800 underline">
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentSyncIndicator;
