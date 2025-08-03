import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import DoctorScheduleManager from "./DoctorScheduleManager";
import managerDoctorService from "../../services/managerDoctorService";
import { toast } from "react-toastify";

const DoctorDetailModal = ({ isOpen, onClose, doctor, onSave, defaultTab = "info" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({ ...doctor });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Reset form data when doctor changes
  useEffect(() => {
    setFormData({ ...doctor });
  }, [doctor]);

  // Available specialties
  const specialties = [
    "Bệnh truyền nhiễm",
    "Miễn dịch học",
    "HIV/AIDS",
    "Nội khoa HIV",
  ];

  // Available degrees
  const degrees = [
    "BS",
    "ThS",
    "TS",
    "BSCK1",
    "BSCK2",
    "PGS",
    "GS",
    "MD",
    "PhD",
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Clear API error
    if (apiError) {
      setApiError("");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Tên bác sĩ là bắt buộc";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.specialty) {
      newErrors.specialty = "Vui lòng chọn chuyên khoa";
    }

    if (
      formData.experienceYears &&
      (isNaN(formData.experienceYears) ||
        parseInt(formData.experienceYears) < 0)
    ) {
      newErrors.experienceYears = "Số năm kinh nghiệm phải là số dương";
    }

    if (
      formData.maxPatientsPerDay &&
      (isNaN(formData.maxPatientsPerDay) ||
        parseInt(formData.maxPatientsPerDay) < 0)
    ) {
      newErrors.maxPatientsPerDay = "Số bệnh nhân tối đa phải là số dương";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setApiError("");

      try {
        // Format data for API
        const formattedData = managerDoctorService.formatDoctorData(formData);

        // Call API to update doctor
        const response = await managerDoctorService.updateDoctor(
          doctor.id,
          formattedData
        );

        if (response.success) {
          // Pass updated data back to parent
          onSave(response.data);

          // Exit editing mode
          setIsEditing(false);
          toast.success("Cập nhật thông tin bác sĩ thành công");
        } else {
          setApiError(
            response.message || "Không thể cập nhật thông tin bác sĩ"
          );
        }
      } catch (err) {
        setApiError(
          err.message || "Có lỗi xảy ra khi cập nhật thông tin bác sĩ"
        );
        console.error("Error updating doctor:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      setIsLoading(true);
      setApiError("");

      const newStatus = !formData.isActive;
      const response = await managerDoctorService.updateDoctorStatus(
        doctor.id,
        newStatus
      );

      if (response.success) {
        // Update local state
        setFormData({ ...formData, isActive: newStatus });

        // Pass updated data back to parent
        onSave(response.data);

        toast.success(
          newStatus
            ? "Bác sĩ đã được kích hoạt thành công"
            : "Bác sĩ đã được vô hiệu hóa thành công"
        );
      } else {
        setApiError(response.message || "Không thể thay đổi trạng thái bác sĩ");
      }
    } catch (err) {
      setApiError(
        err.message || "Có lỗi xảy ra khi thay đổi trạng thái bác sĩ"
      );
      console.error("Error toggling doctor status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setIsEditing(false);
    setActiveTab("info"); // Reset to info tab when closing
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Chỉnh sửa thông tin bác sĩ" : "Chi tiết bác sĩ"}
          </h2>
                    <button
                      onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "info"
                ? "border-b-2 border-primary-500 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "schedule"
                ? "border-b-2 border-primary-500 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            Lịch làm việc
          </button>
                </div>

        {/* API Error message */}
        {apiError && (
          <div className="bg-red-50 text-red-700 p-3 mx-6 mt-4 rounded-md">
            <p>{apiError}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {activeTab === "info" && (
            <div>
              {/* Doctor info content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Basic info */}
                <div>
                  <div className="mb-4 flex items-center">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 mr-4">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt={formData.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary-100">
                          <span className="text-3xl text-primary-600">
                            {formData.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                      <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isEditing ? (
                        <input
                          type="text"
                          name="name"
                            value={formData.name || ""}
                          onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md ${
                              errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        ) : (
                          formData.name
                        )}
                      </h3>
                        {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formData.degree ? formData.degree : ""}{" "}
                        {formData.specialty ? `- ${formData.specialty}` : ""}
                      </p>
                      <div
                        className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          formData.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formData.isActive
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                      </div>
                    </div>
                      </div>

                  {isEditing && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL hình ảnh
                        </label>
                        <input
                        type="text"
                        name="avatarUrl"
                        value={formData.avatarUrl || ""}
                          onChange={handleInputChange}
                        className="w-full p-2 border rounded-md border-gray-300"
                        placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                        )}

                  <div className="space-y-4">
                      <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Thông tin liên hệ
                      </h4>
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-gray-500">Email:</span>
                          <span className="text-sm text-gray-900">
                            {formData.email}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-gray-500">
                            Số điện thoại:
                          </span>
                          <span className="text-sm text-gray-900">
                            {isEditing ? (
                        <input
                                type="text"
                          name="phone"
                                value={formData.phone || ""}
                          onChange={handleInputChange}
                                className={`w-full p-1 border rounded-md ${
                                  errors.phone
                                    ? "border-red-500"
                                    : "border-gray-300"
                          }`}
                        />
                            ) : (
                              formData.phone
                            )}
                          </span>
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-gray-500">
                            Địa chỉ:
                          </span>
                          <span className="text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                type="text"
                                name="address"
                                value={formData.address || ""}
                                onChange={handleInputChange}
                                className="w-full p-1 border rounded-md border-gray-300"
                              />
                            ) : (
                              formData.address || "N/A"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Ngày tham gia
                      </h4>
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-gray-500">
                            Ngày tham gia:
                          </span>
                          <span className="text-sm text-gray-900">
                            {formatDate(formData.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Professional info */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Thông tin chuyên môn
                  </h3>
                  <div className="space-y-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chuyên khoa
                      </label>
                      {isEditing ? (
                        <div>
                          <select
                            name="specialty"
                            value={formData.specialty || ""}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md ${
                              errors.specialty
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Chọn chuyên khoa</option>
                            {specialties.map((specialty) => (
                              <option key={specialty} value={specialty}>
                                {specialty}
                              </option>
                            ))}
                          </select>
                          {errors.specialty && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.specialty}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {formData.specialty || "N/A"}
                        </p>
                      )}
                      </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Học vị
                      </label>
                      {isEditing ? (
                        <select
                          name="degree"
                          value={formData.degree || ""}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md border-gray-300"
                        >
                          <option value="">Chọn học vị</option>
                          {degrees.map((degree) => (
                            <option key={degree} value={degree}>
                              {degree}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900">
                          {formData.degree || "N/A"}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số năm kinh nghiệm
                      </label>
                      {isEditing ? (
                      <div>
                          <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears || ""}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full p-2 border rounded-md ${
                              errors.experienceYears
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.experienceYears && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.experienceYears}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {formData.experienceYears
                            ? `${formData.experienceYears} năm`
                            : "N/A"}
                        </p>
                      )}
                      </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số bệnh nhân tối đa mỗi ngày
                      </label>
                      {isEditing ? (
                      <div>
                          <input
                            type="number"
                            name="maxPatientsPerDay"
                            value={formData.maxPatientsPerDay || ""}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full p-2 border rounded-md ${
                              errors.maxPatientsPerDay
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.maxPatientsPerDay && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.maxPatientsPerDay}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-900">
                          {formData.maxPatientsPerDay || "N/A"}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiểu sử
                      </label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio || ""}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full p-2 border rounded-md border-gray-300"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.bio || "N/A"}</p>
                      )}
                    </div>
                  </div>
                </div>
                      </div>

              {/* Action buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <Button
                      color="secondary"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Hủy
                    </Button>
                    <Button
                      color="primary"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </>
                ) : (
                  <>
                      <Button
                      color="secondary"
                      onClick={handleToggleStatus}
                      disabled={isLoading}
                      >
                      {isLoading
                        ? "Đang xử lý..."
                        : formData.isActive
                        ? "Vô hiệu hóa"
                        : "Kích hoạt"}
                      </Button>
                      <Button
                      color="primary"
                        onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      >
                        Chỉnh sửa
                      </Button>
                  </>
                )}
                    </div>
                  </div>
                )}

          {activeTab === "schedule" && (
            <div>
              <DoctorScheduleManager
                doctor={doctor}
                onSchedulesChanged={() => {
                  // When schedules are changed, we should notify the parent
                  if (onSave) {
                    onSave(doctor);
                  }
                }}
              />
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal; 
