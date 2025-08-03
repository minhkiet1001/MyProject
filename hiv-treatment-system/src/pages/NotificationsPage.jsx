import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { UserRole } from "../types/index.js";
import notificationService from "../services/notificationService";
import authService from "../services/authService";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate("/login", {
        state: {
          from: "/notifications",
          message: "Bạn cần đăng nhập để xem thông báo",
        },
      });
      return;
    }

    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getAllNotifications();
      if (response.success) {
        // Transform API data to match component expectations
        const transformedNotifications = response.data.map(notification => ({
          id: notification.id.toString(),
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.createdAt),
          read: notification.read,
          type: notification.type.toLowerCase(),
          referenceId: notification.referenceId,
          referenceType: notification.referenceType
        }));
        setNotifications(transformedNotifications);
      } else {
        console.error("Error fetching notifications:", response.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time ago helper function
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs} giây trước`;
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  // Filter notifications based on selection
  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((notification) => !notification.read)
      : notifications.filter((notification) => notification.type === filter);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(
          notifications.map((notification) => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        setNotifications(
          notifications.filter((notification) => notification.id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and reference
    if (notification.type === "appointment" && notification.referenceId) {
      navigate(`/customer/appointments`);
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "test":
        return "bg-green-100 text-green-800";
      case "medication":
        return "bg-yellow-100 text-yellow-800";
      case "system":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get type translation
  const getTypeText = (type) => {
    switch (type) {
      case "appointment":
        return "lịch hẹn";
      case "test":
        return "xét nghiệm";
      case "medication":
        return "thuốc";
      case "system":
        return "hệ thống";
      default:
        return type;
    }
  };

  // Get current user info
  const currentUser = authService.getCurrentUser() || { name: "Người dùng" };

  return (
    <Layout
      currentRole={UserRole.CUSTOMER}
      userName={currentUser.name}
      hasNotifications={notifications.some(n => !n.read)}
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            <div className="flex items-center space-x-4">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tất cả thông báo</option>
                <option value="unread">Chưa đọc</option>
                <option value="appointment">Lịch hẹn</option>
                <option value="test">Kết quả xét nghiệm</option>
                <option value="medication">Thuốc</option>
                <option value="system">Hệ thống</option>
              </select>
              {notifications.some((notification) => !notification.read) && (
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                  onClick={markAllAsRead}
                >
                  Đánh dấu tất cả là đã đọc
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500">
                <span className="sr-only">Đang tải...</span>
              </div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-200 last:border-b-0 ${
                    notification.read ? "bg-white" : "bg-indigo-50"
                  } hover:bg-gray-50 cursor-pointer`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Mới
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                              notification.type
                            )}`}
                          >
                            {getTypeText(notification.type)}
                          </span>
                          <span className="ml-2">{notification.time}</span>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        {!notification.read && (
                          <button
                            className="mr-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-md">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Không có thông báo nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tất cả các thông báo của bạn sẽ hiển thị ở đây.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;