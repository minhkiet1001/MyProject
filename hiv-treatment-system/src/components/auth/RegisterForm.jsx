import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import Input from "../common/Input";
import authService from "../../services/authService";
import { Formik, Form, Field, ErrorMessage } from "formik"; 
import * as Yup from "yup"; 

/**
 * Schema validation cho form đăng ký sử dụng Yup
 * - Kiểm tra các trường bắt buộc và định dạng
 * - Kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau
 * - Kiểm tra các ràng buộc về định dạng (email, số điện thoại)
 * - Kiểm tra ngày sinh hợp lệ (không trong tương lai)
 */
const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .required("Họ tên là bắt buộc"),
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
  phone: Yup.string()
    .min(10, "Số điện thoại không hợp lệ")
    .required("Số điện thoại là bắt buộc"),
  gender: Yup.string()
    .oneOf(["MALE", "FEMALE", "OTHER"], "Vui lòng chọn giới tính")
    .required("Giới tính là bắt buộc"),
  birthdate: Yup.date()
    .max(new Date(), "Ngày sinh không hợp lệ")
    .required("Ngày sinh là bắt buộc"),
  address: Yup.string().optional(), // Địa chỉ không bắt buộc
  otp: Yup.string().optional(), // Mã OTP sẽ được xử lý riêng
});

/**
 * Component RegisterForm - Form đăng ký tài khoản mới sử dụng Formik và Yup
 * 
 * Chức năng:
 * 1. Hiển thị form đăng ký với các trường thông tin cá nhân
 * 2. Tích hợp xác thực OTP qua email
 * 3. Validate input theo schema đã định nghĩa với Yup
 * 4. Xử lý đăng ký khi form được submit và đã xác thực OTP
 * 
 * @param {Function} onSubmit - Hàm xử lý khi form được submit
 * @param {boolean} isLoading - Trạng thái loading từ component cha
 * @param {string} error - Thông báo lỗi từ component cha
 */
