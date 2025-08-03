import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import OnlineConsultationBooking from "../../components/customer/OnlineConsultationBooking";
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";
import { motion } from "framer-motion";
import {
  VideoCameraIcon,
  UserIcon,
  UserCircleIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import VideoCallComponent from "../../components/video/VideoCallComponent";
import { getEffectiveAppId } from "../../utils/agoraUtils";

/**
 * OnlineConsultationPage - Trang tham gia tư vấn trực tuyến cho bệnh nhân
 * 
 * Chức năng chính:
 * 1. Hiển thị thông tin cuộc hẹn trực tuyến
 * 2. Cung cấp giao diện tham gia cuộc gọi video
 * 3. Quản lý token kết nối và trạng thái cuộc gọi
 * 4. Xử lý kết thúc cuộc gọi
 */
const OnlineConsultationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointmentId } = useParams(); // Lấy ID cuộc hẹn từ URL
  const [showBookingForm, setShowBookingForm] = useState(!appointmentId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null); // Thông tin cuộc hẹn
  const [channelToken, setChannelToken] = useState(null); // Token kết nối video
  const [joining, setJoining] = useState(false); // Đang tham gia cuộc gọi
  const [callEnded, setCallEnded] = useState(false); // Cuộc gọi đã kết thúc

  /**
   * Kiểm tra xác thực người dùng và tải thông tin cuộc hẹn
   * - Chuyển hướng đến trang đăng nhập nếu chưa xác thực
   * - Kiểm tra vai trò người dùng là bệnh nhân
   * - Tải thông tin cuộc hẹn nếu có ID
   */
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Bạn cần đăng nhập để tham gia cuộc tư vấn trực tuyến",
        },
      });
      return;
    }

    // Xác minh vai trò là bệnh nhân
    const role = authService.getUserRole();
    if (role !== UserRole.CUSTOMER) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Bạn không có quyền truy cập trang này",
        },
      });
      return;
    }

    // Tải thông tin cuộc hẹn nếu có ID
    if (appointmentId) {
      loadAppointmentDetails();
    }
  }, [location.pathname, navigate, appointmentId]);

  /**
   * Ghi log thông tin token để debug
   */
  useEffect(() => {
    if (channelToken) {
      console.log("Channel token data:", channelToken);
      
      // Kiểm tra định dạng token
      if (channelToken.token) {
        console.log("Token format check:", {
          length: channelToken.token.length,
          startsWithCorrectPrefix: channelToken.token.startsWith("00"),
          sample: channelToken.token.substring(0, 20) + "..."
        });
      }
    }
  }, [channelToken]);

  /**
   * Làm mới token định kỳ để tránh hết hạn
   * - Token mới được lấy mỗi 30 phút
   */
  useEffect(() => {
    let tokenRefreshInterval;
    
    // Nếu có ID cuộc hẹn và token kênh, thiết lập làm mới token
    if (appointmentId && channelToken) {
      console.log("Setting up token refresh interval");
      
      // Làm mới token mỗi 30 phút (token thường kéo dài 24 giờ, nhưng làm mới định kỳ an toàn hơn)
      tokenRefreshInterval = setInterval(async () => {
        console.log("Refreshing video call token");
        try {
          console.log("Getting patient token...");
          const tokenResponse = await appointmentService.refreshPatientToken(appointmentId);
          
          if (tokenResponse.success) {
            console.log("Token refreshed successfully:", {
              appId: tokenResponse.data.appId ? "provided" : "missing",
              channelName: tokenResponse.data.channelName,
              tokenProvided: !!tokenResponse.data.token
            });
            setChannelToken(tokenResponse.data);
          } else {
            console.error("Failed to refresh token:", tokenResponse.message);
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }, 30 * 60 * 1000); // 30 phút
    }
    
    // Dọn dẹp interval khi component unmount
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [appointmentId, channelToken]);

  /**
   * Tải thông tin chi tiết của cuộc hẹn từ API
   * - Lấy thông tin cuộc hẹn
   * - Kiểm tra xem đây có phải cuộc hẹn trực tuyến không
   * - Lấy token kết nối video cho bệnh nhân
   */
  const loadAppointmentDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Lấy thông tin cuộc hẹn
      const appointmentResponse = await appointmentService.getAppointmentById(appointmentId);

      if (appointmentResponse.success) {
        setAppointment(appointmentResponse.data);

        // Kiểm tra xem đây có phải cuộc hẹn trực tuyến không
        if (!appointmentResponse.data.isOnline) {
          setError("Đây không phải là cuộc hẹn trực tuyến.");
          setLoading(false);
          return;
        }

        // Lấy token cho bệnh nhân
        const tokenResponse = await appointmentService.refreshPatientToken(appointmentId);
        if (tokenResponse.success) {
          setChannelToken(tokenResponse.data);
        } else {
          setError(tokenResponse.message || "Không thể tạo kết nối video.");
        }
      } else {
        setError(appointmentResponse.message || "Không thể tải thông tin cuộc hẹn.");
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
      setError(error.message || "Đã xảy ra lỗi khi tải thông tin cuộc hẹn.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý sau khi hoàn tất đặt lịch
   * - Chuyển hướng đến trang danh sách cuộc hẹn
   */
  const handleBookingComplete = () => {
    navigate("/customer/appointments");
  };

  /**
   * Xử lý khi bệnh nhân tham gia cuộc gọi video
   * - Kiểm tra thời gian (chỉ có thể tham gia trước 1 tiếng so với giờ hẹn)
   * - Kiểm tra thông tin token
   * - Cập nhật trạng thái để hiển thị giao diện cuộc gọi
   */
  const handleJoinCall = () => {
    // Kiểm tra token hợp lệ trước khi tham gia
    if (!channelToken || !channelToken.token || !channelToken.channelName) {
      console.error("Cannot join call: Missing token information", channelToken);
      setError("Không thể tham gia cuộc gọi: Thiếu thông tin kết nối. Vui lòng làm mới trang.");
      return;
    }
    
    // Kiểm tra thời gian - chỉ cho phép vào trước 1 giờ so với giờ hẹn
    if (appointment) {
      const appointmentTime = new Date(appointment.scheduledAt);
      const currentTime = new Date();
      const timeDifference = appointmentTime.getTime() - currentTime.getTime();
      const oneHourInMillis = 60 * 60 * 1000;
      
      if (timeDifference > oneHourInMillis) {
        // Còn hơn 1 giờ nữa mới đến giờ hẹn
        const minutesRemaining = Math.floor(timeDifference / (60 * 1000));
        const hoursRemaining = Math.floor(minutesRemaining / 60);
        const minsRemaining = minutesRemaining % 60;
        
        setError(`Bạn chỉ có thể tham gia cuộc gọi trước 1 giờ so với giờ hẹn. Vui lòng quay lại sau ${hoursRemaining} giờ ${minsRemaining} phút.`);
        return;
      }
    }
    
    // Ghi log thông tin token để debug
    console.log("Full channelToken data:", JSON.stringify(channelToken));
    
    console.log("Joining video call with token:", {
      appId: channelToken.appId ? channelToken.appId : "missing",
      channelName: channelToken.channelName,
      tokenProvided: !!channelToken.token
    });
    
    setJoining(true);
  };

  /**
   * Xử lý khi kết thúc cuộc gọi
   * @param {boolean} callSuccessful - Cuộc gọi kết thúc thành công hay không
   */
  const handleEndCall = async (callSuccessful = false) => {
    setJoining(false);
    setCallEnded(true);
    
    if (!callSuccessful) {
      console.log("Call ended without successful completion");
    }
  };

  /**
   * Hiển thị giao diện cuộc tư vấn video
   * @returns {JSX.Element|null} Giao diện tư vấn video hoặc null
   */
  const renderVideoConsultation = () => {
    if (!appointment) return null;

    return (
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cuộc hẹn trực tuyến</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Cột thông tin cuộc hẹn */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">
                  Thông tin cuộc hẹn
                </h3>
                <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Bác sĩ: {appointment.doctorName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Ngày hẹn: {""}
                      {new Date(appointment.scheduledAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Giờ hẹn: {""}
                      {new Date(appointment.scheduledAt).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột thông tin bệnh nhân */}
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-6">
                  {(() => {
                    // Kiểm tra thời gian cho phép tham gia
                    if (appointment) {
                      const appointmentTime = new Date(appointment.scheduledAt);
                      const currentTime = new Date();
                      const timeDifference = appointmentTime.getTime() - currentTime.getTime();
                      const oneHourInMillis = 60 * 60 * 1000;
                      
                      if (timeDifference > oneHourInMillis) {
                        // Còn hơn 1 giờ nữa mới đến giờ hẹn
                        return (
                          <>
                            <ClockIcon className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                            <p className="text-orange-500 font-medium">
                              Chưa đến thời gian tham gia
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Chỉ có thể tham gia trước 1 giờ so với giờ hẹn
                            </p>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <UserIcon className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                            <p className="text-blue-500 font-medium">
                              Đợi bác sĩ tham gia cuộc gọi
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Bạn có thể tham gia cuộc gọi và đợi bác sĩ kết nối
                            </p>
                          </>
                        );
                      }
                    }
                    
                    return (
                      <>
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Sẵn sàng tham gia cuộc tư vấn
                  </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Join Button Section - Below Both Columns */}
            <div className="w-full">
              {joining ? (
                <div className="text-center">
                  <div className="animate-pulse flex justify-center">
                    <VideoCameraIcon className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="mt-3 text-gray-700">
                    Đang khởi tạo cuộc gọi video...
                  </p>
                </div>
              ) : callEnded ? (
                <div className="text-center bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-green-800">
                    Cuộc gọi đã kết thúc
                  </h3>
                  <p className="text-sm text-green-700 mt-2">
                    Cảm ơn bạn đã tham gia cuộc tư vấn.
                  </p>
                </div>
              ) : (
                <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                  <div className="text-center mb-6">
                    <div className="bg-green-100 inline-block p-3 rounded-full mb-3">
                      <VideoCameraIcon className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800">
                      {(() => {
                        // Kiểm tra thời gian cho phép tham gia
                        if (appointment) {
                          const appointmentTime = new Date(appointment.scheduledAt);
                          const currentTime = new Date();
                          const timeDifference = appointmentTime.getTime() - currentTime.getTime();
                          const oneHourInMillis = 60 * 60 * 1000;
                          
                          if (timeDifference > oneHourInMillis) {
                            // Còn hơn 1 giờ nữa mới đến giờ hẹn
                            return "Chưa đến thời gian tham gia";
                          } else {
                            return "Sẵn sàng tham gia cuộc tư vấn";
                          }
                        }
                        return "Sẵn sàng tham gia cuộc tư vấn";
                      })()}
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      {(() => {
                        // Hiển thị thông báo về thời gian tham gia
                        if (appointment) {
                          const appointmentTime = new Date(appointment.scheduledAt);
                          const currentTime = new Date();
                          const timeDifference = appointmentTime.getTime() - currentTime.getTime();
                          const oneHourInMillis = 60 * 60 * 1000;
                          
                          if (timeDifference > oneHourInMillis) {
                            // Còn hơn 1 giờ nữa mới đến giờ hẹn
                            const minutesRemaining = Math.floor(timeDifference / (60 * 1000));
                            const hoursRemaining = Math.floor(minutesRemaining / 60);
                            const minsRemaining = minutesRemaining % 60;
                            
                            return `Bạn có thể tham gia trước 1 giờ so với giờ hẹn (còn ${hoursRemaining} giờ ${minsRemaining} phút nữa)`;
                          } else {
                            return "Vui lòng đợi bác sĩ tham gia cuộc gọi";
                          }
                        }
                        return "Bác sĩ và bệnh nhân sẽ kết nối qua video trực tiếp";
                      })()}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className={`w-full justify-center py-4 shadow-md ${
                      (() => {
                        // Thay đổi màu nút dựa trên thời gian cho phép
                        if (appointment) {
                          const appointmentTime = new Date(appointment.scheduledAt);
                          const currentTime = new Date();
                          const timeDifference = appointmentTime.getTime() - currentTime.getTime();
                          const oneHourInMillis = 60 * 60 * 1000;
                          
                          if (timeDifference > oneHourInMillis) {
                            // Chưa đến giờ
                            return "bg-gray-400 hover:bg-gray-500 cursor-not-allowed";
                          }
                        }
                        return "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700";
                      })()
                    }`}
                    onClick={handleJoinCall}
                    disabled={!channelToken || (() => {
                      if (appointment) {
                        const appointmentTime = new Date(appointment.scheduledAt);
                        const currentTime = new Date();
                        const timeDifference = appointmentTime.getTime() - currentTime.getTime();
                        const oneHourInMillis = 60 * 60 * 1000;
                        
                        return timeDifference > oneHourInMillis;
                      }
                      return false;
                    })()}
                  >
                    <VideoCameraIcon className="h-6 w-6 mr-2" />
                    {(() => {
                      if (appointment) {
                        const appointmentTime = new Date(appointment.scheduledAt);
                        const currentTime = new Date();
                        const timeDifference = appointmentTime.getTime() - currentTime.getTime();
                        const oneHourInMillis = 60 * 60 * 1000;
                        
                        if (timeDifference > oneHourInMillis) {
                          return "Chưa đến thời gian tham gia";
                        }
                      }
                      return "Tham gia ngay";
                    })()}
                  </Button>
                  {!channelToken && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Đang khởi tạo kết nối video, vui lòng đợi...
                    </p>
                  )}
                </div>
              )}
            </div>

            {joining && (
              <div className="mt-8 p-6 bg-gray-900 rounded-xl shadow-lg">
                {channelToken && (
                  <VideoCallComponent 
                    key={`video-call-${appointmentId}-${Date.now()}`}
                    appId={channelToken.appId}
                    channelName={channelToken.channelName}
                    token={channelToken.token}
                    uid={authService.getUserId() ? parseInt(authService.getUserId()) : Math.floor(Math.random() * 100000)}
                    onCallEnd={handleEndCall}
                    role={UserRole.CUSTOMER}
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/customer/appointments")}
          >
            Quay lại danh sách cuộc hẹn
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout
      currentRole={UserRole.CUSTOMER}
      pageTitle={
        appointmentId ? "Tham gia tư vấn trực tuyến" : "Đặt lịch tư vấn online"
      }
      headerText={
        appointmentId ? "Tham gia tư vấn trực tuyến" : "Đặt lịch tư vấn online"
      }
    >
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <ArrowPathIcon className="animate-spin h-12 w-12 text-primary-600" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {appointmentId ? (
              renderVideoConsultation()
            ) : showBookingForm ? (
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer/appointments')}
                    className="hover:bg-gray-50 transition-all duration-300 flex items-center"
                  >
                    <motion.span 
                      initial={{ x: 0 }}
                      whileHover={{ x: -2 }}
                      className="inline-flex items-center"
                    >
                      <span className="mr-1">←</span> Danh sách lịch hẹn
                    </motion.span>
                  </Button>
                </div>
                <div className="bg-blue-50 p-4 md:p-6 rounded-lg mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-primary-700 flex items-center">
                    <VideoCameraIcon className="h-6 w-6 mr-2" />
                    Tư vấn trực tuyến
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex">
                      <div className="mr-3 bg-blue-100 p-2 rounded-full h-fit">
                        <ClockIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Tiết kiệm thời gian
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tư vấn từ xa không cần di chuyển, tiết kiệm thời gian
                          đi lại.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="mr-3 bg-blue-100 p-2 rounded-full h-fit">
                        <LockClosedIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          An toàn & Bảo mật
                        </h3>
                        <p className="text-sm text-gray-600">
                          Kết nối được mã hóa, đảm bảo thông tin riêng tư của
                          bạn.
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="mr-3 bg-blue-100 p-2 rounded-full h-fit">
                        <EyeSlashIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Tư vấn ẩn danh
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tùy chọn tư vấn ẩn danh nếu bạn muốn giữ kín danh
                          tính.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <OnlineConsultationBooking
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mb-4">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Đặt lịch thành công!
                </h2>
                <p className="text-gray-600 mb-6">
                  Lịch tư vấn trực tuyến của bạn đã được xác nhận.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/customer/appointments")}
                  >
                    Xem lịch hẹn của tôi
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowBookingForm(true)}
                  >
                    Đặt lịch tư vấn mới
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default OnlineConsultationPage;
 