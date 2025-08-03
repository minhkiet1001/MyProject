import React from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";

const UnauthorizedPage = () => {
  const userRole = authService.getUserRole();

  // Determine where to redirect the user based on their role
  const getRedirectPath = () => {
    switch (userRole) {
      case "DOCTOR":
        return "/doctor/dashboard";
      case "STAFF":
        return "/staff/dashboard";
      case "MANAGER":
        return "/manager/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      case "CUSTOMER":
        return "/customer/dashboard";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 mb-6">
          <svg
            className="h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Không đủ quyền truy cập
        </h1>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
          viên nếu bạn cảm thấy đây là sự cố.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to={getRedirectPath()}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Về trang chủ
          </Link>
          <Link
            to="/"
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Về trang chính
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