const RegisterForm = ({ onSubmit, isLoading, error: externalError }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(externalError || ""); // State lưu thông báo lỗi 
  const [showOtpField, setShowOtpField] = useState(false); // Hiển thị trường nhập OTP
  const [sendingOtp, setSendingOtp] = useState(false); // Trạng thái đang gửi OTP
  const [otpVerified, setOtpVerified] = useState(false); // Trạng thái OTP đã xác thực
  const [otpError, setOtpError] = useState(""); // Thông báo lỗi liên quan đến OTP
  const [verifyingOtp, setVerifyingOtp] = useState(false); // Trạng thái đang xác thực OTP
  const [otpSent, setOtpSent] = useState(false); // OTP đã được gửi

  /**
   * Xử lý khi submit form đăng ký
   * - Kiểm tra xem OTP đã được xác thực chưa
   * - Gọi hàm onSubmit từ component cha nếu hợp lệ
   * 
   * @param {Object} values - Giá trị từ form Formik
   * @param {Object} formikHelpers - Các hàm hỗ trợ từ Formik
   */
  const handleFormSubmit = async (values, { setSubmitting }) => {
    setError("");

    if (!otpVerified) {
      setError("Vui lòng xác thực email của bạn bằng mã OTP trước khi đăng ký");
      setSubmitting(false);
      return;
    }

    // Chuyển dữ liệu form đến component cha để xử lý
    if (onSubmit) {
      await onSubmit(values);
    }
    setSubmitting(false);
  };

  /**
   * Gửi mã OTP đến email của người dùng
   * 
   * @param {Event} e - Sự kiện click
   * @param {string} email - Email cần gửi OTP
   */
  const handleSendOtp = async (e, email) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email để nhận mã OTP");
      return;
    }

    try {
      setSendingOtp(true);
      setOtpError("");

      // Gọi API để gửi OTP
      const response = await authService.sendOtp(email);

      setOtpSent(true);
      setShowOtpField(true);

      // Hiển thị thông báo thành công
      setError("");
    } catch (err) {
      setError(err.message || "Không thể gửi mã OTP. Vui lòng thử lại sau.");
    } finally {
      setSendingOtp(false);
    }
  };

  /**
   * Xác thực mã OTP đã nhập
   * 
   * @param {Event} e - Sự kiện click
   * @param {string} email - Email đã đăng ký
   * @param {string} otp - Mã OTP người dùng nhập
   */
  const handleVerifyOtp = async (e, email, otp) => {
    e.preventDefault();

    if (!otp) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError("");

      // Gọi API để xác thực OTP
      const response = await authService.verifyOtp(email, otp);

      if (response.success) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError("Mã OTP không hợp lệ hoặc đã hết hạn");
      }
    } catch (err) {
      setOtpError(
        err.message || "Không thể xác thực mã OTP. Vui lòng thử lại."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  /**
   * Gửi lại mã OTP đến email người dùng
   * 
   * @param {Event} e - Sự kiện click
   * @param {string} email - Email cần gửi lại OTP
   */
  const handleResendOtp = async (e, email) => {
    e.preventDefault();

    try {
      setSendingOtp(true);
      setOtpError("");

      // Gọi API để gửi lại OTP
      const response = await authService.resendOtp(email);

      // Hiển thị thông báo thành công
      setOtpError("");
      setError("Mã OTP mới đã được gửi đến email của bạn");
    } catch (err) {
      setOtpError(
        err.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-800">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        {/* 
          Formik component với:
          - initialValues: Giá trị ban đầu cho tất cả các trường
          - validationSchema: Schema validation Yup
          - onSubmit: Xử lý khi form được gửi
        */}
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            gender: "",
            birthdate: "",
            address: "",
            otp: "",
          }}
          validationSchema={registerSchema}
          onSubmit={handleFormSubmit}
        >
          {/* Render props để truy cập state và helpers của Formik */}
          {({ isSubmitting, values }) => (
            <Form className="mt-8 space-y-6">
              {/* Hiển thị thông báo lỗi chung */}
              {error && (
                <div className="rounded-md bg-red-50 border-l-4 border-red-500 p-4 shadow-sm">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  {/* Trường nhập Họ và tên */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Họ và tên
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Nhập họ và tên của bạn"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Phần email và OTP verification */}
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <div className="flex">
                      <Field
                        type="email"
                        name="email"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="example@gmail.com"
                        disabled={otpSent}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                    <div className="mt-2">
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={(e) => handleSendOtp(e, values.email)}
                          disabled={sendingOtp || !values.email}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {sendingOtp ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Đang gửi...
                            </>
                          ) : (
                            "Gửi mã OTP"
                          )}
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          {!otpVerified && (
                            <button
                              type="button"
                              onClick={(e) => handleResendOtp(e, values.email)}
                              disabled={sendingOtp}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {sendingOtp ? "Đang gửi..." : "Gửi lại mã OTP"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {showOtpField && (
                    <div className="animate-fadeIn">
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mã OTP
                      </label>
                      <div className="flex space-x-2">
                        <Field
                          type="text"
                          name="otp"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Nhập mã OTP đã được gửi đến email của bạn"
                          maxLength={6}
                          disabled={otpVerified}
                        />
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={(e) =>
                              handleVerifyOtp(e, values.email, values.otp)
                            }
                            disabled={verifyingOtp || !values.otp}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {verifyingOtp ? "Đang xác thực..." : "Xác thực"}
                          </button>
                        )}
                      </div>
                      {otpError && (
                        <p className="mt-1 text-sm text-red-600">{otpError}</p>
                      )}
                      {otpVerified && (
                        <p className="mt-1 text-sm text-green-600">
                          Email đã được xác thực thành công
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Mã OTP có hiệu lực trong 10 phút
                      </p>
                    </div>
                  )}

                  {/* Trường nhập Mật khẩu */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Mật khẩu
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Trường nhập Xác nhận mật khẩu */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Trường nhập Số điện thoại */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số điện thoại
                    </label>
                    <Field
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Nhập số điện thoại của bạn"
                    />
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Trường nhập Giới tính */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Giới tính
                    </label>
                    <Field
                      as="select"
                      name="gender"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </Field>
                    <ErrorMessage
                      name="gender"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Trường nhập Ngày sinh */}
                  <div>
                    <label
                      htmlFor="birthdate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ngày sinh
                    </label>
                    <Field
                      type="date"
                      name="birthdate"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <ErrorMessage
                      name="birthdate"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Trường nhập Địa chỉ */}
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Địa chỉ
                    </label>
                    <Field
                      type="text"
                      name="address"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Nhập địa chỉ của bạn (không bắt buộc)"
                    />
                    <ErrorMessage
                      name="address"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Nút đăng ký */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !otpVerified || isSubmitting}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg
                          className="animate-spin h-5 w-5 text-indigo-300"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </div>
              
              {/* Link quay về trang chủ */}
              <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Quay về trang chủ
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterForm;
