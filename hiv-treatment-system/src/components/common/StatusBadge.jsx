import React from "react";

/**
 * Status badge component for displaying status indicators
 *
 * @param {string} status - Status value to display
 * @param {string} size - Size of the badge (sm, md, lg)
 * @param {boolean} withDot - Whether to show a colored dot
 * @param {string} className - Additional CSS classes
 */
const StatusBadge = ({
  status,
  size = "md",
  withDot = true,
  className = "",
}) => {
  // Map status to color and text
  const statusConfig = {
    // Appointment statuses
    CONFIRMED: { color: "blue", text: "Đã lên lịch" },
    CHECKED_IN: { color: "indigo", text: "Đã check-in" },
    COMPLETED: { color: "green", text: "Hoàn thành" },
    CANCELLED: { color: "red", text: "Đã hủy" },
    NO_SHOW: { color: "gray", text: "Không đến" },
    PENDING: { color: "yellow", text: "Chờ xác nhận" },

    // Treatment plan statuses
    ACTIVE: { color: "green", text: "Đang điều trị" },
    INACTIVE: { color: "gray", text: "Tạm dừng" },
    COMPLETED_PLAN: { color: "blue", text: "Hoàn thành" },

    // Generic statuses
    success: { color: "green", text: "Thành công" },
    warning: { color: "yellow", text: "Cảnh báo" },
    error: { color: "red", text: "Lỗi" },
    info: { color: "blue", text: "Thông tin" },
  };

  // Get status config or use defaults
  const config = statusConfig[status] || { color: "gray", text: status };

  // Map size prop to tailwind classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  // Map color to tailwind classes
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    indigo: "bg-indigo-100 text-indigo-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[config.color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${colorClass} ${className}`}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 mr-1.5 rounded-full bg-${config.color}-500`}
        ></span>
      )}
      {config.text}
    </span>
  );
};

export default StatusBadge;
