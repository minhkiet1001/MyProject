import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { UserRole } from "../../types/index.js";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import doctorAppointmentService from "../../services/doctorAppointmentService";
import appointmentService from "../../services/appointmentService";
import authService from "../../services/authService";
import {
  VideoCameraIcon,
  UserIcon,
  UserCircleIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import VideoCallComponent from "../../components/video/VideoCallComponent";
import { getEffectiveAppId } from "../../utils/agoraUtils";

const DoctorOnlineConsultationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [channelToken, setChannelToken] = useState(null);
  const [joining, setJoining] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);

  // Check authentication
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

    // Verify doctor role
    const role = authService.getUserRole();
    if (role !== UserRole.DOCTOR) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Bạn không có quyền truy cập trang này",
        },
      });
      return;
    }

    // Load appointment details
    if (appointmentId) {
      loadAppointmentDetails();
    }
  }, [location.pathname, navigate, appointmentId]);

  // Add debug log for channelToken
  useEffect(() => {
    if (channelToken) {
      console.log("Channel token data:", channelToken);

      // Check token format
      if (channelToken.token) {
        console.log("Token format check:", {
          length: channelToken.token.length,
          startsWithCorrectPrefix: channelToken.token.startsWith("00"),
          sample: channelToken.token.substring(0, 20) + "...",
        });
      }
    }
  }, [channelToken]);

  // Refresh token periodically to avoid expiration
  useEffect(() => {
    let tokenRefreshInterval;

    // If we have an appointment ID and a channel token, set up token refresh
    if (appointmentId && channelToken) {
      console.log("Setting up token refresh interval");

      // Refresh token every 30 minutes (tokens typically last 24 hours, but refreshing periodically is safer)
      tokenRefreshInterval = setInterval(async () => {
        console.log("Refreshing video call token");
        try {
          console.log("Getting doctor token...");
          const tokenResponse = await appointmentService.getDoctorToken(
            appointmentId
          );

          if (tokenResponse.success) {
            console.log("Token refreshed successfully:", {
              appId: tokenResponse.data.appId ? "provided" : "missing",
              channelName: tokenResponse.data.channelName,
              tokenProvided: !!tokenResponse.data.token,
            });
            setChannelToken(tokenResponse.data);
          } else {
            console.error("Failed to refresh token:", tokenResponse.message);
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }, 30 * 60 * 1000); // 30 minutes
    }

    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [appointmentId, channelToken]);

  const loadAppointmentDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      let appointment = null;

      console.log(`Searching for appointment ID: ${appointmentId}`);

      // Check CONFIRMED appointments
      const confirmedResponse =
        await doctorAppointmentService.getAppointmentsByStatus("CONFIRMED");
      if (confirmedResponse.success) {
        console.log(
          `Found ${confirmedResponse.data.length} CONFIRMED appointments`
        );
        appointment = confirmedResponse.data.find(
          (app) => app.id === parseInt(appointmentId)
        );
        if (appointment) console.log(`Found appointment in CONFIRMED status`);
      }

      // If not found, check UNDER_REVIEW appointments
      if (!appointment) {
        const underReviewResponse =
          await doctorAppointmentService.getAppointmentsByStatus(
            "UNDER_REVIEW"
          );
        if (underReviewResponse.success) {
          console.log(
            `Found ${underReviewResponse.data.length} UNDER_REVIEW appointments`
          );
          appointment = underReviewResponse.data.find(
            (app) => app.id === parseInt(appointmentId)
          );
          if (appointment)
            console.log(`Found appointment in UNDER_REVIEW status`);
        }
      }

      // If still not found, check COMPLETED appointments
      if (!appointment) {
        const completedResponse =
          await doctorAppointmentService.getAppointmentsByStatus("COMPLETED");
        if (completedResponse.success) {
          console.log(
            `Found ${completedResponse.data.length} COMPLETED appointments`
          );
          appointment = completedResponse.data.find(
            (app) => app.id === parseInt(appointmentId)
          );
          if (appointment) console.log(`Found appointment in COMPLETED status`);
        }
      }

      // If still not found, try getting all appointments
      if (!appointment) {
        try {
          const allAppointmentsResponse =
            await doctorAppointmentService.getAllAppointments();
          if (allAppointmentsResponse.success) {
            console.log(
              `Found ${allAppointmentsResponse.data.length} total appointments`
            );
            appointment = allAppointmentsResponse.data.find(
              (app) => app.id === parseInt(appointmentId)
            );
            if (appointment) {
              console.log(
                `Found appointment in ALL appointments with status: ${appointment.status}`
              );
            } else {
              console.log(
                `Appointment ID ${appointmentId} not found in any list`
              );
              console.log(
                "Available appointment IDs:",
                allAppointmentsResponse.data.map((app) => app.id)
              );
            }
          }
        } catch (err) {
          console.error("Error fetching all appointments:", err);
        }
      }

      // If still not found, try a direct API call as last resort
      if (!appointment) {
        try {
          console.log("Attempting direct API call to get appointment");
          const directResponse = await axios.get(
            `http://localhost:8080/api/appointments/${appointmentId}`,
            {
              headers: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            }
          );

          if (directResponse.data && directResponse.data.success) {
            console.log(
              "Successfully retrieved appointment via direct API call"
            );
            appointment = directResponse.data.data;
          }
        } catch (err) {
          console.error("Error with direct API call:", err);
        }
      }

      // If still not found, try using appointmentService as a last resort
      if (!appointment) {
        try {
          console.log(
            "Attempting to use appointmentService.getAppointmentById as fallback"
          );
          const patientEndpointResponse =
            await appointmentService.getAppointmentById(appointmentId);

          if (patientEndpointResponse.success) {
            console.log(
              "Successfully retrieved appointment via patient endpoint"
            );
            appointment = patientEndpointResponse.data;
          }
        } catch (err) {
          console.error("Error with patient endpoint fallback:", err);
        }
      }

      // If appointment found, create a proper response object
      if (appointment) {
        const appointmentResponse = { success: true, data: appointment };

        // For doctors, automatically put the appointment under review if it's CONFIRMED
        if (appointment.status === "CONFIRMED") {
          try {
            // Prepare notes for online appointment
            const notes =
              "Tiếp nhận hồ sơ bệnh nhân. Cuộc hẹn trực tuyến - không cần gửi mẫu xét nghiệm.";

            // Call the API to put appointment under review
            const updateResponse =
              await doctorAppointmentService.putUnderReview(
                appointmentId,
                notes,
                "N/A - Online", // Placeholder for blood pressure
                false, // Don't request blood sample for online appointments
                appointment.symptoms
              );

            if (updateResponse.success) {
              console.log("Online appointment automatically put under review");
              // Update the appointment data with the new status
              appointment = updateResponse.data;
            }
          } catch (updateError) {
            console.error(
              "Error putting appointment under review:",
              updateError
            );
          }
        }

        // Get doctor token
        const tokenResponse = await appointmentService.getDoctorToken(
          appointmentId
        );
        if (tokenResponse.success) {
          setChannelToken(tokenResponse.data);
        } else {
          setError(
            tokenResponse.message || "Không thể tạo kết nối video cho bác sĩ."
          );
        }

        setAppointment(appointment);
        setPatientInfo({
          symptoms: appointment.symptoms,
          medicalHistory: appointment.medicalHistory,
          notes: appointment.notes,
          isAnonymous: appointment.isAnonymous,
          age: appointment.patientAge,
          gender: appointment.patientGender,
          phoneNumber: appointment.patientPhone,
          bookingNotes: appointment.bookingNotes,
          preferredContactMethod: appointment.preferredContactMethod,
        });

        // Check if this is an online appointment
        if (!appointment.isOnline) {
          setError("Đây không phải là cuộc hẹn trực tuyến.");
          setLoading(false);
          return;
        }
      } else {
        throw new Error("Không tìm thấy thông tin cuộc hẹn");
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
      setError(error.message || "Đã xảy ra lỗi khi tải thông tin cuộc hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = () => {
    // Check if we have a valid token before joining
    if (!channelToken || !channelToken.token || !channelToken.channelName) {
      console.error(
        "Cannot join call: Missing token information",
        channelToken
      );
      setError(
        "Không thể tham gia cuộc gọi: Thiếu thông tin kết nối. Vui lòng làm mới trang."
      );
      return;
    }

    // Log the complete channelToken for debugging
    console.log("Full channelToken data:", JSON.stringify(channelToken));

    console.log("Joining video call with token:", {
      appId: channelToken.appId ? channelToken.appId : "missing",
      channelName: channelToken.channelName,
      tokenProvided: !!channelToken.token,
    });

    setJoining(true);
  };

  const handleEndCall = async (callSuccessful = false) => {
    setJoining(false);
    setCallEnded(true);

    // If call was successful, mark the appointment as completed
    if (callSuccessful && appointment) {
      try {
        const notes = "Cuộc tư vấn trực tuyến đã hoàn thành.";
        const response = await doctorAppointmentService.completeAppointment(
          appointment.id,
          notes
        );

        if (response.success) {
          console.log("Appointment marked as completed");
          // Update the appointment with completed status
          setAppointment({
            ...appointment,
            status: "COMPLETED",
          });
        } else {
          console.error(
            "Failed to mark appointment as completed:",
            response.message
          );
        }
      } catch (error) {
        console.error("Error marking appointment as completed:", error);
      }
    } else if (!callSuccessful) {
      console.log(
        "Call ended without successful completion - not marking as completed"
      );
    }
  };

  // Render the video consultation UI
  const renderVideoConsultation = () => {
    if (!appointment) return null;

    return (
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cuộc hẹn trực tuyến</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Appointment Information Column */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">
                  Thông tin cuộc hẹn
                </h3>
                <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      {appointment.isAnonymous ? (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm ml-1">
                          Bệnh nhân ẩn danh
                        </span>
                      ) : (
                        <span className="flex flex-col">
                          <span className="font-medium">
                            {appointment.userName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.userAge && appointment.userGender && (
                              <>
                                {appointment.userAge} tuổi,{" "}
                                {appointment.userGender === "MALE"
                                  ? "Nam"
                                  : appointment.userGender === "FEMALE"
                                  ? "Nữ"
                                  : "Không rõ"}
                              </>
                            )}
                            {appointment.userPhone && (
                              <> • {appointment.userPhone}</>
                            )}
                            {!appointment.userPhone && <> • Không có SĐT</>}
                          </span>
                        </span>
                      )}
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

              {/* Patient Information Column */}
              <div>
                {patientInfo && (
                  <>
                    <h3 className="font-medium text-gray-700 mb-3">
                      Thông tin bệnh nhân cung cấp
                    </h3>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <UserCircleIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium">
                            {appointment.isAnonymous
                              ? "Bệnh nhân ẩn danh"
                              : appointment.userName}
                          </h5>
                          {!appointment.isAnonymous && (
                            <p className="text-sm text-gray-500">
                              {appointment.userAge &&
                                `${appointment.userAge} tuổi`}
                              {appointment.userGender &&
                                `, ${
                                  appointment.userGender === "MALE"
                                    ? "Nam"
                                    : appointment.userGender === "FEMALE"
                                    ? "Nữ"
                                    : "Không rõ"
                                }`}
                              {appointment.userPhone &&
                                ` • ${appointment.userPhone}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {appointment.isAnonymous ? (
                        <div>
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mb-3">
                            <div className="flex">
                              <EyeSlashIcon className="h-5 w-5 text-amber-500 mr-2" />
                              <p className="text-sm text-amber-800">
                                Thông tin cá nhân bệnh nhân được ẩn danh
                          </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            {appointment.symptoms && (
                              <div className="flex">
                                <div className="w-1/3 text-gray-500">
                                  Triệu chứng:
                                </div>
                                <div className="w-2/3 font-medium">
                                  {appointment.symptoms}
                                </div>
                              </div>
                            )}
                            {appointment.medicalHistory && (
                              <div className="flex">
                                <div className="w-1/3 text-gray-500">
                                  Tiền sử bệnh:
                                </div>
                                <div className="w-2/3 font-medium">
                                  {appointment.medicalHistory}
                                </div>
                              </div>
                            )}
                            {appointment.notes && (
                              <div className="flex">
                                <div className="w-1/3 text-gray-500">
                                  Ghi chú:
                                </div>
                                <div className="w-2/3 font-medium">
                                  {appointment.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {appointment.symptoms && (
                            <div className="flex">
                              <div className="w-1/3 text-gray-500">
                                Triệu chứng:
                              </div>
                              <div className="w-2/3 font-medium">
                                {appointment.symptoms}
                              </div>
                            </div>
                          )}
                          {appointment.medicalHistory && (
                            <div className="flex">
                              <div className="w-1/3 text-gray-500">
                                Tiền sử bệnh:
                              </div>
                              <div className="w-2/3 font-medium">
                                {appointment.medicalHistory}
                              </div>
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="flex">
                              <div className="w-1/3 text-gray-500">
                                Ghi chú:
                              </div>
                              <div className="w-2/3 font-medium">
                                {appointment.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                    Cuộc hẹn đã được đánh dấu là hoàn thành.
                  </p>
                </div>
              ) : (
                <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                  <div className="text-center mb-6">
                    <div className="bg-green-100 inline-block p-3 rounded-full mb-3">
                      <VideoCameraIcon className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800">
                      Sẵn sàng tham gia cuộc tư vấn
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Bác sĩ và bệnh nhân sẽ kết nối qua video trực tiếp
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 shadow-md"
                    onClick={handleJoinCall}
                    disabled={!channelToken}
                  >
                    <VideoCameraIcon className="h-6 w-6 mr-2" />
                    Tham gia ngay
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
                    uid={
                      authService.getUserId()
                        ? parseInt(authService.getUserId())
                        : Math.floor(Math.random() * 100000)
                    }
                    onCallEnd={handleEndCall}
                    role={UserRole.DOCTOR}
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="text-center mt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/doctor/appointments")}
          >
            Quay lại danh sách cuộc hẹn
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout
      currentRole={UserRole.DOCTOR}
      pageTitle="Tham gia tư vấn trực tuyến"
      headerText="Tham gia tư vấn trực tuyến"
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

            {renderVideoConsultation()}
          </>
        )}
      </div>
    </Layout>
  );
};

export default DoctorOnlineConsultationPage;
