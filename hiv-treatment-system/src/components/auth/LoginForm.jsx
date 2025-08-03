import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik"; 
import * as Yup from "yup";
import authService from "../../services/authService";

/**
 * Schema validation cho form đăng nhập sử dụng Yup
 * - Kiểm tra email hợp lệ và bắt buộc nhập
 * - Kiểm tra password có ít nhất 6 ký tự và bắt buộc nhập
 */
const loginSchema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
});

/**
 * Component LoginForm - Form đăng nhập sử dụng Formik và Yup
 * 
 * Chức năng:
 * 1. Hiển thị form đăng nhập với các trường email và password
 * 2. Validate input theo schema đã định nghĩa với Yup
 * 3. Xử lý đăng nhập khi form được submit
 * 4. Hiển thị thông báo lỗi (nếu có)
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(""); // State lưu thông báo lỗi từ API
  const [isLoading, setIsLoading] = useState(false); // State kiểm soát trạng thái loading

  /**
   * Hàm xử lý submit form
   * @param {Object} values - Giá trị từ form (email, password)
   * @param {Object} param1 - Các helpers của Formik
   * @param {Function} param1.setSubmitting - Function để cập nhật trạng thái submit
   */
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsLoading(true);
      setError(""); // Reset lỗi trước khi gọi API
      // Gọi API đăng nhập từ authService
      await authService.login(values.email, values.password);
      // Nếu đăng nhập thành công, chuyển hướng đến trang dashboard
      navigate("/dashboard");
    } catch (err) {
      // Nếu có lỗi, hiển thị thông báo
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      // Cập nhật trạng thái khi hoàn thành
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập
          </h2>
        </div>
        {/* 
          Khởi tạo Formik với:
          - initialValues: giá trị ban đầu của form
          - validationSchema: schema validation từ Yup
          - onSubmit: hàm xử lý khi submit form
        */}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {/* Render props để truy cập vào state và helpers của Formik */}
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              {/* Hiển thị thông báo lỗi từ API (nếu có) */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  {/* 
                    Field component của Formik: 
                    - Tự động kết nối với Formik context 
                    - Xử lý các events (change, blur)
                    - Tự động validate dựa vào schema
                  */}
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Email"
                  />
                  {/* 
                    ErrorMessage component: 
                    - Hiển thị lỗi validation cho field tương ứng 
                    - Chỉ hiển thị khi có lỗi
                  */}
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Mật khẩu
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Mật khẩu"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>
              </div>

              <div>
                {/* 
                  Nút submit form:
                  - Disabled khi form đang submit hoặc đang loading
                  - Hiển thị trạng thái loading 
                */}
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;
