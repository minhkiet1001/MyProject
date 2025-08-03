import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Disclosure,
  Menu,
  Transition,
  Popover,
  Dialog,
} from "@headlessui/react";
import authService from "../../services/authService";
import notificationService from "../../services/notificationService";
import {
  BellIcon,
  Bars3Icon,
  UserIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon,
  XMarkIcon,
  ChevronDownIcon,
  HeartIcon,
  BeakerIcon,
  BookOpenIcon,
  UserGroupIcon,
  Cog6ToothIcon as CogIcon,
  ChartBarIcon,
  ServerIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { UserRole } from "../../types/index.js";
import ProfileModal from "../common/ProfileModal";

// Services Nav Item with dropdown
const ServicesNavItem = ({ item, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex items-center px-3 py-2 rounded-md transition-colors duration-150 ease-in-out text-sm font-medium ${
              isActive
                ? "text-primary-600 bg-primary-50"
                : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            }`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
          >
            {item.icon && (
              <item.icon
                className="h-4 w-4 mr-1.5 flex-shrink-0"
                aria-hidden="true"
              />
            )}
            <span>{item.name}</span>
            <ChevronDownIcon
              className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </Popover.Button>
          <Transition
            show={isOpen}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <Popover.Panel
              className="absolute z-50 mt-1 w-80 rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-10 border border-gray-200 focus:outline-none"
              style={{
                zIndex: 9999,
                position: "absolute",
                top: "100%",
                left: "0",
                transform: "translateY(0)",
              }}
            >
              <div className="py-3">
                {item.submenu &&
                  item.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      className="flex items-center px-5 py-4 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      {subItem.icon && (
                        <div className="p-2 bg-gray-100 rounded-lg mr-4 group-hover:bg-primary-100 transition-colors duration-200">
                          <subItem.icon
                            className="h-5 w-5 text-gray-500 group-hover:text-primary-600"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-primary-700">
                          {subItem.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 group-hover:text-primary-600">
                          {subItem.name === "Lịch hẹn" &&
                            "Đặt lịch và quản lý cuộc hẹn với bác sĩ"}
                          {subItem.name === "Tra cứu thông tin xét nghiệm" &&
                            "Xem kết quả và theo dõi tiến triển điều trị"}
                          {subItem.name === "Thuốc điều trị" &&
                            "Quản lý thuốc ARV và lịch uống thuốc"}
                        </div>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 rotate-[-90deg] group-hover:text-primary-500" />
                    </Link>
                  ))}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                <p className="text-xs text-gray-600 text-center">
                  💡 Tip: Sử dụng các dịch vụ để theo dõi sức khỏe hiệu quả
                </p>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

const Navbar = ({ currentRole, userName = "", hasNotifications = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  // Get current user from authService
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Load notifications
  useEffect(() => {
    if (authService.isAuthenticated() && currentRole !== UserRole.GUEST) {
      fetchNotifications();
      fetchUnreadCount();

      // Set up polling to check for new notifications
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [currentRole]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getUnreadNotifications();
      if (response && response.success) {
        // Transform the API data
        const transformedNotifications = response.data.map((notification) => ({
          id: notification.id.toString(),
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.createdAt),
          read: notification.read,
          type: notification.type.toLowerCase(),
          referenceId: notification.referenceId,
          referenceType: notification.referenceType,
        }));
        setNotifications(transformedNotifications);
        setNotificationsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response && response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
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

    return date.toLocaleDateString("vi-VN");
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Clear any component state
      setCurrentUser(null);
      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigate to login even if there's an error
      navigate("/login", { replace: true });
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response && response.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response && response.success) {
        setNotifications(
          notifications.map((notification) => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "CUSTOMER":
        return "Bệnh nhân";
      case "DOCTOR":
        return "Bác sĩ";
      case "STAFF":
        return "Nhân viên";
      case "MANAGER":
        return "Quản lý";
      case "ADMIN":
        return "Quản trị viên";
      default:
        return role;
    }
  };

  // Get home link based on role
  const getHomeLink = (role) => {
    switch (role) {
      case UserRole.CUSTOMER:
        return "/customer/dashboard";
      case UserRole.STAFF:
        return "/staff/dashboard";
      case UserRole.DOCTOR:
        return "/doctor/dashboard";
      case UserRole.MANAGER:
        return "/manager/dashboard";
      case UserRole.ADMIN:
        return "/admin/dashboard";
      case UserRole.GUEST:
      default:
        return "/";
    }
  };

  const homeLink = getHomeLink(currentRole);

  // Menu items for each user role
  const getMenuByRole = (role) => {
    switch (role) {
      case UserRole.CUSTOMER:
        return [
          {
            name: "Trang chủ",
            href: "/customer/dashboard",
            icon: HomeIcon,
          },
          {
            name: "Đặt lịch hẹn",
            href: "/customer/appointment-selection",
            icon: CalendarIcon,
          },
          {
            name: "Tra cứu thông tin xét nghiệm",
            href: "/customer/test-results",
            icon: BeakerIcon,
          },
          {
            name: "Lịch uống thuốc",
            href: "/customer/medications",
            icon: ClipboardDocumentListIcon,
          },
          {
            name: "Hóa đơn",
            href: "/customer/invoices",
            icon: DocumentDuplicateIcon,
          },
          {
            name: "Tài liệu giáo dục",
            href: "/customer/resources",
            icon: BookOpenIcon,
          },
        ];
      case UserRole.STAFF:
        return [
          {
            name: "Trang chủ",
            href: "/staff/dashboard",
            icon: HomeIcon,
          },
          {
            name: "Lịch hẹn",
            href: "/staff/appointment",
            icon: CalendarIcon, // hoặc chọn icon phù hợp khác
          },
          {
            name: "Yêu cầu xét nghiệm",
            href: "/staff/lab-requests",
            icon: BeakerIcon,
          },
        ];
      case UserRole.DOCTOR:
        return [
          {
            name: "Trang Chủ",
            href: "/doctor/dashboard",
            icon: HomeIcon,
          },
          {
            name: "Bệnh nhân",
            href: "/doctor/patients",
            icon: UserIcon,
          },
          {
            name: "Lịch hẹn",
            href: "/doctor/appointments",
            icon: CalendarIcon,
          },
          {
            name: "Lịch làm việc",
            href: "/doctor/calendar",
            icon: ClipboardDocumentListIcon,
          },
          {
            name: "Kế hoạch điều trị",
            href: "/doctor/treatment-plans",
            icon: ClipboardDocumentListIcon,
          },
        ];
      case UserRole.MANAGER:
        return [
          {
            name: "Trang chủ",
            href: "/manager/dashboard",
            icon: HomeIcon,
          },
          {
            name: "Quản lý bác sĩ",
            href: "/manager/doctors",
            icon: AcademicCapIcon,
          },
          {
            name: "Lịch làm việc",
            href: "/manager/doctor-schedule",
            icon: CalendarIcon,
          },
        ];
      case UserRole.ADMIN:
        return [
          {
            name: "Trang chủ",
            href: "/admin/dashboard",
            icon: HomeIcon,
          },
          {
            name: "Quản lý tài khoản",
            href: "/admin/users",
            icon: UsersIcon,
          },
      
        ];
      case UserRole.GUEST:
      default:
        return [
          {
            name: "Trang chủ",
            href: "/",
            icon: HomeIcon,
          },
          {
            name: "Giới thiệu",
            href: "/about",
            icon: DocumentTextIcon,
          },
          {
            name: "Đội ngũ bác sĩ",
            href: "/doctors",
            icon: UserGroupIcon,
          },
          {
            name: "Lịch khám",
            href: "/schedule",
            icon: CalendarIcon,
          },
          {
            name: "Dịch vụ",
            href: "/services",
            icon: HeartIcon,
          },
          {
            name: "Tài liệu giáo dục",
            href: "/resources",
            icon: BookOpenIcon,
          },
        ];
    }
  };

  // Get current role's menu
  const currentMenu = getMenuByRole(currentRole || UserRole.GUEST);

  // Check if the route is active
  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // User dropdown menu items
  const getUserMenuItems = (role) => {
    const getProfileHref = (role) => {
      switch (role) {
        case UserRole.CUSTOMER:
          return "/customer/profile";
        case UserRole.STAFF:
          return "/staff/profile";
        case UserRole.DOCTOR:
          return "/doctor/profile";
        case UserRole.MANAGER:
          return "/manager/profile";
        case UserRole.ADMIN:
          return "/admin/profile";
        default:
          return "/profile";
      }
    };

    const menuItems = [
      { name: "Hồ sơ cá nhân", href: getProfileHref(role) },
      { name: "Thông báo", href: "/notifications" },
      { name: "Đăng xuất", href: "/login" },
    ];

    return menuItems;
  };

  const userMenuItems = getUserMenuItems(currentRole);

  return (
    <header className="bg-white shadow-sm">
      <nav
        className="mx-auto max-w-[1400px] flex items-center justify-between p-2 lg:px-4"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-none lg:w-[280px] lg:max-w-[280px] lg:overflow-hidden">
          <Link to={homeLink} className="-m-1.5 p-1.5 flex items-center">
            <HeartIcon
              className="h-6 w-6 text-primary-600 mr-1 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-primary-600 whitespace-nowrap truncate">
              Hệ Thống Y Tế Và Điều Trị HIV
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Mở menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation - fixed flex-grow to ensure proper spacing */}
        <div className="hidden lg:flex lg:gap-x-0.5 lg:items-center lg:flex-grow lg:justify-center lg:ml-4">
          {currentMenu.map((item) =>
            item.submenu ? (
              <ServicesNavItem
                key={item.name}
                item={item}
                isActive={item.submenu.some((subItem) =>
                  isActiveRoute(subItem.href)
                )}
              />
            ) : (
              <Link
                key={item.name}
                to={item.href}
                className={`text-xs font-medium leading-6 flex items-center px-2 py-1.5 rounded-md transition-colors duration-150 ease-in-out ${
                  isActiveRoute(item.href)
                    ? "text-white bg-primary-600"
                    : "text-gray-700 hover:text-white hover:bg-primary-600"
                }`}
                aria-current={isActiveRoute(item.href) ? "page" : undefined}
              >
                {item.icon && (
                  <item.icon
                    className={`h-4 w-4 mr-1 flex-shrink-0 ${
                      isActiveRoute(item.href)
                        ? "text-white"
                        : "text-gray-500 group-hover:text-white"
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span>{item.name}</span>
              </Link>
            )
          )}
        </div>

        {/* User area */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-1 lg:ml-2 lg:min-w-[160px] lg:justify-end">
          {currentRole === UserRole.GUEST ? (
            <Link
              to="/login"
              className="text-xs font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors duration-150 ease-in-out flex items-center px-2 py-1"
            >
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <div className="flex items-center gap-x-2">
              {/* Notifications */}
              <Menu as="div" className="relative">
                <Menu.Button className="relative text-gray-600 hover:text-primary-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150">
                  <BellIcon className="h-5 w-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none pointer-events-auto">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Thông báo
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            <span>Đánh dấu tất cả đã đọc</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <div
                                className={`px-4 py-3 ${
                                  active ? "bg-gray-50" : ""
                                } ${!notification.read ? "bg-primary-50" : ""}`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    <span>{notification.title}</span>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    <span>{notification.time}</span>
                                  </p>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  <span>{notification.message}</span>
                                </p>
                              </div>
                            )}
                          </Menu.Item>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          <span>Không có thông báo mới</span>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <Link
                        to="/notifications"
                        className="text-xs text-primary-600 hover:text-primary-800"
                      >
                        <span>Xem tất cả thông báo</span>
                      </Link>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* User dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 text-left hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors duration-200 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {currentUser?.name?.charAt(0).toUpperCase() ||
                        userName?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.name || userName || "Người dùng"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser
                        ? getRoleDisplayName(currentUser.role)
                        : "Khách"}{" "}
                      • ID: {currentUser?.id || "N/A"}
                    </p>
                  </div>
                  <ChevronDownIcon
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-50 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 focus:outline-none pointer-events-auto">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {currentUser?.name?.charAt(0).toUpperCase() ||
                              userName?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {currentUser?.name || userName || "Người dùng"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {currentUser?.email || "email@example.com"}
                          </p>
                          <p className="text-xs text-primary-600 font-medium">
                            {currentUser
                              ? getRoleDisplayName(currentUser.role)
                              : "Khách"}{" "}
                            • ID: {currentUser?.id || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(true)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              active
                                ? "bg-gray-100 text-primary-600"
                                : "text-gray-700"
                            } transition-colors duration-200 cursor-pointer z-50`}
                          >
                            <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Thông tin cá nhân
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/notifications"
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              active
                                ? "bg-gray-100 text-primary-600"
                                : "text-gray-700"
                            } transition-colors duration-200 cursor-pointer z-50`}
                          >
                            <BellIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Thông báo
                          </Link>
                        )}
                      </Menu.Item>

                      <div className="border-t border-gray-100 my-1"></div>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              active ? "bg-red-50 text-red-600" : "text-red-600"
                            } transition-colors duration-200 cursor-pointer z-50`}
                          >
                            <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                            Đăng xuất
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}
        </div>
      </nav>

      {/* Render ProfileModal */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            console.log("Closing profile modal");
            setIsProfileModalOpen(false);
          }}
        />
      )}

      {/* Mobile menu */}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        id="mobile-menu"
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link
              to={homeLink}
              className="-m-1.5 p-1.5 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <HeartIcon
                className="h-6 w-6 text-primary-600 mr-2"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-primary-600">
                Hệ Thống Dịch Vụ Y Tế Và Điều Trị HIV
              </span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Đóng menu"
            >
              <span className="sr-only">Đóng menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {currentMenu.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <div
                        className={`-mx-3 flex items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                          item.submenu.some((subItem) =>
                            isActiveRoute(subItem.href)
                          )
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-900"
                        }`}
                      >
                        {item.icon && (
                          <item.icon
                            className="h-6 w-6 mr-3 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`-mx-3 flex items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                          isActiveRoute(item.href)
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon && (
                          <item.icon
                            className="h-6 w-6 mr-3 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.name}</span>
                      </Link>
                    )}
                    {item.submenu && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md ${
                              isActiveRoute(subItem.href)
                                ? "text-primary-600 bg-primary-50 font-medium"
                                : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.icon && (
                              <subItem.icon
                                className="h-4 w-4 mr-2 flex-shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {currentRole !== UserRole.GUEST && (
                <div className="py-6">
                  {/* Profile Button */}
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 w-full text-left"
                  >
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  {/* Other Menu Items */}
                  <Link
                    to="/notifications"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Thông báo</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}

              {currentRole === UserRole.GUEST && (
                <div className="py-6">
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Đăng ký</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default Navbar;
