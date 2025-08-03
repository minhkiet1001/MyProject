import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { UserRole } from "../types/index.js";
import Button from "../components/common/Button";

const NotFoundPage = () => {
  return (
    <Layout currentRole={UserRole.GUEST}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-9xl font-bold text-primary-600">404</h1>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Trang không tồn tại
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Link to="/">
              <Button variant="primary" className="w-full">
                Về trang chủ
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="w-full">
                Liên hệ hỗ trợ
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Các trang phổ biến
              </h3>
              <div className="space-y-2">
                <Link
                  to="/about"
                  className="block text-primary-600 hover:text-primary-800"
                >
                  Giới thiệu
                </Link>
                <Link
                  to="/services"
                  className="block text-primary-600 hover:text-primary-800"
                >
                  Dịch vụ
                </Link>
                <Link
                  to="/resources"
                  className="block text-primary-600 hover:text-primary-800"
                >
                  Tài liệu giáo dục
                </Link>
                <Link
                  to="/login"
                  className="block text-primary-600 hover:text-primary-800"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
