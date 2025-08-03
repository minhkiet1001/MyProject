import React, { useState, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  UserCircleIcon,
  BeakerIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Button from "../common/Button";
import TreatmentPlanEditor from "./TreatmentPlanEditor";
import doctorTreatmentService from "../../services/doctorTreatmentService";
import doctorAppointmentService from "../../services/doctorAppointmentService";

const PatientRecordModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  console.log("PatientRecordModal rendered with:", { appointment });
  
  const [activeView, setActiveView] = useState(
    appointment?.status === "UNDER_REVIEW" ? "treatmentPlan" : "summary"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [treatmentPlanData, setTreatmentPlanData] = useState(null);
  const [isUnderReview, setIsUnderReview] = useState(
    appointment?.status === "UNDER_REVIEW"
  );
  const [isTreatmentPlanSaved, setIsTreatmentPlanSaved] = useState(false);
  const [treatmentPlanSaved, setTreatmentPlanSaved] = useState(false);
  const [bloodPressure, setBloodPressure] = useState("");
  const [doctorSymptoms, setDoctorSymptoms] = useState(""); // Changed from currentSymptoms to doctorSymptoms
  const [bloodSampleRequested, setBloodSampleRequested] = useState(true); // Always true now
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);
  
  // Update active view when appointment changes or modal opens
  useEffect(() => {
    if (isOpen && appointment) {
      // Set active view based on appointment status
      if (appointment.status === "UNDER_REVIEW") {
        setActiveView("treatmentPlan");
        setIsUnderReview(true);
      } else {
        setActiveView("summary");
        setIsUnderReview(false);
      }
      
      // Clear any previous state
      setError(null);
      setSuccess(null);
      setTreatmentPlanData(null);
      setIsTreatmentPlanSaved(false);

      // Initialize form fields from appointment data if available
      if (appointment.bloodPressure) {
        setBloodPressure(appointment.bloodPressure);
      } else {
        setBloodPressure("");
      }

      // Initialize doctor symptoms with existing symptoms from the database
      setDoctorSymptoms(appointment.symptoms || "");
    }
  }, [isOpen, appointment]);

  // Xóa fetchLabResults và các tham chiếu đến lab results

  // Format lab result value with unit
  const formatLabResult = (result) => {
    if (!result) return "N/A";

    let formattedResult = result.result;
    if (result.unit) {
      formattedResult += ` ${result.unit}`;
    }
    return formattedResult;
  };

  // Get test type display name
  const getTestTypeLabel = (testType) => {
    switch (testType) {
      case "CD4":
        return "CD4 (Tế bào lympho T CD4+)";
      case "VIRAL_LOAD":
        return "Tải lượng virus (Viral Load)";
      case "HIV_TEST":
        return "Xét nghiệm HIV";
      case "BLOOD_COUNT":
        return "Công thức máu";
      case "LIVER_FUNCTION":
        return "Chức năng gan";
      case "KIDNEY_FUNCTION":
        return "Chức năng thận";
      default:
        return testType || "Không xác định";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!isOpen || !appointment) return null;

  // Handle putting appointment under review
  const handlePutUnderReview = async () => {
    // First, check if appointment is under review already
      if (appointment.status === "UNDER_REVIEW") {
      console.log("Appointment already under review, moving to treatment plan tab");
        
      // If this is an online appointment, go straight to treatment plan
        if (appointment.isOnline) {
          setActiveView("treatmentPlan");
          return;
        }
        
      // Chuyển thẳng đến phần treatment plan mà không cần kiểm tra kết quả xét nghiệm nữa
          setActiveView("treatmentPlan");
        return;
      }
      
      // Mark that form submission was attempted
      setFormSubmitAttempted(true);
      
      // Validate blood pressure is entered
      if (!bloodPressure || bloodPressure.trim() === '') {
        setError("Vui lòng nhập huyết áp trước khi tiếp tục");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      console.log("Putting appointment under review:", appointment.id);
      console.log("Doctor's updated symptoms:", doctorSymptoms); // Log the symptoms being sent
      
      // Prepare notes based on appointment type
      let notes = "Tiếp nhận hồ sơ bệnh nhân";
      if (appointment.isOnline) {
        notes = "Tiếp nhận hồ sơ bệnh nhân. Cuộc hẹn trực tuyến - không cần gửi mẫu xét nghiệm.";
      }
      
      // Put the appointment under review and update symptoms in one call
      const response = await doctorAppointmentService.putUnderReview(
        appointment.id,
        notes,
        bloodPressure,
        !appointment.isOnline, // Only request blood sample for in-person appointments
        doctorSymptoms // Update symptoms with doctor's assessment
      );
      
      console.log("Response from putUnderReview:", response); // Log the response
      
      if (response.success) {
        console.log("Updated appointment data:", response.data);
        
        // Check if symptoms were updated in the response
        if (response.data && response.data.symptoms !== doctorSymptoms) {
          console.warn("Warning: Symptoms in response don't match what was sent!", {
            sent: doctorSymptoms,
            received: response.data.symptoms
          });
        }
        
        // Show success message with overlay
        if (appointment.isOnline) {
          setSuccess("Đã tiếp nhận hồ sơ bệnh nhân thành công. Bạn có thể tham gia cuộc tư vấn trực tuyến ngay bây giờ.");
        } else {
        setSuccess("Đã tiếp nhận hồ sơ bệnh nhân và gửi yêu cầu xét nghiệm thành công. Vui lòng chờ kết quả từ phòng xét nghiệm.");
        }
        setShowSuccessOverlay(true);
        
      // Wait 1.5 seconds then close the modal
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        // Đóng modal cho tất cả các loại cuộc hẹn sau khi tiếp nhận
          onClose();
        setShowSuccessOverlay(false);
      }, 1500);
      } else {
      setError("Không thể tiếp nhận hồ sơ: " + response.message);
      }
    
      setIsLoading(false);
  };

  // Handle treatment plan save success
  const handleTreatmentPlanSuccess = async (planData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Saving treatment plan in PatientRecordModal:", planData);
      
      // Ensure medications have prescribedBy set
      if (planData.medications && planData.medications.length > 0) {
        const doctorName =
          localStorage.getItem("doctorName") || "Bác sĩ điều trị";
        console.log("Current doctor name for medications:", doctorName);
        
        planData.medications = planData.medications.map((med) => {
          if (!med.prescribedBy) {
            med.prescribedBy = doctorName;
            console.log(`Setting prescribedBy to ${doctorName} for medication`);
          }
          return med;
        });
        
        console.log(
          "Medications after setting prescribedBy:",
          planData.medications
        );
      }
      
      // First save the treatment plan
      const response = await doctorTreatmentService.createTreatmentPlan({
        ...planData,
        appointmentId: appointment.id,
      });
      
      if (!response.success) {
        throw new Error(response.message || "Lỗi khi lưu phác đồ điều trị");
      }
      
      // Get the created treatment plan ID
      const treatmentPlanId = response.data.id;
      
      // If there are medications, add them to the treatment plan
      if (planData.medications && planData.medications.length > 0) {
        console.log(
          `Adding ${planData.medications.length} medications to treatment plan ${treatmentPlanId}`
        );
        
        const medicationsResponse =
          await doctorTreatmentService.addMultipleMedicationsToTreatmentPlan(
          treatmentPlanId, 
          planData.medications
        );
        
        if (!medicationsResponse.success) {
          throw new Error(
            medicationsResponse.message ||
              "Lỗi khi thêm thuốc vào phác đồ điều trị"
          );
        }
        
        console.log(
          "Medications added successfully:",
          medicationsResponse.data
        );
      }
      
      // Save the treatment plan data
      setTreatmentPlanData(planData);
      setIsTreatmentPlanSaved(true);
      // Mark that treatment plan has been saved in this session
      setTreatmentPlanSaved(true);
      
      // Show success message
      setSuccess("Đã lưu phác đồ điều trị thành công");
    } catch (err) {
      console.error("Error in handleTreatmentPlanSuccess:", err);
      setError(
        "Lỗi khi lưu phác đồ điều trị: " + (err.message || "Không xác định")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle completing the appointment after treatment plan is saved
  const handleCompleteAppointment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Complete the appointment with treatment info
      const completeResponse =
        await doctorAppointmentService.completeAppointmentWithTreatment(
        appointment.id, 
        {
          treatmentPlan: treatmentPlanData,
            notes: `Đã hoàn thành khám và kê đơn thuốc. Phác đồ điều trị kết thúc ${
              treatmentPlanData.endDate
                ? new Date(treatmentPlanData.endDate).toLocaleDateString(
                    "vi-VN"
                  )
                : "theo lịch"
            }.`,
        }
      );
      
      if (!completeResponse.success) {
        throw new Error(
          completeResponse.message || "Lỗi khi hoàn thành cuộc hẹn"
        );
      }
      
      // Show success message
      setSuccess("Đã hoàn thành cuộc hẹn thành công");
      
      // Call the onSuccess callback to refresh data
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
      
      // Close the modal after a delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error in handleCompleteAppointment:", err);
      setError(
        "Lỗi khi hoàn thành cuộc hẹn: " + (err.message || "Không xác định")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render progress indicator
  const renderProgressSteps = () => {
    // Define steps based on appointment status
    let steps = [
      { id: "summary", label: "Thông tin bệnh nhân", icon: UserCircleIcon },
      {
        id: "treatmentPlan",
        label: "Kế hoạch điều trị",
        icon: DocumentTextIcon,
      },
    ];
    
    // If already under review, only show treatment plan step
    if (isUnderReview) {
      steps = steps.slice(1);
    }

    return (
      <div className="flex items-center justify-center mb-6 px-6 pt-6">
        <div className="w-full max-w-3xl">
          <div className="relative flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = activeView === step.id;
              const isPast =
                steps.findIndex((s) => s.id === activeView) > index;
              const stepStatus = isActive
                ? "active"
                : isPast
                ? "complete"
                : "upcoming";
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step circle */}
                  <div className="relative flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10
                        ${
                          stepStatus === "active"
                            ? "border-blue-600 bg-blue-100"
                            : stepStatus === "complete"
                            ? "border-green-600 bg-green-100"
                            : "border-gray-300 bg-white"
                        }`}
                    >
                      {stepStatus === "complete" ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <step.icon
                          className={`h-5 w-5 ${
                            isActive ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium
                      ${
                        stepStatus === "active"
                          ? "text-blue-600"
                          : stepStatus === "complete"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="flex-grow mx-2">
                      <div
                        className={`h-1 ${
                          steps.findIndex((s) => s.id === activeView) > index
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    if (activeView === "summary") return "Tiếp nhận hồ sơ bệnh nhân";
    if (activeView === "treatmentPlan") return "Thêm kế hoạch điều trị";
    return "Cuộc hẹn khám bệnh";
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white max-h-[85vh] overflow-y-auto">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  {getModalTitle()}
                </h2>
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">Đóng</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Success/Error Messages */}
            {(success || error) && (
              <div className="px-6 pt-4">
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
                    <div className="flex">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      <p>{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <div className="flex">
                      <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress steps */}
            {renderProgressSteps()}

            {/* Patient summary view */}
            {activeView === "summary" && (
              <div className="px-6 pb-6">
                {/* Patient info */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Thông tin bệnh nhân
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <UserCircleIcon className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {appointment.userName}
                      </h3>
                      <div className="text-gray-600 text-sm flex space-x-4 mt-1">
                        <span>{appointment.userAge || "??"} tuổi</span>
                        <span>•</span>
                        <span>{appointment.userGender || "Không rõ"}</span>
                        {appointment.userPhone && (
                          <>
                            <span>•</span>
                            <span>{appointment.userPhone}</span>
                          </>
                        )}
                      </div>
                      {appointment.userHealthInsurance && (
                        <div className="mt-1 text-sm">
                          <span className="font-medium">BHYT:</span>{" "}
                          {appointment.userHealthInsurance}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Appointment info */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Thông tin cuộc hẹn
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-2 text-blue-800">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        {new Date(appointment.scheduledAt).toLocaleDateString(
                          "vi-VN",
                          {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          }
                        )}{" "}
                        {new Date(appointment.scheduledAt).toLocaleTimeString(
                          "vi-VN",
                          {
                          hour: "2-digit",
                          minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-gray-700">
                      <span className="font-medium">Dịch vụ:</span>{" "}
                      {appointment.serviceName}
                    </p>
                    {appointment.notes && (
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">Ghi chú:</span>{" "}
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Patient Medical Information */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Thông tin y tế do bệnh nhân cung cấp
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-700">
                        Triệu chứng:
                      </h5>
                      <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                        {appointment.symptoms
                          ? appointment.symptoms
                          : "Không có"}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700">
                        Tiền sử bệnh:
                      </h5>
                      <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                        {appointment.medicalHistory
                          ? appointment.medicalHistory
                          : "Không có"}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700">
                        Ghi chú của bệnh nhân:
                      </h5>
                      <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                        {appointment.notes ? appointment.notes : "Không có"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Initial examination information section */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Thông tin khám cho bệnh nhân ban đầu
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <div>
                      <label
                        htmlFor="bloodPressure"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Huyết áp <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="bloodPressure"
                        type="text"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        placeholder="Ví dụ: 120/80 mmHg"
                        className={`w-full p-2 border ${formSubmitAttempted && (!bloodPressure || !bloodPressure.trim()) ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                      {formSubmitAttempted && (!bloodPressure || !bloodPressure.trim()) && (
                        <p className="mt-1 text-xs text-red-500">
                          Vui lòng nhập huyết áp
                        </p>
                    )}
                </div>
                
                    <div>
                      <label
                        htmlFor="doctorSymptoms"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Triệu chứng hiện tại (ghi nhận bởi bác sĩ)
                      </label>
                      <textarea
                        id="doctorSymptoms"
                        value={doctorSymptoms}
                        onChange={(e) => setDoctorSymptoms(e.target.value)}
                        placeholder="Nhập triệu chứng hiện tại của bệnh nhân"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      />
                      {/* <p className="mt-1 text-xs text-gray-500 italic">
                        Thông tin này sẽ cập nhật trực tiếp vào trường triệu chứng của bệnh nhân trong hệ thống
                      </p> */}
                    </div>

                    {/* <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-100 flex items-center">
                      <BeakerIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Hệ thống sẽ tự động yêu cầu lấy mẫu máu khi tiếp nhận hồ sơ</span>
                </div> */}
                  </div>
                </div>
                
                {/* Action button to add treatment plan */}
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    onClick={handlePutUnderReview}
                    disabled={isLoading}
                    className="w-full max-w-md"
                  >
                    {/* <DocumentTextIcon className="h-5 w-5 mr-2" /> */}
                    {isLoading
                      ? "Đang xử lý..."
                      : appointment.status === "UNDER_REVIEW"
                      ? "Tiếp tục lập kế hoạch điều trị"
                      : "Tiếp nhận hồ sơ và gửi về phòng xét nghiệm"}
                  </Button>
                </div>
              </div>
            )}

            {/* Treatment Plan form view */}
            {activeView === "treatmentPlan" && (
              <div className="px-6 pb-6">
                {/* Patient info summary */}
                <div className="mb-3 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Basic patient info */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <UserCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                        <h3 className="font-medium text-sm">
                          {appointment.userName}
                        </h3>
                          <div className="text-gray-600 text-xs flex space-x-3">
                            <span>{appointment.userAge || "??"} tuổi</span>
                            <span>•</span>
                            <span>{appointment.userGender || "Không rõ"}</span>
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                          <span className="font-medium">Dịch vụ:</span>{" "}
                          {appointment.serviceName}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Patient Medical Information - Compact view */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                        <h5 className="font-medium text-gray-700 text-xs">
                          Triệu chứng:
                        </h5>
                          <p className="text-gray-700 bg-gray-50 p-1.5 rounded text-xs">
                          {appointment.symptoms
                            ? appointment.symptoms
                            : "Không có"}
                          </p>
                        </div>
                        
                        <div>
                        <h5 className="font-medium text-gray-700 text-xs">
                          Tiền sử:
                        </h5>
                          <p className="text-gray-700 bg-gray-50 p-1.5 rounded text-xs">
                          {appointment.medicalHistory
                            ? appointment.medicalHistory
                            : "Không có"}
                          </p>
                        </div>
                        </div>
                      </div>
                    </div>

                {/* Lab Results Section */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <BeakerIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Kết quả xét nghiệm
                  </h4>

                  {/* Removed lab results loading and display */}
                  {/* Removed lab results table and notes */}
                </div>
                
                <TreatmentPlanEditor 
                  isOpen={true}
                  appointment={appointment}
                  onSave={handleTreatmentPlanSuccess}
                  isEmbedded={true}
                  disabled={treatmentPlanSaved}
                />
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between border-t">
            {/* Back button (only show when able to go back) */}
            {activeView !== "summary" &&
              !(isUnderReview && activeView === "treatmentPlan") && (
              <Button
                variant="outline"
                onClick={() => {
                    setActiveView("summary");
                }}
                disabled={isLoading}
                size="sm"
              >
                Quay lại
              </Button>
            )}
            
            {/* Close button (only show on summary or when starting with treatment plan) */}
            {(activeView === "summary" ||
              (isUnderReview && activeView === "treatmentPlan")) && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                size="sm"
              >
                Đóng
              </Button>
            )}
            
            {/* Complete appointment button (only show when treatment plan is saved) */}
            {activeView === "treatmentPlan" && isTreatmentPlanSaved && (
              <Button
                variant="primary"
                onClick={handleCompleteAppointment}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? "Đang xử lý..." : "Hoàn thành cuộc hẹn"}
              </Button>
            )}
            
            {/* Right-side buttons - empty div to maintain flex justify-between */}
            {!(activeView === "treatmentPlan" && isTreatmentPlanSaved) && (
              <div></div>
            )}
          </div>
        </div>
      </div>

      {/* Success overlay message */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center animate-pulse">
            <CheckIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecordModal;
 